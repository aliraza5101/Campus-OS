export interface CertificationItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  certificateLink?: string;
  credentialId?: string;
}

export interface NotificationPreferences {
  opportunityAlerts: boolean;
  aiRecommendations: boolean;
  advisingAlerts: boolean;
  emailAlerts?: boolean;
}

export interface StudentUser {
  id?: string;
  name: string;
  degree: string;
  semester: number;
  totalSemesters: number;
  completedSemesters: number;
  university: string;
  careerGoal: string;
  gpa: number;
  profileCompletion: number;
  careerReadiness: number;
  creditsCompleted: number;
  totalCredits: number;
  academicStanding: string;
  email: string;
  avatar: string;
  location: string;
  headline?: string;
  aboutMe?: string;
  educationDates?: string;
  relevantCoursework?: string[];
  certifications?: CertificationItem[];
  strategicAdvice?: string;
  criticalSkillGaps?: string[];
  notificationPreferences?: NotificationPreferences;
}

export interface ProfileChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  actionKey?: 'add_experience' | 'add_project' | 'profile_photo' | 'education' | 'social_links' | 'career_goal' | 'skills' | 'github';
}

export interface NextActionItem {
  id: string;
  number: string;
  title: string;
  category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: string;
  actionUrl?: string;
  actionType: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface SkillProgressItem {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  percentage: number;
  category: string;
  verified?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  progress: number;
  description?: string;
  techStack?: string[];
  githubUrl?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  employmentType: string;
  period: string;
  location: string;
  description?: string;
}

export interface SemesterDetail {
  semester: number;
  status: 'completed' | 'current' | 'upcoming';
  gpa?: number;
  coursesCount?: number;
}

export interface CareerReadinessBreakdown {
  skills: number;
  projects: number;
  experience: number;
  profile: number;
  networking: number;
  overall: number;
}

export interface SkillGrowthMonth {
  month: string;
  points: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  status: 'Completed' | 'Locked';
  description: string;
  iconName: 'Trophy' | 'Target' | 'Code' | 'Microscope' | 'Award' | 'Sparkles';
  earnedDate?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'completed' | 'added' | 'updated' | 'milestone';
  title: string;
  target: string;
  timeAgo: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'roadmap' | 'profile' | 'achievement' | 'system' | 'opportunity';
}
