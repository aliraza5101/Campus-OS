export interface AdminCredentials {
  staffId: string;
  securityPin: string; // 6-digit master security PIN
  institutionalKey: string;
  is2FAEnabled: boolean;
  authMethod: 'Authenticator App (TOTP)' | 'Institutional SMS / Duo' | 'Hardware Security Key (FIDO2)';
  clearanceLevel: 'Tier 1 - Super Admin' | 'Tier 2 - Academic Dean' | 'Tier 3 - Faculty Advisor';
  verifiedDepartmentCode: string;
  lastVerifiedAt: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Academic Admin' | 'Career Counselor' | 'System Admin';
  avatar?: string;
  department?: string;
  phone?: string;
  officeLocation?: string;
  officeHours?: string;
  bio?: string;
  staffId?: string;
  lastActive: string;
  status: 'Active' | 'Inactive';
  credentials?: AdminCredentials;
}

export interface PlatformTopStats {
  totalStudents: number;
  totalAdmins?: number;
  studentsGrowth: number;
  activeStudents: number;
  activeRate: number;
  newStudentsThisMonth: number;
  onboardingCompletedRate: number;
  studentsAtRisk: number;
  activeOpportunities: number;
  totalProjects: number;
  averageGpa: number;
  averageReadiness: number;
}

export interface DirectoryStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university: string;
  program: string;
  semester: number;
  cgpa: number;
  careerGoal: string;
  readinessScore: number;
  status: 'Active' | 'Needs Attention' | 'At Risk' | 'Inactive';
  onboardingStatus: 'Completed' | 'In Progress' | 'Not Started';
  joinedDate: string;
  lastActive: string;
  skillsCount: number;
  projectsCount: number;
  experienceCount: number;
  creditsCompleted: number;
  totalCredits: number;
  academicStanding: string;
  topSkills: string[];
  advisorNotes?: string;
}

export type AdminStudentItem = DirectoryStudent;

export interface AcademicAnalyticsData {
  averageCgpa: number;
  averageProgress: number;
  studentsOnTrack: number;
  studentsNeedingAttention: number;
  studentsAtRisk: number;
  avgCreditsCompleted: number;
  totalDegreeCredits: number;
  semesterDistribution: {
    semester: number;
    count: number;
    avgGpa: number;
    status: string;
  }[];
  departmentStats: {
    department: string;
    studentsCount: number;
    avgGpa: number;
    retentionRate: number;
  }[];
}

export interface SkillAnalyticsData {
  topSkills: {
    name: string;
    category: string;
    studentCount: number;
    verifiedPercentage: number;
    averageProficiency: string;
  }[];
  proficiencyDistribution: {
    level: string;
    percentage: number;
    count: number;
  }[];
  institutionalSkillGaps: {
    skill: string;
    industryDemand: 'Very High' | 'High' | 'Moderate';
    studentProficiencyRate: number;
    gapSeverity: 'Critical' | 'Moderate' | 'Minor';
    recommendation: string;
  }[];
  trendingSkills: {
    name: string;
    growthPercentage: number;
    category: string;
  }[];
}

export interface ProjectAnalyticsData {
  totalProjects: number;
  completed: number;
  inProgress: number;
  planned: number;
  avgProjectsPerStudent: number;
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  recentFeaturedProjects: {
    id: string;
    title: string;
    studentName: string;
    studentProgram: string;
    category: string;
    status: 'Completed' | 'In Progress';
    progress: number;
    techStack: string[];
    githubUrl?: string;
    verified: boolean;
    dateAdded: string;
  }[];
}

export interface ExperienceAnalyticsData {
  totalExperiences: number;
  studentsWithExperienceRate: number;
  studentsWithoutExperienceCount: number;
  categoryCounts: {
    internships: number;
    research: number;
    freelance: number;
    leadership: number;
    hackathons: number;
    volunteer: number;
  };
  topHiringPartners: {
    company: string;
    activeStudentsCount: number;
    industry: string;
    rating: number;
  }[];
}

export interface RoadmapAnalyticsData {
  totalAssigned: number;
  activeRoadmaps: number;
  completedRoadmaps: number;
  avgCompletionRate: number;
  studentsWithoutRoadmaps: number;
  roadmapTemplates: {
    id: string;
    title: string;
    targetRole: string;
    totalMilestones: number;
    enrolledStudents: number;
    avgProgress: number;
    status: 'Published' | 'Draft' | 'Archived';
    updatedAt: string;
  }[];
}

export interface CareerAnalyticsData {
  goalDistribution: {
    role: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  readinessTiers: {
    tier: 'Highly Ready (80%+)' | 'Developing (50-79%)' | 'Needs Support (<50%)';
    count: number;
    percentage: number;
    color: string;
  }[];
  institutionalReadinessAverages: {
    skills: number;
    projects: number;
    experience: number;
    profile: number;
    networking: number;
    overall: number;
  };
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  type: 'Internship' | 'Scholarship' | 'Competition' | 'Research' | 'Hackathon' | 'Job';
  location: string;
  deadline: string;
  status: 'Published' | 'Draft' | 'Scheduled' | 'Archived';
  applicantsCount: number;
  matchRequirement: string;
  featured?: boolean;
  compensation?: string;
  postedDate: string;
  applyUrl?: string;
  description?: string;
  targetRole?: string;
  isExternal?: boolean;
}

export interface OpportunityApplicationItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentProgram: string;
  opportunityTitle: string;
  company: string;
  appliedDate: string;
  readinessScore: number;
  gpa: number;
  status: 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected';
  notes?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: 'All Students' | 'BS Artificial Intelligence' | 'BS Computer Science' | 'Semester 5 & 6' | 'Graduating Seniors';
  category: 'Academic' | 'Career' | 'Hackathon' | 'System' | 'Workshop';
  status: 'Published' | 'Draft' | 'Scheduled';
  author: string;
  publishedDate: string;
  viewCount: number;
  priority: 'High' | 'Normal' | 'Urgent';
}

export interface AdminNotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  sentAt: string;
  sentBy: string;
  deliveryRate: number;
  openRate: number;
  type: 'announcement' | 'alert' | 'deadline' | 'system' | 'opportunity';
  status: 'Sent' | 'Scheduled' | 'Draft';
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  category: 'User Management' | 'Academic Data' | 'Opportunities' | 'Announcements' | 'System' | 'Security';
  status: 'Success' | 'Warning' | 'Info';
  ipAddress?: string;
}

export interface SystemHealthMetric {
  service: string;
  status: 'Operational' | 'Demo Mode' | 'Not Connected' | 'Degraded';
  description: string;
  latency?: string;
  uptime?: string;
  note: string;
  version?: string;
}

export interface IntegrationCardItem {
  id: string;
  name: string;
  category: string;
  status: 'Connected' | 'Demo Mode' | 'Not Connected' | 'Coming Soon';
  description: string;
  badgeColor?: string;
  configSummary?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  category: string;
  description: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  lastGenerated: string;
  recordsCount: number;
}

export interface AdminSettingsState {
  institutionName: string;
  campusDomain: string;
  academicYear: string;
  currentTerm: string;
  allowStudentSelfRegistration: boolean;
  requireAdminApproval: boolean;
  enableEmailDigests: boolean;
  enableAutomaticAtRiskAlerts: boolean;
  gpaThresholdAlert: number;
  twoFactorAuthentication: boolean;
  maintenanceMode: boolean;
}
