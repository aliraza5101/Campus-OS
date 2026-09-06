export function formatStudentProfile(p: any, email?: string) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name || '',
    degree: p.degree || '',
    semester: p.semester !== null && p.semester !== undefined ? Number(p.semester) : 1,
    totalSemesters: p.total_semesters !== null && p.total_semesters !== undefined ? Number(p.total_semesters) : 8,
    completedSemesters: p.completed_semesters !== null && p.completed_semesters !== undefined ? Number(p.completed_semesters) : 0,
    university: p.university || '',
    careerGoal: p.career_goal || '',
    gpa: p.gpa !== null && p.gpa !== undefined ? Number(p.gpa) : 0,
    profileCompletion: p.profile_completion !== null && p.profile_completion !== undefined ? Number(p.profile_completion) : 0,
    careerReadiness: p.career_readiness !== null && p.career_readiness !== undefined ? Number(p.career_readiness) : 0,
    creditsCompleted: p.credits_completed !== null && p.credits_completed !== undefined ? Number(p.credits_completed) : 0,
    totalCredits: p.total_credits !== null && p.total_credits !== undefined ? Number(p.total_credits) : 130,
    academicStanding: p.academic_standing || 'Good Standing',
    email: email || p.email || '',
    avatar: p.avatar || '',
    location: p.location || '',
    headline: p.headline || '',
    aboutMe: p.about_me || '',
    educationDates: p.education_dates || '',
    relevantCoursework: Array.isArray(p.relevant_coursework) ? p.relevant_coursework : [],
    status: p.status || 'Active',
    onboardingStatus: p.onboarding_status || 'In Progress',
    advisorNotes: p.advisor_notes || '',
    strategicAdvice: p.advisor_notes || '',
    notificationPreferences: p.notification_preferences || {
      opportunityAlerts: true,
      aiRecommendations: true,
      advisingAlerts: true,
      emailAlerts: true,
    },
  };
}

export function formatAdminProfile(a: any, email?: string) {
  if (!a) return null;
  return {
    id: a.id,
    name: a.name || '',
    role: a.role || 'Admin',
    department: a.department || '',
    staffId: a.staff_id || '',
    clearanceLevel: a.clearance_level || 'Tier 2 - Academic Dean',
    email: email || a.email || '',
    avatar: a.avatar || '',
  };
}

export function formatSkill(s: any) {
  return {
    id: s.id,
    name: s.name,
    level: s.level || 'Intermediate',
    percentage: Number(s.percentage) || 70,
    category: s.category || 'Core Skill',
    verified: Boolean(s.verified),
  };
}

export function formatProject(pr: any) {
  return {
    id: pr.id,
    title: pr.title,
    category: pr.category || 'AI / Machine Learning',
    status: pr.status || 'In Progress',
    progress: Number(pr.progress) || 75,
    description: pr.description || '',
    techStack: Array.isArray(pr.tech_stack) ? pr.tech_stack : [],
    githubUrl: pr.github_url || '',
    liveUrl: pr.live_url || '',
  };
}

export function formatExperience(e: any) {
  return {
    id: e.id,
    title: e.title || e.role || 'Intern',
    company: e.company || '',
    employmentType: e.employment_type || e.type || 'Internship',
    period: e.period || 'Jun 2024 - Present',
    location: e.location || 'Islamabad / Remote',
    description: e.description || '',
  };
}

export function formatCertification(c: any) {
  return {
    id: c.id,
    title: c.title,
    organization: c.organization,
    date: c.date,
    certificateLink: c.certificate_link,
    credentialId: c.credential_id,
  };
}

export function formatSemesterDetail(sem: any) {
  return {
    semester: Number(sem.semester),
    status: sem.status || 'upcoming',
    gpa: sem.gpa !== null && sem.gpa !== undefined ? Number(sem.gpa) : undefined,
    coursesCount: sem.courses_count !== null && sem.courses_count !== undefined ? Number(sem.courses_count) : undefined,
  };
}
