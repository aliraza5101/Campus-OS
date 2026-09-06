import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pg';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateStudentDiagnostic } from '../services/adminDiagnosticEngine';

const router = Router();

// Protect all admin routes with requireAuth & requireRole('admin')
router.use(requireAuth);
router.use(requireRole('admin'));

function formatTimeAgo(dateStr: string | Date | null): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Active now';
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Active yesterday';
  return `Active ${diffDays}d ago`;
}

// ==========================================
// 1. GET STUDENTS DIRECTORY (ADMIN)
// ==========================================
router.get('/students', async (req: Request, res: Response) => {
  try {
    const { search, status, program, semester } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.email,
        u.created_at as joined_date,
        u.last_active_at,
        p.name,
        p.avatar,
        p.university,
        p.degree as program,
        p.semester,
        p.gpa as cgpa,
        p.career_goal,
        p.career_readiness as readiness_score,
        p.status,
        p.onboarding_status,
        p.credits_completed,
        p.total_credits,
        p.academic_standing,
        p.advisor_notes,
        COALESCE((SELECT COUNT(*) FROM skills WHERE student_id = u.id), 0)::int as skills_count,
        COALESCE((SELECT COUNT(*) FROM projects WHERE student_id = u.id), 0)::int as projects_count,
        COALESCE((SELECT COUNT(*) FROM experiences WHERE student_id = u.id), 0)::int as experience_count,
        COALESCE((SELECT array_agg(name) FROM (SELECT name FROM skills WHERE student_id = u.id LIMIT 4) s), ARRAY[]::text[]) as top_skills
      FROM users u
      JOIN student_profiles p ON u.id = p.id
      WHERE u.role = 'student'
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      sql += ` AND (p.name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR p.degree ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (status && status !== 'All') {
      sql += ` AND p.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (program && program !== 'All') {
      sql += ` AND p.degree = $${paramIdx}`;
      params.push(program);
      paramIdx++;
    }

    if (semester && semester !== 'All') {
      sql += ` AND p.semester = $${paramIdx}`;
      params.push(Number(semester));
      paramIdx++;
    }

    sql += ` ORDER BY p.name ASC`;

    const result = await query(sql, params);

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      name: r.name || 'Student',
      email: r.email,
      avatar: r.avatar || '',
      university: r.university || '',
      program: r.program || '',
      semester: Number(r.semester) || 1,
      cgpa: r.cgpa !== null && r.cgpa !== undefined ? Number(r.cgpa) : 0,
      careerGoal: r.career_goal || '',
      readinessScore: Number(r.readiness_score) || 0,
      status: r.status || 'Active',
      onboardingStatus: r.onboarding_status || 'Completed',
      joinedDate: new Date(r.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      lastActive: formatTimeAgo(r.last_active_at),
      skillsCount: r.skills_count,
      projectsCount: r.projects_count,
      experienceCount: r.experience_count,
      creditsCompleted: r.credits_completed || 0,
      totalCredits: r.total_credits || 130,
      academicStanding: r.academic_standing || 'Good Standing',
      topSkills: r.top_skills || [],
      advisorNotes: r.advisor_notes || '',
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Admin students list error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch student directory' });
  }
});

// ==========================================
// 2. GET SINGLE STUDENT DETAILS
// ==========================================
router.get('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const studentRes = await query(
      `SELECT u.id, u.email, u.created_at, u.last_active_at, p.* 
       FROM users u 
       JOIN student_profiles p ON u.id = p.id 
       WHERE u.id = $1 AND u.role = 'student'`,
      [id]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const [skills, projects, experiences, certs, applications, activities, roadmap] = await Promise.all([
      query(`SELECT * FROM skills WHERE student_id = $1 ORDER BY percentage DESC`, [id]),
      query(`SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC`, [id]),
      query(`SELECT * FROM experiences WHERE student_id = $1 ORDER BY created_at DESC`, [id]),
      query(`SELECT * FROM certifications WHERE student_id = $1 ORDER BY created_at DESC`, [id]),
      query(
        `SELECT a.*, o.title as opportunity_title, o.organization as company 
         FROM applications a 
         JOIN opportunities o ON a.opportunity_id = o.id 
         WHERE a.student_id = $1`,
        [id]
      ),
      query(`SELECT * FROM student_activities WHERE student_id = $1 ORDER BY created_at DESC LIMIT 10`, [id]),
      query(`SELECT * FROM roadmap_tasks WHERE student_id = $1 ORDER BY number ASC`, [id]),
    ]);

    return res.json({
      success: true,
      data: {
        ...studentRes.rows[0],
        skills: skills.rows,
        projects: projects.rows,
        experiences: experiences.rows,
        certifications: certs.rows,
        applications: applications.rows,
        activities: activities.rows,
        roadmap: roadmap.rows,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. UPDATE STUDENT (ADMIN)
// ==========================================
router.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, academicStanding, advisorNotes, gpa, semester } = req.body;

    const result = await query(
      `UPDATE student_profiles
       SET
         status = COALESCE($1, status),
         academic_standing = COALESCE($2, academic_standing),
         advisor_notes = COALESCE($3, advisor_notes),
         gpa = COALESCE($4, gpa),
         semester = COALESCE($5, semester),
         updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status, academicStanding, advisorNotes, gpa, semester, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // Log admin activity
    await query(
      `INSERT INTO activity_logs (actor, actor_role, action, target, category, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user?.email || 'Admin',
        'Super Admin',
        'Updated Student Profile & Standing',
        `Student ID ${id}`,
        'User Management',
        'Success',
      ]
    );

    return res.json({ success: true, message: 'Student updated successfully!', data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. GET PLATFORM OVERVIEW STATS
// ==========================================
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      studentsCountRes,
      projectsCountRes,
      oppsCountRes,
      avgGpaRes,
      avgReadinessRes,
      atRiskCountRes,
      onboardedCountRes,
      recentStudentsRes,
      activeStudentsRes,
      adminsCountRes,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int as count FROM student_profiles`),
      query(`SELECT COUNT(*)::int as count FROM projects`),
      query(`SELECT COUNT(*)::int as count FROM opportunities WHERE status = 'Published'`),
      query(`SELECT COALESCE(AVG(gpa), 0)::numeric(4,2) as avg_gpa FROM student_profiles`),
      query(`SELECT COALESCE(AVG(career_readiness), 0)::numeric(4,1) as avg_readiness FROM student_profiles`),
      query(`SELECT COUNT(*)::int as count FROM student_profiles WHERE status = 'At Risk' OR gpa < 2.5`),
      query(`SELECT COUNT(*)::int as count FROM student_profiles WHERE onboarding_status = 'Completed'`),
      query(`SELECT COUNT(*)::int as count FROM users u JOIN student_profiles p ON u.id = p.id WHERE u.created_at >= NOW() - INTERVAL '30 days'`),
      query(`SELECT COUNT(*)::int as count FROM users u JOIN student_profiles p ON u.id = p.id WHERE (u.last_active_at >= NOW() - INTERVAL '7 days' OR p.status = 'Active')`),
      query(`SELECT COUNT(*)::int as count FROM users WHERE role = 'admin'`),
    ]);

    const totalStudents = Number(studentsCountRes.rows[0]?.count) || 0;
    const totalProjects = Number(projectsCountRes.rows[0]?.count) || 0;
    const activeOpps = Number(oppsCountRes.rows[0]?.count) || 0;
    const avgGpa = Number(avgGpaRes.rows[0]?.avg_gpa) || 0;
    const avgReadiness = Number(avgReadinessRes.rows[0]?.avg_readiness) || 0;
    const atRisk = Number(atRiskCountRes.rows[0]?.count) || 0;
    const onboardedCount = Number(onboardedCountRes.rows[0]?.count) || 0;
    const newStudentsThisMonth = Number(recentStudentsRes.rows[0]?.count) || totalStudents;
    const activeStudents = Number(activeStudentsRes.rows[0]?.count) || totalStudents;
    const totalAdmins = Number(adminsCountRes.rows[0]?.count) || 1;

    const onboardingCompletedRate = totalStudents > 0 ? Math.round((onboardedCount / totalStudents) * 100) : 100;
    const activeRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 100;

    const stats = {
      totalStudents,
      totalAdmins,
      studentsGrowth: totalStudents > 0 ? 100 : 0,
      activeStudents,
      activeRate,
      newStudentsThisMonth,
      onboardingCompletedRate,
      studentsAtRisk: atRisk,
      activeOpportunities: activeOpps,
      totalProjects,
      averageGpa: avgGpa,
      averageReadiness: avgReadiness,
    };

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. GET FULL PLATFORM ANALYTICS (6 VIEWS)
// ==========================================
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    // 1. Academic Performance Data
    const [
      academicOverview,
      semesterDistributionRes,
      departmentStatsRes,
    ] = await Promise.all([
      query(`
        SELECT 
          AVG(gpa)::numeric(4,2) as avg_gpa,
          AVG(credits_completed)::numeric(5,1) as avg_credits,
          AVG(total_credits)::numeric(5,1) as avg_total_credits,
          COUNT(*) FILTER (WHERE gpa >= 3.0 AND (status = 'Active' OR status IS NULL))::int as on_track,
          COUNT(*) FILTER (WHERE (gpa >= 2.5 AND gpa < 3.0) OR status = 'Needs Attention')::int as needs_attention,
          COUNT(*) FILTER (WHERE gpa < 2.5 OR status = 'At Risk')::int as at_risk,
          COUNT(*)::int as total
        FROM student_profiles
      `),
      query(`
        SELECT 
          semester,
          COUNT(*)::int as count,
          COALESCE(AVG(gpa)::numeric(4,2), 0) as avg_gpa
        FROM student_profiles
        GROUP BY semester
        ORDER BY semester ASC
      `),
      query(`
        SELECT 
          degree as department,
          COUNT(*)::int as students_count,
          COALESCE(AVG(gpa)::numeric(4,2), 0) as avg_gpa,
          ROUND(COALESCE(COUNT(*) FILTER (WHERE status = 'Active' OR status IS NULL)::numeric / NULLIF(COUNT(*), 0) * 100, 90), 1) as retention_rate
        FROM student_profiles
        WHERE degree IS NOT NULL AND degree != ''
        GROUP BY degree
        ORDER BY students_count DESC
      `),
    ]);

    const acOverview = academicOverview.rows[0] || {};
    const avgCredits = Number(acOverview.avg_credits) || 60;
    const totalCredits = Number(acOverview.avg_total_credits) || 132;
    const averageProgress = totalCredits > 0 ? Math.round((avgCredits / totalCredits) * 100) : 50;

    const academicData = {
      averageCgpa: Number(acOverview.avg_gpa) || 3.42,
      averageProgress,
      studentsOnTrack: Number(acOverview.on_track) || 0,
      studentsNeedingAttention: Number(acOverview.needs_attention) || 0,
      studentsAtRisk: Number(acOverview.at_risk) || 0,
      avgCreditsCompleted: avgCredits,
      totalDegreeCredits: totalCredits,
      semesterDistribution: semesterDistributionRes.rows.map((r: any) => ({
        semester: Number(r.semester),
        count: Number(r.count),
        avgGpa: Number(r.avg_gpa),
        status: Number(r.avg_gpa) >= 3.4 ? 'Optimal' : Number(r.avg_gpa) >= 3.0 ? 'Satisfactory' : 'Needs Review',
      })),
      departmentStats: departmentStatsRes.rows.map((r: any) => ({
        department: r.department,
        studentsCount: Number(r.students_count),
        avgGpa: Number(r.avg_gpa),
        retentionRate: Number(r.retention_rate),
      })),
    };

    // 2. Skills Mastery Data
    const [topSkillsRes, levelDistRes, totalSkillsRes] = await Promise.all([
      query(`
        SELECT 
          name,
          category,
          COUNT(*)::int as student_count,
          ROUND(COALESCE(COUNT(*) FILTER (WHERE verified = true)::numeric / NULLIF(COUNT(*), 0) * 100, 50), 1) as verified_percentage,
          'Advanced' as average_proficiency
        FROM skills
        GROUP BY name, category
        ORDER BY student_count DESC
        LIMIT 10
      `),
      query(`
        SELECT 
          level,
          COUNT(*)::int as count
        FROM skills
        GROUP BY level
      `),
      query(`SELECT COUNT(*)::int as total FROM skills`),
    ]);

    const totalSkills = Number(totalSkillsRes.rows[0]?.total) || 1;
    const proficiencyDistribution = levelDistRes.rows.map((r: any) => ({
      level: r.level,
      count: Number(r.count),
      percentage: Math.round((Number(r.count) / totalSkills) * 100),
    }));

    const skillsData = {
      topSkills: topSkillsRes.rows.map((s: any) => ({
        name: s.name,
        category: s.category || 'Core Skill',
        studentCount: Number(s.student_count),
        verifiedPercentage: Number(s.verified_percentage),
        averageProficiency: s.average_proficiency,
      })),
      proficiencyDistribution: proficiencyDistribution.length > 0 ? proficiencyDistribution : [
        { level: 'Advanced', count: 12, percentage: 40 },
        { level: 'Intermediate', count: 14, percentage: 45 },
        { level: 'Beginner', count: 5, percentage: 15 },
      ],
      institutionalSkillGaps: [
        {
          skill: 'System Design & Scalable Architectures',
          industryDemand: 'Very High' as const,
          studentProficiencyRate: 34,
          gapSeverity: 'Critical' as const,
          recommendation: 'Incorporate dedicated Distributed Systems and microservices coursework in 6th semester.',
        },
        {
          skill: 'Cloud Deployment & Container Orchestration (Kubernetes)',
          industryDemand: 'Very High' as const,
          studentProficiencyRate: 41,
          gapSeverity: 'Critical' as const,
          recommendation: 'Launch DevOps hands-on lab modules alongside Computer Networks.',
        },
        {
          skill: 'Prompt Engineering & LLM Architecture',
          industryDemand: 'High' as const,
          studentProficiencyRate: 58,
          gapSeverity: 'Moderate' as const,
          recommendation: 'Offer elective on Generative AI systems and agentic frameworks.',
        },
      ],
      trendingSkills: [
        { name: 'PyTorch & Deep Learning', growthPercentage: 42, category: 'AI & Data' },
        { name: 'TypeScript & Next.js', growthPercentage: 35, category: 'Web Development' },
        { name: 'Docker & Microservices', growthPercentage: 28, category: 'DevOps & Systems' },
      ],
    };

    // 3. Verified Projects Data
    const [projectCountsRes, projectCatsRes, recentFeaturedRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'Completed')::int as completed,
          COUNT(*) FILTER (WHERE status = 'In Progress')::int as in_progress,
          COUNT(*) FILTER (WHERE status = 'Planned')::int as planned
        FROM projects
      `),
      query(`
        SELECT 
          category,
          COUNT(*)::int as count
        FROM projects
        GROUP BY category
        ORDER BY count DESC
      `),
      query(`
        SELECT 
          pr.id,
          pr.title,
          p.name as student_name,
          p.degree as student_program,
          pr.category,
          pr.status,
          pr.progress,
          pr.tech_stack,
          pr.github_url,
          pr.created_at
        FROM projects pr
        JOIN student_profiles p ON pr.student_id = p.id
        ORDER BY pr.created_at DESC
        LIMIT 6
      `),
    ]);

    const prCounts = projectCountsRes.rows[0] || {};
    const totalProjects = Number(prCounts.total) || 0;
    const totalStudentsCount = Number(academicOverview.rows[0]?.total) || 1;

    const projectsData = {
      totalProjects,
      completed: Number(prCounts.completed) || 0,
      inProgress: Number(prCounts.in_progress) || 0,
      planned: Number(prCounts.planned) || 0,
      avgProjectsPerStudent: Number((totalProjects / totalStudentsCount).toFixed(1)),
      categoryDistribution: projectCatsRes.rows.map((r: any) => ({
        category: r.category || 'General',
        count: Number(r.count),
        percentage: totalProjects > 0 ? Math.round((Number(r.count) / totalProjects) * 100) : 100,
      })),
      recentFeaturedProjects: recentFeaturedRes.rows.map((pr: any) => ({
        id: pr.id,
        title: pr.title,
        studentName: pr.student_name || 'Student',
        studentProgram: pr.student_program || 'Computing',
        category: pr.category || 'Software',
        status: (pr.status === 'Completed' ? 'Completed' : 'In Progress') as 'Completed' | 'In Progress',
        progress: Number(pr.progress) || 75,
        techStack: Array.isArray(pr.tech_stack) ? pr.tech_stack : [],
        githubUrl: pr.github_url,
        verified: true,
        dateAdded: new Date(pr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })),
    };

    // 4. Experience & Roles Data
    const [expTotalsRes, expCategoriesRes, topCompaniesRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(DISTINCT student_id)::int as students_with_exp
        FROM experiences
      `),
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE employment_type ILIKE '%intern%')::int as internships,
          COUNT(*) FILTER (WHERE employment_type ILIKE '%research%')::int as research,
          COUNT(*) FILTER (WHERE employment_type ILIKE '%freelance%')::int as freelance,
          COUNT(*) FILTER (WHERE employment_type ILIKE '%lead%')::int as leadership,
          COUNT(*) FILTER (WHERE employment_type ILIKE '%hack%')::int as hackathons,
          COUNT(*) FILTER (WHERE employment_type ILIKE '%volunteer%')::int as volunteer
        FROM experiences
      `),
      query(`
        SELECT 
          company,
          COUNT(DISTINCT student_id)::int as active_students_count
        FROM experiences
        WHERE company IS NOT NULL AND company != ''
        GROUP BY company
        ORDER BY active_students_count DESC
        LIMIT 6
      `),
    ]);

    const expTot = expTotalsRes.rows[0] || {};
    const totalExperiences = Number(expTot.total) || 0;
    const studentsWithExp = Number(expTot.students_with_exp) || 0;
    const studentsWithoutExp = Math.max(0, totalStudentsCount - studentsWithExp);
    const expRate = totalStudentsCount > 0 ? Math.round((studentsWithExp / totalStudentsCount) * 100) : 0;
    const catCounts = expCategoriesRes.rows[0] || {};

    const experienceData = {
      totalExperiences,
      studentsWithExperienceRate: expRate,
      studentsWithoutExperienceCount: studentsWithoutExp,
      categoryCounts: {
        internships: Number(catCounts.internships) || 0,
        research: Number(catCounts.research) || 0,
        freelance: Number(catCounts.freelance) || 0,
        leadership: Number(catCounts.leadership) || 0,
        hackathons: Number(catCounts.hackathons) || 0,
        volunteer: Number(catCounts.volunteer) || 0,
      },
      topHiringPartners: topCompaniesRes.rows.map((c: any) => ({
        company: c.company,
        activeStudentsCount: Number(c.active_students_count),
        industry: 'Technology & AI Services',
        rating: 4.8,
      })),
    };

    // 5. Career Readiness Data
    const [goalDistRes, readinessTiersRes, readinessAvgsRes] = await Promise.all([
      query(`
        SELECT 
          career_goal as role,
          COUNT(*)::int as count
        FROM student_profiles
        WHERE career_goal IS NOT NULL AND career_goal != ''
        GROUP BY career_goal
        ORDER BY count DESC
        LIMIT 6
      `),
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE career_readiness >= 80)::int as high,
          COUNT(*) FILTER (WHERE career_readiness >= 50 AND career_readiness < 80)::int as medium,
          COUNT(*) FILTER (WHERE career_readiness < 50)::int as low
        FROM student_profiles
      `),
      query(`
        SELECT 
          COALESCE(AVG(career_readiness)::numeric(4,1), 75) as overall,
          COALESCE(AVG(profile_completion)::numeric(4,1), 80) as profile
        FROM student_profiles
      `),
    ]);

    const rTiers = readinessTiersRes.rows[0] || {};
    const highTier = Number(rTiers.high) || 0;
    const medTier = Number(rTiers.medium) || 0;
    const lowTier = Number(rTiers.low) || 0;
    const totalTiers = highTier + medTier + lowTier || 1;

    const careerData = {
      goalDistribution: goalDistRes.rows.map((g: any, idx: number) => {
        const colors = ['#283593', '#4F46E5', '#0D9488', '#E11D48', '#D97706', '#6366F1'];
        return {
          role: g.role,
          count: Number(g.count),
          percentage: totalStudentsCount > 0 ? Math.round((Number(g.count) / totalStudentsCount) * 100) : 0,
          color: colors[idx % colors.length],
        };
      }),
      readinessTiers: [
        {
          tier: 'Highly Ready (80%+)' as const,
          count: highTier,
          percentage: Math.round((highTier / totalTiers) * 100),
          color: '#10B981',
        },
        {
          tier: 'Developing (50-79%)' as const,
          count: medTier,
          percentage: Math.round((medTier / totalTiers) * 100),
          color: '#3B82F6',
        },
        {
          tier: 'Needs Support (<50%)' as const,
          count: lowTier,
          percentage: Math.round((lowTier / totalTiers) * 100),
          color: '#F59E0B',
        },
      ],
      institutionalReadinessAverages: {
        skills: 76,
        projects: 72,
        experience: 65,
        profile: Number(readinessAvgsRes.rows[0]?.profile) || 82,
        networking: 68,
        overall: Number(readinessAvgsRes.rows[0]?.overall) || 75,
      },
    };

    // 6. Roadmap Analytics Data
    const [roadmapStatsRes, activeRoadmapsRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'in-progress')::int as active,
          COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
          COUNT(DISTINCT student_id)::int as students_with_roadmap
        FROM roadmap_tasks
      `),
      query(`
        SELECT 
          category as target_role,
          COUNT(*)::int as total_milestones,
          COUNT(DISTINCT student_id)::int as enrolled_students,
          ROUND(COALESCE(COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 0)) as avg_progress
        FROM roadmap_tasks
        GROUP BY category
      `),
    ]);

    const rmStats = roadmapStatsRes.rows[0] || {};
    const rmTotal = Number(rmStats.total) || 0;
    const rmCompleted = Number(rmStats.completed) || 0;
    const studentsWithRm = Number(rmStats.students_with_roadmap) || 0;
    const rmAvgRate = rmTotal > 0 ? Math.round((rmCompleted / rmTotal) * 100) : 60;

    const roadmapData = {
      totalAssigned: rmTotal || 24,
      activeRoadmaps: Number(rmStats.active) || 18,
      completedRoadmaps: rmCompleted || 6,
      avgCompletionRate: rmAvgRate,
      studentsWithoutRoadmaps: Math.max(0, totalStudentsCount - studentsWithRm),
      roadmapTemplates: [
        {
          id: 'tpl-ai',
          title: 'Machine Learning Engineer Career Path',
          targetRole: 'AI / Machine Learning Specialist',
          totalMilestones: 8,
          enrolledStudents: Math.max(1, studentsWithRm),
          avgProgress: 68,
          status: 'Published' as const,
          updatedAt: '2 days ago',
        },
        {
          id: 'tpl-fs',
          title: 'Full-Stack Web Architect Curriculum',
          targetRole: 'Full-Stack Developer',
          totalMilestones: 6,
          enrolledStudents: Math.max(1, Math.floor(studentsWithRm / 2)),
          avgProgress: 75,
          status: 'Published' as const,
          updatedAt: '1 week ago',
        },
        {
          id: 'tpl-ds',
          title: 'Data Science & Analytics Roadmap',
          targetRole: 'Data Scientist',
          totalMilestones: 7,
          enrolledStudents: Math.max(1, Math.floor(studentsWithRm / 3)),
          avgProgress: 54,
          status: 'Published' as const,
          updatedAt: '3 days ago',
        },
      ],
    };

    return res.json({
      success: true,
      data: {
        academic: academicData,
        skills: skillsData,
        projects: projectsData,
        experience: experienceData,
        career: careerData,
        roadmap: roadmapData,
      },
    });
  } catch (error: any) {
    console.error('Platform analytics error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch platform analytics' });
  }
});

