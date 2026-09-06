import { Router, Request, Response } from 'express';
import { query } from '../db/pg';
import { requireAuth } from '../middleware/auth';
import {
  formatStudentProfile,
  formatSkill,
  formatProject,
  formatExperience,
  formatCertification,
  formatSemesterDetail,
} from '../utils/formatters';
import { generateAndSaveNextSteps } from '../services/recommendationEngine';
import { generateSemesterAwareFocusPillars, detectTrackKey, getStageLabel } from '../services/focusPillarsEngine';
import { createStudentNotification, recordStudentActivity } from '../utils/notify';
import { recalculateAndPersistReadiness } from '../utils/readinessCalculator';

const router = Router();

function formatTimeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
}

const DEFAULT_ACHIEVEMENTS = [
  { key: 'first_skill', title: 'First Skill Added', description: 'Add your first technical skill to your Campus OS passport.', iconName: 'Code' },
  { key: 'profile_initiated', title: 'Profile Initiated', description: 'Complete initial student profile details and university degree setup.', iconName: 'Target' },
  { key: 'project_showcase', title: 'Project Showcase', description: 'Add a verified project with repository link to your portfolio.', iconName: 'Microscope' },
  { key: 'ai_track', title: 'Career Milestone Set', description: 'Define your target career engineering track and roadmap.', iconName: 'Trophy' },
  { key: 'experience_added', title: 'Experience Verified', description: 'Log a formal internship, research, or work experience.', iconName: 'Award' },
  { key: 'high_readiness', title: 'Career Ready 80%+', description: 'Attain an overall career readiness index of 80% or higher.', iconName: 'Sparkles' },
];

// ==========================================
// 1. GET STUDENT FULL PROFILE & DATA
// ==========================================
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;

    // Update last_active_at
    await query(`UPDATE users SET last_active_at = NOW() WHERE id = $1`, [studentId]).catch(() => {});

    const profileRes = await query(`SELECT * FROM student_profiles WHERE id = $1`, [studentId]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    const [skills, projects, experiences, certs, semesters, notifs, activities, achievements, skillGrowth, roadmap] = await Promise.all([
      query(`SELECT * FROM skills WHERE student_id = $1 ORDER BY percentage DESC`, [studentId]),
      query(`SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]),
      query(`SELECT * FROM experiences WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]),
      query(`SELECT * FROM certifications WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]),
      query(`SELECT * FROM semester_details WHERE student_id = $1 ORDER BY semester ASC`, [studentId]),
      query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`, [studentId]),
      query(`SELECT * FROM student_activities WHERE student_id = $1 ORDER BY created_at DESC LIMIT 15`, [studentId]),
      query(`SELECT * FROM achievements WHERE student_id = $1 ORDER BY created_at ASC`, [studentId]),
      query(`SELECT * FROM skill_growth_history WHERE student_id = $1 ORDER BY year ASC, created_at ASC`, [studentId]),
      query(`SELECT * FROM roadmap_tasks WHERE student_id = $1 ORDER BY number ASC, created_at ASC`, [studentId]),
    ]);

    const formattedProfile = formatStudentProfile(profileRes.rows[0], req.user!.email);

    return res.json({
      success: true,
      data: {
        ...formattedProfile,
        skills: skills.rows.map(formatSkill),
        projects: projects.rows.map(formatProject),
        experiences: experiences.rows.map(formatExperience),
        certifications: certs.rows.map(formatCertification),
        semesterDetails: semesters.rows.map(formatSemesterDetail),
        notifications: notifs.rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          message: r.message,
          time: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          unread: r.unread,
          type: r.type,
        })),
        recentActivities: activities.rows.map((a: any) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          target: a.target,
          timeAgo: formatTimeAgo(a.created_at),
        })),
        achievements: achievements.rows.map((ach: any) => ({
          id: ach.id,
          key: ach.achievement_key,
          title: ach.title,
          description: ach.description,
          iconName: ach.icon_name,
          status: ach.status,
          earnedDate: ach.earned_date,
        })),
        skillGrowth: skillGrowth.rows.map((sg: any) => ({
          month: sg.month,
          points: sg.points,
        })),
        roadmapTasks:
          roadmap.rows.length > 0
            ? roadmap.rows.map((rt: any) => ({
                id: rt.id,
                number: rt.number,
                title: rt.title,
                category: rt.category,
                priority: rt.priority,
                estimatedTime: rt.estimated_time,
                actionType: rt.action_type,
                status: rt.status,
                source: rt.source,
              }))
            : await generateAndSaveNextSteps(studentId),
      },
    });
  } catch (error: any) {
    console.error('Get student profile error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to get student profile' });
  }
});

