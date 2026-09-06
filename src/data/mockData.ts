import {
  StudentUser,
  ProfileChecklistItem,
  NextActionItem,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  SemesterDetail,
  CareerReadinessBreakdown,
  SkillGrowthMonth,
  AchievementItem,
  RecentActivityItem,
  NotificationItem,
  CertificationItem,
} from '../types';

export const initialCertifications: CertificationItem[] = [
  {
    id: 'cert-1',
    title: 'Deep Learning Specialization',
    organization: 'DeepLearning.AI / Coursera',
    date: 'Dec 2024',
    certificateLink: 'https://coursera.org/verify/specialization/DL-AI-2024',
    credentialId: 'DL-AI-9842',
  },
  {
    id: 'cert-2',
    title: 'TensorFlow Developer Certificate',
    organization: 'Google Developers',
    date: 'Aug 2024',
    certificateLink: 'https://www.credential.net/verify/google-tf-cert',
    credentialId: 'TF-DEV-84920',
  },
  {
    id: 'cert-3',
    title: 'AWS Certified Cloud Practitioner',
    organization: 'Amazon Web Services',
    date: 'May 2024',
    certificateLink: 'https://aws.amazon.com/verification/AWS-CCP',
    credentialId: 'AWS-CCP-10293',
  },
  {
    id: 'cert-4',
    title: "Dean's Honor Roll (Fall 2023 & Spring 2024)",
    organization: 'University of Azad Jammu & Kashmir',
    date: 'Jun 2024',
    certificateLink: '',
    credentialId: 'UAJK-HON-2024',
  },
];

export const mockStudent: StudentUser = {
  name: 'Ali Raza',
  degree: 'BS Artificial Intelligence',
  semester: 5,
  totalSemesters: 8,
  completedSemesters: 4,
  university: 'University of Azad Jammu & Kashmir',
  careerGoal: 'AI / Machine Learning Engineer',
  gpa: 3.42,
  profileCompletion: 75,
  careerReadiness: 68,
  creditsCompleted: 78,
  totalCredits: 132,
  academicStanding: 'Good',
  email: 'ali.raza@ajku.edu.pk',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  location: 'Muzaffarabad, AJK',
  headline: 'Aspiring AI & Machine Learning Engineer | Deep Learning & Intelligent Systems',
  aboutMe: 'Passionate Artificial Intelligence student dedicated to building scalable machine learning pipelines, computer vision models, and full-stack intelligent applications. Active contributor to campus developer clubs and hackathons.',
  educationDates: '2022 - 2026 (Expected)',
  relevantCoursework: [
    'Data Structures & Algorithms',
    'Machine Learning',
    'Deep Learning & Neural Networks',
    'Database Systems',
    'Computer Vision',
    'Artificial Intelligence',
    'Linear Algebra & Calculus',
    'Natural Language Processing',
  ],
  certifications: initialCertifications,
};

export const initialProfileChecklist: ProfileChecklistItem[] = [
  {
    id: '1',
    title: 'Basic information',
    completed: true,
    actionKey: 'profile_photo',
  },
  {
    id: '2',
    title: 'Education',
    completed: true,
    actionKey: 'education',
  },
  {
    id: '3',
    title: 'Career goal',
    completed: true,
    actionKey: 'career_goal',
  },
  {
    id: '4',
    title: 'Skills',
    completed: true,
    actionKey: 'skills',
  },
  {
    id: '5',
    title: 'Add projects',
    completed: false,
    actionKey: 'add_project',
  },
  {
    id: '6',
    title: 'Add GitHub',
    completed: false,
    actionKey: 'github',
  },
];

export const initialNextSteps: NextActionItem[] = [
  {
    id: 'step-1',
    number: '01',
    title: 'Build your first Computer Vision project',
    category: 'Project',
    priority: 'High',
    estimatedTime: '2 weeks',
    actionType: 'project',
    status: 'pending',
  },
  {
    id: 'step-2',
    number: '02',
    title: 'Complete Python Data Analysis milestone',
    category: 'Skill',
    priority: 'Medium',
    estimatedTime: '5 days',
    actionType: 'skill',
    status: 'pending',
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Update your LinkedIn profile',
    category: 'Career',
    priority: 'Medium',
    estimatedTime: '30 min',
    actionType: 'career',
    status: 'pending',
  },
];

