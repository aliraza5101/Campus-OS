import {
  StudentUser,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  ProfileChecklistItem,
} from '../types';

export interface ProfileSectionWeight {
  key: string;
  label: string;
  weight: number;
  completed: boolean;
  hint: string;
}

/**
 * Calculates the dynamic profile completion percentage (0 - 100) based on
 * completed profile fields, academic records, skills, projects, experiences, and certifications.
 */
export function calculateProfileCompletion(
  user: StudentUser,
  skills: SkillProgressItem[] = [],
  projects: ProjectItem[] = [],
  experiences: ExperienceItem[] = []
): number {
  let score = 0;

  // 1. Basic Identity Info: Name, Email, Location (10%)
  const hasBasicInfo = Boolean(
    user.name?.trim() && user.email?.trim() && user.location?.trim()
  );
  if (hasBasicInfo) score += 10;

  // 2. Profile Photo / Avatar (10%)
  const hasAvatar = Boolean(user.avatar?.trim());
  if (hasAvatar) score += 10;

  // 3. Headline & About Me / Bio (10%)
  const hasHeadline = Boolean(user.headline?.trim());
  const hasAboutMe = Boolean(user.aboutMe?.trim() && user.aboutMe.trim().length > 15);
  if (hasHeadline && hasAboutMe) {
    score += 10;
  } else if (hasHeadline || hasAboutMe) {
    score += 5;
  }

  // 4. Academic Info: Degree, University, GPA, Semester (15%)
  const hasDegree = Boolean(user.degree?.trim());
  const hasUniversity = Boolean(user.university?.trim());
  const hasGpa = typeof user.gpa === 'number' && user.gpa > 0;
  const hasSemester = typeof user.semester === 'number' && user.semester > 0;
  if (hasDegree && hasUniversity && hasGpa && hasSemester) {
    score += 15;
  } else if (hasDegree && hasUniversity) {
    score += 10;
  }

  // 5. Relevant Coursework (5%)
  const hasCoursework = Boolean(user.relevantCoursework && user.relevantCoursework.length > 0);
  if (hasCoursework) score += 5;

  // 6. Career Goal / Target Direction (10%)
  const hasCareerGoal = Boolean(user.careerGoal?.trim());
  if (hasCareerGoal) score += 10;

  // 7. Technical Skills Portfolio (15%)
  // Full marks for >= 3 skills, partial for 1-2
  if (skills.length >= 3) {
    score += 15;
  } else if (skills.length === 2) {
    score += 10;
  } else if (skills.length === 1) {
    score += 5;
  }

  // 8. Verified Projects (10%)
  // 1 project = 7%, 2+ projects or project with repository = 10%
  if (projects.length >= 2 || (projects.length >= 1 && projects.some((p) => Boolean(p.githubUrl?.trim())))) {
    score += 10;
  } else if (projects.length === 1) {
    score += 7;
  }

  // 9. Experience / Internships / Research Roles (8%)
  if (experiences.length >= 1) {
    score += 8;
  }

  // 10. Certifications & Academic Honors (7%)
  const hasCerts = Boolean(user.certifications && user.certifications.length > 0);
  if (hasCerts) {
    score += 7;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Returns dynamic checklist items synchronized with current user data.
 */
export function getDynamicChecklistItems(
  user: StudentUser,
  skills: SkillProgressItem[] = [],
  projects: ProjectItem[] = [],
  experiences: ExperienceItem[] = []
): ProfileChecklistItem[] {
  const hasBasicInfo = Boolean(user.name?.trim() && user.email?.trim() && user.avatar?.trim());
  const hasEducation = Boolean(
    user.degree?.trim() &&
    user.university?.trim() &&
    user.relevantCoursework &&
    user.relevantCoursework.length > 0
  );
  const hasCareerGoal = Boolean(user.careerGoal?.trim());
  const hasSkills = skills.length >= 2;
  const hasProjects = projects.length > 0;
  const hasGitHub =
    projects.some((p) => Boolean(p.githubUrl?.trim())) ||
    skills.some((s) => s.name.toLowerCase().includes('git')) ||
    Boolean(user.aboutMe?.toLowerCase().includes('github'));
  const hasExperience = experiences.length > 0;

  return [
    {
      id: '1',
      title: 'Basic information',
      completed: hasBasicInfo,
      actionKey: 'profile_photo',
    },
    {
      id: '2',
      title: 'Education',
      completed: hasEducation,
      actionKey: 'education',
    },
    {
      id: '3',
      title: 'Career goal',
      completed: hasCareerGoal,
      actionKey: 'career_goal',
    },
    {
      id: '4',
      title: 'Skills',
      completed: hasSkills,
      actionKey: 'skills',
    },
    {
      id: '5',
      title: 'Add projects',
      completed: hasProjects,
      actionKey: 'add_project',
    },
    {
      id: '6',
      title: 'Add GitHub',
      completed: hasGitHub,
      actionKey: 'github',
    },
    {
      id: '7',
      title: 'Add experience',
      completed: hasExperience,
      actionKey: 'add_experience',
    },
  ];
}