// ==========================================
// 2. UPDATE STUDENT PROFILE
// ==========================================
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const body = req.body;

    const fieldMap: Record<string, string> = {
      name: 'name',
      degree: 'degree',
      semester: 'semester',
      totalSemesters: 'total_semesters',
      completedSemesters: 'completed_semesters',
      university: 'university',
      careerGoal: 'career_goal',
      gpa: 'gpa',
      profileCompletion: 'profile_completion',
      careerReadiness: 'career_readiness',
      creditsCompleted: 'credits_completed',
      totalCredits: 'total_credits',
      academicStanding: 'academic_standing',
      avatar: 'avatar',
      location: 'location',
      headline: 'headline',
      aboutMe: 'about_me',
      educationDates: 'education_dates',
      relevantCoursework: 'relevant_coursework',
      notificationPreferences: 'notification_preferences',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
      if (body[jsKey] !== undefined) {
        let val = body[jsKey];
        if (dbCol === 'notification_preferences' && typeof val === 'object') {
          val = JSON.stringify(val);
        }
        setClauses.push(`${dbCol} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      const current = await query(`SELECT * FROM student_profiles WHERE id = $1`, [studentId]);
      return res.json({
        success: true,
        data: formatStudentProfile(current.rows[0], req.user!.email),
      });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(studentId);

    const updateQuery = `
      UPDATE student_profiles
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    // Automatically recalculate profile completion based on populated fields
    const p = result.rows[0];
    let calculatedCompletion = 20;
    if (p.avatar && p.avatar.trim().length > 0) calculatedCompletion += 10;
    if (p.name && p.degree && p.university) calculatedCompletion += 20;
    if (p.headline && p.headline.trim().length > 0) calculatedCompletion += 10;
    if (p.about_me && p.about_me.trim().length > 0) calculatedCompletion += 15;
    if (p.relevant_coursework && Array.isArray(p.relevant_coursework) && p.relevant_coursework.length > 0) calculatedCompletion += 15;
    if (Number(p.gpa) > 0) calculatedCompletion += 10;
    calculatedCompletion = Math.min(100, calculatedCompletion);

    if (calculatedCompletion !== p.profile_completion && body.profileCompletion === undefined) {
      await query(`UPDATE student_profiles SET profile_completion = $1 WHERE id = $2`, [calculatedCompletion, studentId]);
      result.rows[0].profile_completion = calculatedCompletion;
    }

    // Record activity and notification
    await recordStudentActivity(studentId, 'updated', 'Profile Updated', 'Student Profile Information');
    await createStudentNotification(
      studentId,
      'Profile Updated',
      'Your academic profile and career preferences have been synchronized.',
      'profile'
    );
    await recalculateAndPersistReadiness(studentId);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: formatStudentProfile(result.rows[0], req.user!.email),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update profile' });
  }
});

// ==========================================
// 2.2. UPDATE NOTIFICATION PREFERENCES
// ==========================================
router.put('/preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { opportunityAlerts, aiRecommendations, advisingAlerts, emailAlerts } = req.body;

    const preferences = {
      opportunityAlerts: opportunityAlerts ?? true,
      aiRecommendations: aiRecommendations ?? true,
      advisingAlerts: advisingAlerts ?? true,
      emailAlerts: emailAlerts ?? true,
    };

    const result = await query(
      `UPDATE student_profiles
       SET notification_preferences = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING notification_preferences`,
      [JSON.stringify(preferences), studentId]
    );

    return res.json({
      success: true,
      message: 'Notification preferences updated successfully!',
      data: result.rows[0]?.notification_preferences || preferences,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update preferences' });
  }
});