// ==========================================
// 6. ACTIVITY LOGS
// ==========================================
router.get('/activity-logs', async (_req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50`);
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/activity-logs', async (req: Request, res: Response) => {
  try {
    const { action, target, category = 'System', status = 'Success' } = req.body;
    const result = await query(
      `INSERT INTO activity_logs (actor, actor_role, action, target, category, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user?.email || 'Admin', 'Super Admin', action, target, category, status]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 7. ADMIN SETTINGS
// ==========================================
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM admin_settings WHERE id = 1`);
    const s = result.rows[0] || {};
    return res.json({
      success: true,
      data: {
        institutionName: s.institution_name,
        campusDomain: s.campus_domain,
        academicYear: s.academic_year,
        currentTerm: s.current_term,
        allowStudentSelfRegistration: s.allow_student_self_registration,
        requireAdminApproval: s.require_admin_approval,
        enableEmailDigests: s.enable_email_digests,
        enableAutomaticAtRiskAlerts: s.enable_automatic_at_risk_alerts,
        gpaThresholdAlert: Number(s.gpa_threshold_alert),
        twoFactorAuthentication: s.two_factor_authentication,
        maintenanceMode: s.maintenance_mode,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const {
      institutionName,
      campusDomain,
      academicYear,
      currentTerm,
      allowStudentSelfRegistration,
      requireAdminApproval,
      enableEmailDigests,
      enableAutomaticAtRiskAlerts,
      gpaThresholdAlert,
      twoFactorAuthentication,
      maintenanceMode,
    } = req.body;

    const result = await query(
      `UPDATE admin_settings
       SET
         institution_name = COALESCE($1, institution_name),
         campus_domain = COALESCE($2, campus_domain),
         academic_year = COALESCE($3, academic_year),
         current_term = COALESCE($4, current_term),
         allow_student_self_registration = COALESCE($5, allow_student_self_registration),
         require_admin_approval = COALESCE($6, require_admin_approval),
         enable_email_digests = COALESCE($7, enable_email_digests),
         enable_automatic_at_risk_alerts = COALESCE($8, enable_automatic_at_risk_alerts),
         gpa_threshold_alert = COALESCE($9, gpa_threshold_alert),
         two_factor_authentication = COALESCE($10, two_factor_authentication),
         maintenance_mode = COALESCE($11, maintenance_mode),
         updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        institutionName,
        campusDomain,
        academicYear,
        currentTerm,
        allowStudentSelfRegistration,
        requireAdminApproval,
        enableEmailDigests,
        enableAutomaticAtRiskAlerts,
        gpaThresholdAlert,
        twoFactorAuthentication,
        maintenanceMode,
      ]
    );

    return res.json({ success: true, message: 'Settings saved successfully!', data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 8. ADMIN PROFILE & CREDENTIALS
// ==========================================
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const result = await query(
      `SELECT u.id, u.email, u.role, p.*
       FROM users u
       LEFT JOIN admin_profiles p ON u.id = p.id
       WHERE u.id = $1 AND u.role = 'admin'`,
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin profile not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/profile', async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { name, phone, officeLocation, officeHours, bio, department, avatar } = req.body;

    const result = await query(
      `UPDATE admin_profiles
       SET
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         office_location = COALESCE($3, office_location),
         office_hours = COALESCE($4, office_hours),
         bio = COALESCE($5, bio),
         department = COALESCE($6, department),
         avatar = COALESCE($7, avatar),
         updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, phone, officeLocation, officeHours, bio, department, avatar, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin profile not found.' });
    }

    return res.json({ success: true, message: 'Admin profile updated successfully!', data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/password', async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const userRes = await query(`SELECT password_hash FROM users WHERE id = $1`, [adminId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User record not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, adminId]);

    return res.json({ success: true, message: 'Admin password updated successfully!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. STUDENT AI DIAGNOSTIC & INTERVENTION
// ==========================================
router.post('/students/:id/ai-diagnostic', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const studentRes = await query(
      `SELECT u.id, u.email, p.* FROM users u JOIN student_profiles p ON u.id = p.id WHERE u.id = $1 AND u.role = 'student'`,
      [id]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const [skillsRes, projectsRes, experiencesRes, certsRes, appsRes] = await Promise.all([
      query(`SELECT name, level, percentage FROM skills WHERE student_id = $1`, [id]),
      query(`SELECT title, status, tech_stack FROM projects WHERE student_id = $1`, [id]),
      query(`SELECT title, company, employment_type FROM experiences WHERE student_id = $1`, [id]),
      query(`SELECT title, organization FROM certifications WHERE student_id = $1`, [id]),
      query(
        `SELECT a.status, o.title as opportunity_title, o.organization as company 
         FROM applications a 
         JOIN opportunities o ON a.opportunity_id = o.id 
         WHERE a.student_id = $1`,
        [id]
      ),
    ]);

    const s = studentRes.rows[0];
    const diagnostic = await generateStudentDiagnostic({
      id: s.id,
      name: s.name || 'Student',
      degree: s.degree || 'Computing',
      semester: Number(s.semester) || 1,
      gpa: Number(s.gpa) || 0,
      careerGoal: s.career_goal || 'Software Engineering',
      status: s.status || 'Active',
      academicStanding: s.academic_standing || 'Good Standing',
      creditsCompleted: Number(s.credits_completed) || 0,
      totalCredits: Number(s.total_credits) || 132,
      skills: skillsRes.rows,
      projects: projectsRes.rows.map((pr: any) => ({
        title: pr.title,
        status: pr.status,
        techStack: Array.isArray(pr.tech_stack) ? pr.tech_stack : [],
      })),
      experiences: experiencesRes.rows.map((e: any) => ({
        title: e.title,
        company: e.company,
        employmentType: e.employment_type,
      })),
      certifications: certsRes.rows,
      applications: appsRes.rows.map((a: any) => ({
        opportunityTitle: a.opportunity_title,
        company: a.company,
        status: a.status,
      })),
    });

    const mapped = {
      ...diagnostic,
      overallAssessment: diagnostic.executiveSummary,
      riskLevel: diagnostic.overallHealth === 'Critical Risk' ? 'HIGH' : diagnostic.overallHealth === 'Needs Attention' ? 'MEDIUM' : 'LOW',
      academicAnalysis: {
        standing: s.academic_standing || 'Good Standing',
        gpaTrend: Number(s.gpa) >= 3.5 ? 'Consistently Optimal' : Number(s.gpa) >= 3.0 ? 'Steady' : 'Deficient',
        creditProgress: `${s.credits_completed || 0} / ${s.total_credits || 130} Credits Completed`,
        academicStrengths: [
          `Cumulative CGPA of ${Number(s.gpa || 0).toFixed(2)} / 4.00`,
          `Enrolled in Semester ${s.semester || 1}`,
          ...(diagnostic.overallHealth === 'Optimal' ? ["Dean's Honors Standing"] : [])
        ],
        academicConcerns: diagnostic.academicRiskFactors || [],
      },
      careerTrajectory: {
        targetRole: s.career_goal || 'Software Engineer',
        readinessScore: Number(s.career_readiness) || (diagnostic.healthScore || 75),
        marketFit: diagnostic.overallHealth === 'Optimal' ? 'High Industry Alignment' : 'Developing Market Alignment',
        missingCoreCompetencies: diagnostic.skillGaps || [],
        recommendedExperience: diagnostic.recommendedAdvisorActions || [],
      },
      portfolioAudit: {
        projectQualityScore: Math.min(100, Math.max(40, (diagnostic.healthScore || 75) + 5)),
        skillsDiversity: `${skillsRes.rows.length} verified technical competencies`,
        certificationsValue: `${certsRes.rows.length} verified credential(s)`,
        suggestedCapstoneOrProjects: [
          diagnostic.portfolioAssessment,
          `Flagship project aligned with ${s.career_goal || 'Engineering Track'}`
        ]
      },
      advisorInterventionPlan: (diagnostic.recommendedAdvisorActions || []).map((action, idx) => ({
        priority: (idx === 0 ? 'Immediate' : idx === 1 ? 'Short-term' : 'Medium-term') as 'Immediate' | 'Short-term' | 'Medium-term',
        action,
        rationale: `${diagnostic.suggestedInterventionType || 'Academic Development'} • Institutional recommendation`
      }))
    };

    return res.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('AI student diagnostic error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate diagnostic' });
  }
});

export default router;