export const initialSkills: SkillProgressItem[] = [
  {
    id: 'sk-1',
    name: 'Python',
    level: 'Advanced',
    percentage: 82,
    category: 'Core Programming',
    verified: true,
  },
  {
    id: 'sk-2',
    name: 'Machine Learning',
    level: 'Intermediate',
    percentage: 64,
    category: 'AI & Data',
    verified: true,
  },
  {
    id: 'sk-3',
    name: 'Computer Vision',
    level: 'Intermediate',
    percentage: 58,
    category: 'Specialization',
    verified: false,
  },
  {
    id: 'sk-4',
    name: 'Data Analysis',
    level: 'Intermediate',
    percentage: 70,
    category: 'AI & Data',
    verified: true,
  },
  {
    id: 'sk-5',
    name: 'Git & GitHub',
    level: 'Intermediate',
    percentage: 75,
    category: 'Engineering Tools',
    verified: true,
  },
];

export const initialProjects: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'CampusOS',
    category: 'AI / EdTech',
    status: 'In Progress',
    progress: 65,
    description: 'AI-powered Student Operating System helping university students bridge the gap between curriculum and career.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'proj-2',
    title: 'Computer Vision ReID',
    category: 'Computer Vision',
    status: 'Completed',
    progress: 100,
    description: 'Person re-identification neural network model using PyTorch and OpenCV.',
    techStack: ['Python', 'PyTorch', 'OpenCV'],
  },
];

export const initialExperiences: ExperienceItem[] = [];

export const initialSemesters: SemesterDetail[] = [
  { semester: 1, status: 'completed', gpa: 3.50, coursesCount: 5 },
  { semester: 2, status: 'completed', gpa: 3.38, coursesCount: 6 },
  { semester: 3, status: 'completed', gpa: 3.45, coursesCount: 5 },
  { semester: 4, status: 'completed', gpa: 3.35, coursesCount: 6 },
  { semester: 5, status: 'current', gpa: 3.42, coursesCount: 5 },
  { semester: 6, status: 'upcoming', coursesCount: 5 },
  { semester: 7, status: 'upcoming', coursesCount: 4 },
  { semester: 8, status: 'upcoming', coursesCount: 3 },
];

export const careerReadinessData: CareerReadinessBreakdown = {
  overall: 68,
  skills: 72,
  projects: 60,
  experience: 45,
  profile: 80,
  networking: 55,
};

export const mockSkillGrowth: SkillGrowthMonth[] = [
  { month: 'May', points: 32 },
  { month: 'Jun', points: 41 },
  { month: 'Jul', points: 49 },
  { month: 'Aug', points: 58 },
];

export const mockAchievements: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'First Project',
    status: 'Completed',
    description: 'Completed your first verified project',
    iconName: 'Trophy',
    earnedDate: 'Completed',
  },
  {
    id: 'ach-2',
    title: 'Roadmap Started',
    status: 'Completed',
    description: 'Activated your AI / ML roadmap',
    iconName: 'Target',
    earnedDate: 'Completed',
  },
  {
    id: 'ach-3',
    title: 'GitHub Connected',
    status: 'Completed',
    description: 'Synced your GitHub repository portfolio',
    iconName: 'Code',
    earnedDate: 'Completed',
  },
  {
    id: 'ach-4',
    title: 'Research Explorer',
    status: 'Locked',
    description: 'Submit or participate in academic research',
    iconName: 'Microscope',
  },
  {
    id: 'ach-5',
    title: 'Dean\'s Honor Roll',
    status: 'Locked',
    description: 'Maintain a 3.7+ semester GPA',
    iconName: 'Award',
  },
];

export const mockRecentActivity: RecentActivityItem[] = [
  {
    id: 'act-1',
    type: 'completed',
    title: 'Completed:',
    target: 'Python Data Analysis milestone',
    timeAgo: '2 days ago',
  },
  {
    id: 'act-2',
    type: 'added',
    title: 'Added:',
    target: 'Computer Vision project',
    timeAgo: '5 days ago',
  },
  {
    id: 'act-3',
    type: 'updated',
    title: 'Updated:',
    target: 'Career goal → AI / ML Engineer',
    timeAgo: '1 week ago',
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to CampusOS',
    message: 'Your student operating system is ready. Review your personalized roadmap to stay ahead.',
    time: '10m ago',
    unread: true,
    type: 'system',
  },
  {
    id: 'notif-2',
    title: 'Recommended Next Step',
    message: 'Start "Build your first Computer Vision project" to increase your Career Readiness score by +8%.',
    time: '2h ago',
    unread: true,
    type: 'roadmap',
  },
  {
    id: 'notif-3',
    title: 'Semester 5 Milestone',
    message: 'You have completed 78 of 132 required credits toward your BS AI degree.',
    time: '1d ago',
    unread: false,
    type: 'profile',
  },
];