// ==========================================
// 2.5. SAVE FULL ONBOARDING DATA (ONE-STOP)
// ==========================================
router.post('/onboarding', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const {
      degree,
      university,
      semester,
      totalSemesters = 8,
      completedSemesters = 0,
      careerGoal,
      skills = [],
      headline,
      aboutMe,
      location,
      gpa,
      educationDates,
      relevantCoursework = [],
      semesterDetails = [],
      projects = [],
      experiences = [],
      careerReadiness = 75,
      nextSteps = [],
      strategicAdvice,
      criticalSkillGaps = [],
    } = req.body;

    const numGPA = parseFloat(gpa) || 3.5;
    const standing = numGPA >= 3.5 ? "Dean's Honor List" : numGPA >= 3.0 ? 'Good Standing' : 'Academic Probation';

    // 1. Update student profile
    const updateProfileQuery = `
      UPDATE student_profiles
      SET
        degree = COALESCE($1, degree),
        university = COALESCE($2, university),
        semester = COALESCE($3, semester),
        total_semesters = COALESCE($4, total_semesters),
        completed_semesters = COALESCE($5, completed_semesters),
        career_goal = COALESCE($6, career_goal),
        headline = COALESCE($7, headline),
        about_me = COALESCE($8, about_me),
        location = COALESCE($9, location),
        gpa = COALESCE($10, gpa),
        education_dates = COALESCE($11, education_dates),
        relevant_coursework = COALESCE($12, relevant_coursework),
        career_readiness = COALESCE($13, career_readiness),
        profile_completion = 95,
        academic_standing = $14,
        advisor_notes = COALESCE($15, advisor_notes),
        onboarding_status = 'Completed',
        updated_at = NOW()
      WHERE id = $16
      RETURNING *;
    `;

    const profileRes = await query(updateProfileQuery, [
      degree,
      university,
      Number(semester) || 1,
      Number(totalSemesters) || 8,
      Number(completedSemesters) || 0,
      careerGoal,
      headline,
      aboutMe,
      location,
      numGPA,
      educationDates,
      relevantCoursework,
      Number(careerReadiness) || 75,
      standing,
      strategicAdvice || null,
      studentId,
    ]);

    // 2. Clear placeholder items and insert real skills
    if (Array.isArray(skills) && skills.length > 0) {
      await query(`DELETE FROM skills WHERE student_id = $1`, [studentId]).catch(() => {});
      for (const sk of skills) {
        if (sk && sk.name) {
          await query(
            `INSERT INTO skills (student_id, name, level, percentage, category, verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [studentId, sk.name.trim(), sk.level || 'Intermediate', Number(sk.percentage) || 70, sk.category || 'Technical', Boolean(sk.verified)]
          ).catch(() => {});
        }
      }
    }

    // 3. Insert real projects
    if (Array.isArray(projects) && projects.length > 0) {
      await query(`DELETE FROM projects WHERE student_id = $1`, [studentId]).catch(() => {});
      for (const pr of projects) {
        if (pr && pr.title) {
          const techArray = Array.isArray(pr.techStack) ? pr.techStack : ['React', 'TypeScript'];
          await query(
            `INSERT INTO projects (student_id, title, category, status, progress, description, tech_stack, github_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [studentId, pr.title.trim(), pr.category || 'Software Engineering', pr.status || 'In Progress', Number(pr.progress) || 60, pr.description || '', techArray, pr.githubUrl || '']
          ).catch(() => {});
        }
      }
    }

    // 4. Insert real experiences
    if (Array.isArray(experiences) && experiences.length > 0) {
      await query(`DELETE FROM experiences WHERE student_id = $1`, [studentId]).catch(() => {});
      for (const exp of experiences) {
        if (exp && exp.title) {
          await query(
            `INSERT INTO experiences (student_id, title, company, employment_type, period, location, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [studentId, exp.title.trim(), exp.company || 'Company', exp.employmentType || 'Internship', exp.period || '2024', exp.location || location || 'Remote', exp.description || '']
          ).catch(() => {});
        }
      }
    }

    // 5. Insert semester details
    if (Array.isArray(semesterDetails) && semesterDetails.length > 0) {
      await query(`DELETE FROM semester_details WHERE student_id = $1`, [studentId]).catch(() => {});
      for (const sem of semesterDetails) {
        if (sem && sem.semester) {
          await query(
            `INSERT INTO semester_details (student_id, semester, status, gpa, courses_count)
             VALUES ($1, $2, $3, $4, $5)`,
            [studentId, Number(sem.semester), sem.status || 'completed', Number(sem.gpa) || 0, Number(sem.coursesCount) || 5]
          ).catch(() => {});
        }
      }
    }

    // 6. Insert AI-generated next steps into roadmap_tasks
    if (Array.isArray(nextSteps) && nextSteps.length > 0) {
      await query(`DELETE FROM roadmap_tasks WHERE student_id = $1`, [studentId]).catch(() => {});
      for (const [idx, step] of nextSteps.entries()) {
        if (step && step.title) {
          await query(
            `INSERT INTO roadmap_tasks (student_id, number, title, category, priority, estimated_time, action_type, status, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ai')`,
            [
              studentId,
              step.number || `0${idx + 1}`,
              step.title.trim(),
              step.category || 'Project',
              step.priority || 'High',
              step.estimatedTime || '2 weeks',
              step.actionType || 'Build Project',
              step.status || 'pending',
            ]
          ).catch(() => {});
        }
      }
    }

    // 7. Record student activity
    await query(
      `INSERT INTO student_activities (student_id, type, title, target)
       VALUES ($1, 'completed', 'AI Onboarding Completed', 'Personalized Dashboard & Roadmap Generated')`,
      [studentId]
    ).catch(() => {});

    const formattedProfile = formatStudentProfile(profileRes.rows[0], req.user!.email);
    if (formattedProfile && strategicAdvice) {
      (formattedProfile as any).strategicAdvice = strategicAdvice;
      (formattedProfile as any).criticalSkillGaps = criticalSkillGaps;
    }

    return res.json({
      success: true,
      message: 'Onboarding completed and synchronized successfully!',
      data: formattedProfile,
    });
  } catch (error: any) {
    console.error('Save onboarding error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to save onboarding data' });
  }
});

// ==========================================
// 3. SKILLS CRUD
// ==========================================
router.get('/skills', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const result = await query(`SELECT * FROM skills WHERE student_id = $1 ORDER BY percentage DESC`, [studentId]);
    return res.json({ success: true, data: result.rows.map(formatSkill) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/skills', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { name, level = 'Intermediate', percentage = 50, category = 'Technical', verified = false } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Skill name is required.' });
    }

    const result = await query(
      `INSERT INTO skills (student_id, name, level, percentage, category, verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [studentId, name.trim(), level, Number(percentage) || 50, category, verified]
    );

    // Record activity, notification, and update readiness
    await recordStudentActivity(studentId, 'added', 'Added Technical Skill', name.trim());
    await createStudentNotification(
      studentId,
      'Technical Skill Added',
      `Added ${name.trim()} (${level}) to your verified skills portfolio.`,
      'profile'
    );
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.status(201).json({
      success: true,
      data: formatSkill(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/skills/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;
    const { name, level, percentage, category, verified } = req.body;

    const result = await query(
      `UPDATE skills
       SET name = COALESCE($1, name),
           level = COALESCE($2, level),
           percentage = COALESCE($3, percentage),
           category = COALESCE($4, category),
           verified = COALESCE($5, verified)
       WHERE id = $6 AND student_id = $7
       RETURNING *`,
      [name, level, percentage, category, verified, id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Skill not found.' });
    }

    if (name) {
      await recordStudentActivity(studentId, 'updated', 'Updated Skill', name.trim());
    }
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.json({
      success: true,
      data: formatSkill(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/skills/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;

    const result = await query(`DELETE FROM skills WHERE id = $1 AND student_id = $2 RETURNING id, name`, [id, studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Skill not found.' });
    }

    await recalculateAndPersistReadiness(studentId);

    return res.json({ success: true, message: 'Skill deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. PROJECTS CRUD
// ==========================================
router.get('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const result = await query(`SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]);
    return res.json({ success: true, data: result.rows.map(formatProject) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { title, category = 'AI/ML', status = 'In Progress', progress = 0, description, techStack = [], githubUrl } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Project title is required.' });
    }

    const result = await query(
      `INSERT INTO projects (student_id, title, category, status, progress, description, tech_stack, github_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [studentId, title.trim(), category, status, Number(progress) || 0, description, techStack, githubUrl]
    );

    // Record activity, notification, and update readiness
    await recordStudentActivity(studentId, 'added', 'Created New Project', title.trim());
    await createStudentNotification(
      studentId,
      'Project Showcase Added',
      `Added verified project "${title.trim()}" [${category}]. Career readiness increased!`,
      'profile'
    );
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.status(201).json({
      success: true,
      data: formatProject(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;
    const { title, category, status, progress, description, techStack, githubUrl } = req.body;

    const result = await query(
      `UPDATE projects
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           status = COALESCE($3, status),
           progress = COALESCE($4, progress),
           description = COALESCE($5, description),
           tech_stack = COALESCE($6, tech_stack),
           github_url = COALESCE($7, github_url),
           updated_at = NOW()
       WHERE id = $8 AND student_id = $9
       RETURNING *`,
      [title, category, status, progress, description, techStack, githubUrl, id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    if (title) {
      await recordStudentActivity(studentId, 'updated', 'Updated Project', title.trim());
    }
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.json({
      success: true,
      data: formatProject(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;

    const result = await query(`DELETE FROM projects WHERE id = $1 AND student_id = $2 RETURNING id`, [id, studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    await recalculateAndPersistReadiness(studentId);

    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. EXPERIENCES CRUD
// ==========================================
router.get('/experiences', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const result = await query(`SELECT * FROM experiences WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]);
    return res.json({ success: true, data: result.rows.map(formatExperience) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/experiences', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { title, company, employmentType = 'Internship', period, location = 'Remote', description } = req.body;

    if (!title || !company || !period) {
      return res.status(400).json({ success: false, error: 'Title, company, and period are required.' });
    }

    const result = await query(
      `INSERT INTO experiences (student_id, title, company, employment_type, period, location, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [studentId, title.trim(), company.trim(), employmentType, period, location, description]
    );

    // Record activity, notification, and recalculate readiness
    await recordStudentActivity(studentId, 'added', 'Added Experience / Role', `${title.trim()} at ${company.trim()}`);
    await createStudentNotification(
      studentId,
      'Experience Verified',
      `Logged professional experience: ${title.trim()} at ${company.trim()}.`,
      'profile'
    );
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.status(201).json({
      success: true,
      data: formatExperience(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/experiences/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;

    const result = await query(`DELETE FROM experiences WHERE id = $1 AND student_id = $2 RETURNING id`, [id, studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Experience item not found.' });
    }

    await recalculateAndPersistReadiness(studentId);

    return res.json({ success: true, message: 'Experience item deleted.' });

    return res.json({ success: true, message: 'Experience item deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. ONBOARDING WIZARD SAVE
// ==========================================
router.post('/onboarding', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const {
      degree,
      university,
      semester,
      totalSemesters = 8,
      careerGoal,
      skills = [],
      headline,
      aboutMe,
      location,
      gpa,
      educationDates,
      relevantCoursework = [],
      semesterDetails = [],
      projects = [],
      experiences = [],
      careerReadiness,
    } = req.body;

    const currentSem = Number(semester) || 1;
    const numSemestersTotal = Number(totalSemesters) || 8;
    const completedSems = Math.max(0, currentSem - 1);
    const numGpa = parseFloat(gpa) || 3.5;
    const academicStanding = numGpa >= 3.5 ? "Dean's Honor List" : numGpa >= 3.0 ? 'Good Standing' : 'Academic Probation';
    const creditsCompleted = completedSems * 17;

    // Update student profile with all collected onboarding fields
    await query(
      `UPDATE student_profiles
       SET
         degree = COALESCE($1, degree),
         university = COALESCE($2, university),
         semester = COALESCE($3, semester),
         total_semesters = COALESCE($4, total_semesters),
         completed_semesters = COALESCE($5, completed_semesters),
         career_goal = COALESCE($6, career_goal),
         headline = COALESCE($7, headline),
         about_me = COALESCE($8, about_me),
         location = COALESCE($9, location),
         gpa = COALESCE($10, gpa),
         education_dates = COALESCE($11, education_dates),
         relevant_coursework = COALESCE($12, relevant_coursework),
         credits_completed = COALESCE($13, credits_completed),
         academic_standing = COALESCE($14, academic_standing),
         onboarding_status = 'Completed',
         profile_completion = 95,
         career_readiness = COALESCE($15, career_readiness),
         updated_at = NOW()
       WHERE id = $16`,
      [
        degree,
        university,
        currentSem,
        numSemestersTotal,
        completedSems,
        careerGoal,
        headline,
        aboutMe,
        location,
        numGpa,
        educationDates,
        relevantCoursework,
        creditsCompleted,
        academicStanding,
        careerReadiness ? Number(careerReadiness) : 75,
        studentId,
      ]
    );

    // Save student's actual semester details and GPAs
    if (Array.isArray(semesterDetails) && semesterDetails.length > 0) {
      for (const sem of semesterDetails) {
        const semNum = Number(sem.semester);
        if (semNum >= 1 && semNum <= 12) {
          const semStatus = sem.status || (semNum < currentSem ? 'completed' : semNum === currentSem ? 'current' : 'upcoming');
          const semGpa = sem.gpa !== undefined && sem.gpa !== null && sem.gpa !== '' ? Number(sem.gpa) : null;
          await query(
            `INSERT INTO semester_details (student_id, semester, status, gpa, courses_count)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (student_id, semester)
             DO UPDATE SET
               status = EXCLUDED.status,
               gpa = EXCLUDED.gpa,
               courses_count = EXCLUDED.courses_count`,
            [
              studentId,
              semNum,
              semStatus,
              semGpa,
              Number(sem.coursesCount) || 5,
            ]
          );
        }
      }
    } else {
      // Auto-generate semesters 1..8 with real student data
      for (let s = 1; s <= 8; s++) {
        const status = s < currentSem ? 'completed' : s === currentSem ? 'current' : 'upcoming';
        const semGpa = s < currentSem ? numGpa : s === currentSem ? numGpa : null;
        await query(
          `INSERT INTO semester_details (student_id, semester, status, gpa, courses_count)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (student_id, semester)
           DO UPDATE SET
             status = EXCLUDED.status,
             gpa = EXCLUDED.gpa,
             courses_count = EXCLUDED.courses_count`,
          [studentId, s, status, semGpa, 5]
        );
      }
    }

    // Save technical and professional skills
    if (Array.isArray(skills) && skills.length > 0) {
      for (const skill of skills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        if (skillName && skillName.trim()) {
          await query(
            `INSERT INTO skills (student_id, name, level, percentage, category, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [
              studentId,
              skillName.trim(),
              skill.level || 'Intermediate',
              skill.percentage || 70,
              skill.category || 'Core Skill',
              Boolean(skill.verified),
            ]
          );
        }
      }
    }

    // Save projects from onboarding
    if (Array.isArray(projects) && projects.length > 0) {
      for (const proj of projects) {
        if (proj && proj.title && proj.title.trim()) {
          const techStack = Array.isArray(proj.techStack)
            ? proj.techStack
            : typeof proj.techStack === 'string'
            ? proj.techStack.split(',').map((t: string) => t.trim()).filter(Boolean)
            : ['Software Development'];

          await query(
            `INSERT INTO projects (student_id, title, category, status, progress, description, tech_stack, github_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              studentId,
              proj.title.trim(),
              proj.category || 'Software Engineering',
              proj.status || 'In Progress',
              Number(proj.progress) || (proj.status === 'Completed' ? 100 : 70),
              proj.description || 'Project created during academic coursework.',
              techStack,
              proj.githubUrl || '',
            ]
          );
        }
      }
    }

    // Save work & internship experiences from onboarding
    if (Array.isArray(experiences) && experiences.length > 0) {
      for (const exp of experiences) {
        if (exp && exp.title && exp.company && exp.title.trim() && exp.company.trim()) {
          await query(
            `INSERT INTO experiences (student_id, title, company, employment_type, period, location, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              studentId,
              exp.title.trim(),
              exp.company.trim(),
              exp.employmentType || 'Internship',
              exp.period || '2024 - Present',
              exp.location || location || 'Remote / Pakistan',
              exp.description || 'Role and contributions during academic career.',
            ]
          );
        }
      }
    }

    // Seed default starter achievements if not existing
    for (const ach of DEFAULT_ACHIEVEMENTS) {
      await query(
        `INSERT INTO achievements (student_id, achievement_key, title, description, icon_name, status)
         VALUES ($1, $2, $3, $4, $5, 'Locked')
         ON CONFLICT (student_id, achievement_key) DO NOTHING`,
        [studentId, ach.key, ach.title, ach.description, ach.iconName]
      );
    }

    // Mark 'profile_initiated' as completed
    await query(
      `UPDATE achievements
       SET status = 'Completed', earned_date = to_char(NOW(), 'Mon YYYY')
       WHERE student_id = $1 AND achievement_key = 'profile_initiated'`,
      [studentId]
    );

    // Seed initial skill growth progression
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    const currentYear = new Date().getFullYear();
    await query(
      `INSERT INTO skill_growth_history (student_id, month, year, points)
       VALUES ($1, $2, $3, 100)
       ON CONFLICT (student_id, month, year) DO UPDATE SET points = 100`,
      [studentId, currentMonth, currentYear]
    );

    // Record welcome activity
    await query(
      `INSERT INTO student_activities (student_id, type, title, target)
       VALUES ($1, 'milestone', 'Completed Onboarding', 'Campus OS Career Passport')`,
      [studentId]
    );

    // Generate and save authentic next steps to roadmap_tasks
    await generateAndSaveNextSteps(studentId, req.body.nextSteps || req.body.roadmapTasks).catch(() => {});

    return res.json({
      success: true,
      message: 'Onboarding completed and profile personalized successfully.',
    });
  } catch (error: any) {
    console.error('Onboarding save error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to complete onboarding' });
  }
});

// ==========================================
// 7. CERTIFICATIONS CRUD
// ==========================================
router.get('/certifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const result = await query(`SELECT * FROM certifications WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]);
    return res.json({ success: true, data: result.rows.map(formatCertification) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/certifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { title, organization, date, certificateLink, credentialId } = req.body;

    if (!title || !organization || !date) {
      return res.status(400).json({ success: false, error: 'Title, organization, and date are required.' });
    }

    const result = await query(
      `INSERT INTO certifications (student_id, title, organization, date, certificate_link, credential_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [studentId, title.trim(), organization.trim(), date, certificateLink, credentialId]
    );

    // Record activity, notification, and recalculate readiness
    await recordStudentActivity(studentId, 'added', 'Added Credential', `${title.trim()} (${organization.trim()})`);
    await createStudentNotification(
      studentId,
      'Certification Recorded',
      `Earned verified credential: ${title.trim()} from ${organization.trim()}.`,
      'profile'
    );
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.status(201).json({
      success: true,
      data: formatCertification(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/certifications/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;
    const { title, organization, date, certificateLink, credentialId } = req.body;

    const result = await query(
      `UPDATE certifications
       SET title = COALESCE($1, title),
           organization = COALESCE($2, organization),
           date = COALESCE($3, date),
           certificate_link = COALESCE($4, certificate_link),
           credential_id = COALESCE($5, credential_id)
       WHERE id = $6 AND student_id = $7
       RETURNING *`,
      [title, organization, date, certificateLink, credentialId, id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Certification not found.' });
    }

    if (title) {
      await recordStudentActivity(studentId, 'updated', 'Updated Credential', title.trim());
    }
    const updatedReadiness = await recalculateAndPersistReadiness(studentId);

    return res.json({
      success: true,
      data: formatCertification(result.rows[0]),
      careerReadiness: updatedReadiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/certifications/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;

    const result = await query(`DELETE FROM certifications WHERE id = $1 AND student_id = $2 RETURNING id`, [id, studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Certification not found.' });
    }

    await recalculateAndPersistReadiness(studentId);

    return res.json({ success: true, message: 'Certification deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 8. SEMESTER DETAILS UPDATE
// ==========================================
router.put('/semesters/:semester', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const semesterNum = Number(req.params.semester);
    const { status, gpa, coursesCount } = req.body;

    const result = await query(
      `INSERT INTO semester_details (student_id, semester, status, gpa, courses_count)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, semester)
       DO UPDATE SET
         status = COALESCE(EXCLUDED.status, semester_details.status),
         gpa = COALESCE(EXCLUDED.gpa, semester_details.gpa),
         courses_count = COALESCE(EXCLUDED.courses_count, semester_details.courses_count)
       RETURNING *`,
      [studentId, semesterNum, status || 'completed', gpa, coursesCount || 5]
    );

    return res.json({ success: true, data: formatSemesterDetail(result.rows[0]) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. STUDENT ACTIVITIES
// ==========================================
router.get('/activities', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const result = await query(
      `SELECT * FROM student_activities WHERE student_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [studentId]
    );

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      target: r.target,
      timeAgo: formatTimeAgo(r.created_at),
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/activities', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { type = 'updated', title, target } = req.body;

    if (!title || !target) {
      return res.status(400).json({ success: false, error: 'Title and target are required.' });
    }

    const result = await query(
      `INSERT INTO student_activities (student_id, type, title, target)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [studentId, type, title.trim(), target.trim()]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        type: result.rows[0].type,
        title: result.rows[0].title,
        target: result.rows[0].target,
        timeAgo: 'Just now',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 10. ACHIEVEMENTS
// ==========================================
router.get('/achievements', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    let result = await query(`SELECT * FROM achievements WHERE student_id = $1 ORDER BY created_at ASC`, [studentId]);

    // If no achievements exist, populate defaults
    if (result.rows.length === 0) {
      for (const ach of DEFAULT_ACHIEVEMENTS) {
        await query(
          `INSERT INTO achievements (student_id, achievement_key, title, description, icon_name, status)
           VALUES ($1, $2, $3, $4, $5, 'Locked')
           ON CONFLICT DO NOTHING`,
          [studentId, ach.key, ach.title, ach.description, ach.iconName]
        );
      }
      result = await query(`SELECT * FROM achievements WHERE student_id = $1 ORDER BY created_at ASC`, [studentId]);
    }

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      key: r.achievement_key,
      title: r.title,
      description: r.description,
      iconName: r.icon_name,
      status: r.status,
      earnedDate: r.earned_date,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/achievements/unlock', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ success: false, error: 'Achievement key is required.' });
    }

    const earnedDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    let result = await query(
      `UPDATE achievements
       SET status = 'Completed', earned_date = $1
       WHERE student_id = $2 AND achievement_key = $3
       RETURNING *`,
      [earnedDate, studentId, key]
    );

    if (result.rows.length === 0) {
      const def = DEFAULT_ACHIEVEMENTS.find((a) => a.key === key);
      if (def) {
        result = await query(
          `INSERT INTO achievements (student_id, achievement_key, title, description, icon_name, status, earned_date)
           VALUES ($1, $2, $3, $4, $5, 'Completed', $6)
           ON CONFLICT (student_id, achievement_key)
           DO UPDATE SET status = 'Completed', earned_date = EXCLUDED.earned_date
           RETURNING *`,
          [studentId, def.key, def.title, def.description, def.iconName, earnedDate]
        );
      }
    }

    if (result && result.rows.length > 0) {
      await recordStudentActivity(studentId, 'milestone', 'Achievement Unlocked', result.rows[0].title);
      await createStudentNotification(
        studentId,
        'Achievement Unlocked! 🏆',
        `You have unlocked the "${result.rows[0].title}" badge! Check your passport achievements.`,
        'achievement'
      );
    }

    return res.json({ success: true, data: result?.rows[0] || null });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 11. SKILL GROWTH HISTORY
// ==========================================
router.get('/skill-growth', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const result = await query(
      `SELECT * FROM skill_growth_history WHERE student_id = $1 ORDER BY year ASC, created_at ASC`,
      [studentId]
    );

    if (result.rows.length === 0) {
      // Return a gentle default monthly progression for the student based on current skills
      const skillCountRes = await query(`SELECT COUNT(*) FROM skills WHERE student_id = $1`, [studentId]);
      const count = Number(skillCountRes.rows[0]?.count) || 1;
      const basePoints = Math.max(80, count * 25);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const defaultGrowth = months.map((m, idx) => ({
        month: m,
        points: Math.min(320, basePoints + idx * 25),
      }));

      return res.json({ success: true, data: defaultGrowth });
    }

    return res.json({
      success: true,
      data: result.rows.map((r: any) => ({
        month: r.month,
        points: r.points,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/skill-growth', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { month, year = new Date().getFullYear(), points } = req.body;

    if (!month || points === undefined) {
      return res.status(400).json({ success: false, error: 'Month and points are required.' });
    }

    const result = await query(
      `INSERT INTO skill_growth_history (student_id, month, year, points)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, month, year)
       DO UPDATE SET points = EXCLUDED.points
       RETURNING *`,
      [studentId, month, year, Number(points)]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 12. ROADMAP TASKS & FOCUS PILLARS
// ==========================================

// Helper to detect career track
function detectStudentTrack(goal?: string, degree?: string): 'ai' | 'fullstack' | 'cloud' | 'cybersecurity' | 'data' | 'general' {
  const combined = `${goal || ''} ${degree || ''}`.toLowerCase();
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('vision') || combined.includes('nlp')) {
    return 'ai';
  }
  if (combined.includes('cloud') || combined.includes('devops') || combined.includes('sre') || combined.includes('infrastructure')) {
    return 'cloud';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('hack') || combined.includes('infosec')) {
    return 'cybersecurity';
  }
  if (combined.includes('data') || combined.includes('analytics') || combined.includes('bi')) {
    return 'data';
  }
  if (combined.includes('web') || combined.includes('full stack') || combined.includes('frontend') || combined.includes('backend') || combined.includes('software')) {
    return 'fullstack';
  }
  return 'general';
}

// ==========================================
// GET DYNAMIC SEMESTER-AWARE FOCUS PILLARS
// ==========================================
router.get('/roadmap/focus-pillars', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const profRes = await query(
      `SELECT name, career_goal, degree, semester, gpa, university, relevant_coursework FROM student_profiles WHERE id = $1`,
      [studentId]
    );
    const prof = profRes.rows[0] || {};
    const semester = Number(prof.semester) || 1;
    const careerGoal = prof.career_goal || prof.degree || 'Software Engineering';

    const [skillsRes, projectsRes] = await Promise.all([
      query(`SELECT name, level FROM skills WHERE student_id = $1`, [studentId]),
      query(`SELECT title, category FROM projects WHERE student_id = $1`, [studentId]),
    ]);

    const result = await generateSemesterAwareFocusPillars({
      name: prof.name || 'Student',
      degree: prof.degree || 'BS Computer Science',
      semester,
      gpa: Number(prof.gpa) || 3.5,
      careerGoal,
      university: prof.university || 'FAST NUCES',
      skills: skillsRes.rows || [],
      projects: projectsRes.rows || [],
      relevantCoursework: prof.relevant_coursework || [],
    });

    return res.json({
      success: true,
      data: {
        track: detectTrackKey(careerGoal, prof.degree || ''),
        semester,
        careerGoal,
        stageLabel: result.stageLabel,
        source: result.source,
        pillars: result.pillars,
      },
    });
  } catch (error: any) {
    console.error('Focus pillars error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// REGENERATE / RECALIBRATE FOCUS PILLARS ON-DEMAND
// ==========================================
router.post('/roadmap/focus-pillars/regenerate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const profRes = await query(
      `SELECT name, career_goal, degree, semester, gpa, university, relevant_coursework FROM student_profiles WHERE id = $1`,
      [studentId]
    );
    const prof = profRes.rows[0] || {};
    const semester = Number(prof.semester) || 1;
    const careerGoal = prof.career_goal || prof.degree || 'Software Engineering';

    const [skillsRes, projectsRes] = await Promise.all([
      query(`SELECT name, level FROM skills WHERE student_id = $1`, [studentId]),
      query(`SELECT title, category FROM projects WHERE student_id = $1`, [studentId]),
    ]);

    const result = await generateSemesterAwareFocusPillars({
      name: prof.name || 'Student',
      degree: prof.degree || 'BS Computer Science',
      semester,
      gpa: Number(prof.gpa) || 3.5,
      careerGoal,
      university: prof.university || 'FAST NUCES',
      skills: skillsRes.rows || [],
      projects: projectsRes.rows || [],
      relevantCoursework: prof.relevant_coursework || [],
    });

    return res.json({
      success: true,
      data: {
        track: detectTrackKey(careerGoal, prof.degree || ''),
        semester,
        careerGoal,
        stageLabel: result.stageLabel,
        source: result.source,
        pillars: result.pillars,
      },
    });
  } catch (error: any) {
    console.error('Regenerate focus pillars error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET ROADMAP TASKS
router.get('/roadmap', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    let result = await query(
      `SELECT * FROM roadmap_tasks WHERE student_id = $1 ORDER BY number ASC, created_at ASC`,
      [studentId]
    );

    if (result.rows.length === 0) {
      const generated = await generateAndSaveNextSteps(studentId);
      return res.json({ success: true, data: generated });
    }

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      number: r.number,
      title: r.title,
      category: r.category,
      priority: r.priority,
      estimatedTime: r.estimated_time,
      actionType: r.action_type,
      status: r.status,
      source: r.source,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// REGENERATE NEXT STEPS ON-DEMAND
router.post('/roadmap/regenerate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const generated = await generateAndSaveNextSteps(studentId);
    return res.json({ success: true, data: generated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ADD ROADMAP TASK
router.post('/roadmap', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    let {
      number,
      title,
      category = 'Project',
      priority = 'Medium',
      estimatedTime = '2 weeks',
      actionType = 'Milestone',
      status = 'pending',
      source = 'manual',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    // Normalize status
    if (status === 'in_progress') status = 'in-progress';
    if (!['pending', 'in-progress', 'completed', 'skipped'].includes(status)) {
      status = 'pending';
    }

    // If number wasn't provided, calculate next number
    if (!number) {
      const countRes = await query(`SELECT COUNT(*) as count FROM roadmap_tasks WHERE student_id = $1`, [studentId]);
      const currentCount = Number(countRes.rows[0]?.count || 0);
      number = String(currentCount + 1).padStart(2, '0');
    }

    const result = await query(
      `INSERT INTO roadmap_tasks (student_id, number, title, category, priority, estimated_time, action_type, status, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [studentId, number, title.trim(), category, priority, estimatedTime, actionType, status, source]
    );

    const r = result.rows[0];
    return res.status(201).json({
      success: true,
      data: {
        id: r.id,
        number: r.number,
        title: r.title,
        category: r.category,
        priority: r.priority,
        estimatedTime: r.estimated_time,
        actionType: r.action_type,
        status: r.status,
        source: r.source,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE ROADMAP TASK
router.put('/roadmap/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;
    let { status, title, priority, estimatedTime, actionType } = req.body;

    // Normalize status
    if (status === 'in_progress') status = 'in-progress';

    const result = await query(
      `UPDATE roadmap_tasks
       SET status = COALESCE($1, status),
           title = COALESCE($2, title),
           priority = COALESCE($3, priority),
           estimated_time = COALESCE($4, estimated_time),
           action_type = COALESCE($5, action_type),
           updated_at = NOW()
       WHERE id = $6 AND student_id = $7
       RETURNING *`,
      [status, title, priority, estimatedTime, actionType, id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Roadmap task not found.' });
    }

    const updated = result.rows[0];

    // If completed, record activity, notification, and recalculate readiness
    if (status === 'completed') {
      await recordStudentActivity(studentId, 'completed', 'Completed Roadmap Milestone', updated.title);
      await createStudentNotification(
        studentId,
        'Milestone Completed! 🎯',
        `Successfully accomplished roadmap milestone: "${updated.title}". Career readiness improved!`,
        'roadmap'
      );
      await recalculateAndPersistReadiness(studentId);
    }

    return res.json({
      success: true,
      data: {
        id: updated.id,
        number: updated.number,
        title: updated.title,
        category: updated.category,
        priority: updated.priority,
        estimatedTime: updated.estimated_time,
        actionType: updated.action_type,
        status: updated.status,
        source: updated.source,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE ROADMAP TASK
router.delete('/roadmap/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;

    const result = await query(`DELETE FROM roadmap_tasks WHERE id = $1 AND student_id = $2 RETURNING id`, [id, studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Roadmap task not found.' });
    }

    return res.json({ success: true, message: 'Roadmap task deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
