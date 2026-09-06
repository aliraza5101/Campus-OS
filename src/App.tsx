import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/Dashboard';
import { JourneySubviews } from './components/views/JourneySubviews';
import { NotificationsFlyout } from './components/modals/NotificationsFlyout';
import { AddExperienceModal } from './components/modals/AddExperienceModal';
import { AddProjectModal } from './components/modals/AddProjectModal';
import { UpdateCareerGoalModal } from './components/modals/UpdateCareerGoalModal';
import { UpdateSkillsModal } from './components/modals/UpdateSkillsModal';
import { ActionDetailModal } from './components/modals/ActionDetailModal';
import { AuthOnboardingView } from './components/auth/AuthOnboardingView';
import { Bell } from 'lucide-react';
import {
  calculateProfileCompletion,
  getDynamicChecklistItems,
} from './utils/profileCompletion';
import { calculateCareerReadiness } from './utils/readinessEngine';
import {
  authApi,
  studentApi,
  adminApi,
  opportunitiesApi,
  announcementsApi,
  notificationsApi,
  reportsApi,
  setToken,
  getToken,
  removeToken,
} from './services/api';


// Admin Components
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { AdminDashboardView } from './components/admin/views/AdminDashboardView';
import { AdminStudentsView } from './components/admin/views/AdminStudentsView';
import { AdminPlatformAnalyticsView } from './components/admin/views/AdminPlatformAnalyticsView';
import { AdminSettingsView } from './components/admin/views/AdminSettingsView';
import { AdminApplicationsView } from './components/admin/views/AdminApplicationsView';
import { AdminReportsView } from './components/admin/views/AdminReportsView';
import { AdminProfileView } from './components/admin/views/AdminProfileView';
import { AdminProfileModal } from './components/admin/profile/AdminProfileModal';
import { AdminOpportunitiesView } from './components/admin/views/AdminOpportunitiesView';
import { AdminAnnouncementsView } from './components/admin/views/AdminAnnouncementsView';
import { AdminNotificationsView } from './components/admin/views/AdminNotificationsView';
import { AdminActivityLogsView } from './components/admin/views/AdminActivityLogsView';

import { AdminStudentDetailModal } from './components/admin/views/AdminStudentDetailModal';
import { AdminNewOpportunityModal } from './components/admin/modals/AdminNewOpportunityModal';
import { AdminNewAnnouncementModal } from './components/admin/modals/AdminNewAnnouncementModal';
import { AdminHelpModal } from './components/admin/modals/AdminHelpModal';
import { AdminNotificationsFlyout } from './components/admin/modals/AdminNotificationsFlyout';


import {
  StudentUser,
  ProfileChecklistItem,
  NextActionItem,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  CertificationItem,
  SemesterDetail,
  CareerReadinessBreakdown,
  SkillGrowthMonth,
  AchievementItem,
  RecentActivityItem,
  NotificationItem,
} from './types';

import {
  AdminUser,
  PlatformTopStats,
  AdminStudentItem,
  OpportunityItem,
  AnnouncementItem,
  OpportunityApplicationItem,
  ActivityLogItem,
  ReportItem,
  AdminNotificationBroadcast,
  AcademicAnalyticsData,
  SkillAnalyticsData,
  ProjectAnalyticsData,
  ExperienceAnalyticsData,
  CareerAnalyticsData,
  RoadmapAnalyticsData,
} from './types/admin';

const defaultEmptyAdminUser: AdminUser = {
  id: '',
  name: 'Institutional Administrator',
  role: 'Super Admin',
  department: 'Faculty of Computing',
  email: '',
  staffId: '',
  lastActive: 'Just now',
  status: 'Active',
};

const defaultEmptyAdminStats: PlatformTopStats = {
  totalStudents: 0,
  studentsGrowth: 0,
  activeStudents: 0,
  activeRate: 0,
  newStudentsThisMonth: 0,
  onboardingCompletedRate: 0,
  studentsAtRisk: 0,
  activeOpportunities: 0,
  totalProjects: 0,
  averageGpa: 0,
  averageReadiness: 0,
};

const emptyAcademicData: AcademicAnalyticsData = {
  averageCgpa: 0,
  averageProgress: 0,
  studentsOnTrack: 0,
  studentsNeedingAttention: 0,
  studentsAtRisk: 0,
  avgCreditsCompleted: 0,
  totalDegreeCredits: 132,
  semesterDistribution: [],
  departmentStats: [],
};

const defaultEmptyCareerReadiness: CareerReadinessBreakdown = {
  overall: 0,
  skills: 0,
  projects: 0,
  experience: 0,
  profile: 0,
  networking: 0,
};

const defaultEmptyStudent: StudentUser = {
  id: '',
  name: '',
  degree: '',
  semester: 1,
  totalSemesters: 8,
  completedSemesters: 0,
  university: '',
  careerGoal: '',
  gpa: 0,
  profileCompletion: 0,
  careerReadiness: 0,
  creditsCompleted: 0,
  totalCredits: 130,
  academicStanding: 'Good Standing',
  email: '',
  avatar: '',
  location: '',
  headline: '',
  aboutMe: '',
  educationDates: '',
  relevantCoursework: [],
};

export default function App() {
  // Global Session & Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isHydratingAuth, setIsHydratingAuth] = useState<boolean>(() => Boolean(getToken()));
  const [authMode, setAuthMode] = useState<'onboarding' | 'login'>('onboarding');

  // Global Role Switcher: 'student' | 'admin'
  const [role, setRole] = useState<'student' | 'admin'>('student');

  // -------------------------------------------------------------
  // Student Portal State
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<StudentUser>(defaultEmptyStudent);
  const [nextSteps, setNextSteps] = useState<NextActionItem[]>([]);
  const [skills, setSkills] = useState<SkillProgressItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterDetail[]>([]);
  const [careerReadiness, setCareerReadiness] = useState<CareerReadinessBreakdown>(defaultEmptyCareerReadiness);
  const [skillGrowth, setSkillGrowth] = useState<SkillGrowthMonth[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Floating Toast Notification for student live actions
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    message: string;
    type?: string;
  } | null>(null);

  const pushNotification = (
    title: string,
    message: string,
    type: 'profile' | 'roadmap' | 'achievement' | 'opportunity' | 'system' = 'profile'
  ) => {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: NotificationItem = {
      id: notifId,
      title,
      message,
      time: 'Just now',
      unread: true,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast({ id: notifId, title, message, type });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === notifId ? null : curr));
    }, 4500);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    notificationsApi.markAsRead(id).catch(() => {});
  };

  const updateReadiness = (
    updatedUser?: Partial<StudentUser>,
    updatedSkills?: SkillProgressItem[],
    updatedProjects?: ProjectItem[],
    updatedExp?: ExperienceItem[],
    updatedCerts?: CertificationItem[],
    updatedSteps?: NextActionItem[]
  ) => {
    const u = updatedUser ? { ...user, ...updatedUser } : user;
    const s = updatedSkills ?? skills;
    const p = updatedProjects ?? projects;
    const e = updatedExp ?? experiences;
    const c = updatedCerts ?? certifications;
    const n = updatedSteps ?? nextSteps;

    const newScore = calculateCareerReadiness(u, s, p, e, c, n);
    setCareerReadiness(newScore);
    studentApi.updateProfile({ careerReadiness: newScore.overall }).catch(() => {});
    return newScore;
  };

  // Admin Platform Analytics & Live Reports
  const [platformAnalytics, setPlatformAnalytics] = useState<{
    academic?: AcademicAnalyticsData;
    skills?: SkillAnalyticsData;
    projects?: ProjectAnalyticsData;
    experience?: ExperienceAnalyticsData;
    career?: CareerAnalyticsData;
    roadmap?: RoadmapAnalyticsData;
  } | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationBroadcast[]>([]);

  // Dynamic Profile Completion Percentage & Checklist based on live state
  const dynamicProfileCompletion = useMemo(
    () => calculateProfileCompletion(user, skills, projects, experiences),
    [user, skills, projects, experiences]
  );

  const dynamicChecklistItems = useMemo(
    () => getDynamicChecklistItems(user, skills, projects, experiences),
    [user, skills, projects, experiences]
  );

  const effectiveUser = useMemo<StudentUser>(
    () => ({
      ...user,
      profileCompletion: dynamicProfileCompletion,
      certifications,
    }),
    [user, dynamicProfileCompletion, certifications]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [isCareerGoalOpen, setIsCareerGoalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<NextActionItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // -------------------------------------------------------------
  // Admin Control Center State
  // -------------------------------------------------------------
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');
  const [adminUser, setAdminUser] = useState<AdminUser>(defaultEmptyAdminUser);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminStudents, setAdminStudents] = useState<AdminStudentItem[]>([]);
  const [adminStats, setAdminStats] = useState<PlatformTopStats>(defaultEmptyAdminStats);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [applications, setApplications] = useState<OpportunityApplicationItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selectedAdminStudent, setSelectedAdminStudent] = useState<AdminStudentItem | null>(null);

  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [isAdminNotificationsOpen, setIsAdminNotificationsOpen] = useState(false);
  const [isAdminHelpOpen, setIsAdminHelpOpen] = useState(false);
  const [isAdminNewOppOpen, setIsAdminNewOppOpen] = useState(false);
  const [isAdminNewAnnOpen, setIsAdminNewAnnOpen] = useState(false);
  const [isAdminMobileSidebarOpen, setIsAdminMobileSidebarOpen] = useState(false);

  // -------------------------------------------------------------
  // Initial Data & Session Hydration from Supabase
  // -------------------------------------------------------------
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi
        .getMe()
        .then(async (res) => {
          if (res.success && res.user) {
            setIsAuthenticated(true);
            if (res.user.role === 'admin') {
              setRole('admin');
              if (res.profile) setAdminUser((prev) => ({ ...prev, ...res.profile }));
              // Hydrate admin data
              const [stRes, statsRes, logsRes, appsRes, analyticsRes, reportsRes, notifsRes] = await Promise.all([
                adminApi.getStudents().catch(() => ({ success: false, data: null })),
                adminApi.getStats().catch(() => ({ success: false, data: null })),
                adminApi.getActivityLogs().catch(() => ({ success: false, data: null })),
                adminApi.getApplications().catch(() => ({ success: false, data: null })),
                adminApi.getPlatformAnalytics().catch(() => ({ success: false, data: null })),
                reportsApi.getAll().catch(() => ({ success: false, data: null })),
                notificationsApi.getAll().catch(() => ({ success: false, data: null })),
              ]);
              if (stRes.success && stRes.data) setAdminStudents(stRes.data);
              if (statsRes.success && statsRes.data) setAdminStats(statsRes.data);
              if (logsRes.success && logsRes.data) setActivityLogs(logsRes.data);
              if (appsRes.success && appsRes.data) setApplications(appsRes.data);
              if (analyticsRes.success && analyticsRes.data) setPlatformAnalytics(analyticsRes.data);
              if (reportsRes.success && Array.isArray(reportsRes.data)) setReports(reportsRes.data);
              if (notifsRes.success && Array.isArray(notifsRes.data)) setAdminNotifications(notifsRes.data);
            } else {
              setRole('student');
              // Hydrate student data from DB
              const [profileRes, notifsRes] = await Promise.all([
                studentApi.getProfile().catch(() => ({ success: false, data: null })),
                notificationsApi.getAll().catch(() => ({ success: false, data: null })),
              ]);
              if (profileRes.success && profileRes.data) {
                const d = profileRes.data;
                setUser(d);
                const s = d.skills || [];
                const p = d.projects || [];
                const e = d.experiences || [];
                const c = d.certifications || [];
                const rt = d.roadmapTasks || [];
                setSkills(s);
                setProjects(p);
                setExperiences(e);
                setCertifications(c);
                if (d.semesterDetails && d.semesterDetails.length > 0) setSemesters(d.semesterDetails);
                if (d.recentActivities) setRecentActivities(d.recentActivities);
                if (d.achievements) setAchievements(d.achievements);
                if (d.skillGrowth && d.skillGrowth.length > 0) setSkillGrowth(d.skillGrowth);
                if (d.roadmapTasks) setNextSteps(rt);

                // Compute dynamic zero-to-hero readiness
                const computed = calculateCareerReadiness(d, s, p, e, c, rt);
                setCareerReadiness(computed);
              }
              if (notifsRes.success && Array.isArray(notifsRes.data)) {
                setNotifications(notifsRes.data);
              }
            }
          } else {
            removeToken();
            setIsAuthenticated(false);
          }
        })
        .catch((err) => {
          console.warn('Auth session hydration error:', err);
          removeToken();
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsHydratingAuth(false);
        });
    } else {
      setIsHydratingAuth(false);
    }

    // Load Live Opportunities from Database
    opportunitiesApi
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setOpportunities(res.data);
        }
      })
      .catch(() => {});

    // Load Live Announcements from Database
    announcementsApi
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAnnouncements(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // -------------------------------------------------------------
  // Session & Onboarding Handlers
  // -------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    setIsAuthenticated(false);
    setAuthMode('login');
  };

  const handleStartOnboarding = () => {
    setIsAuthenticated(false);
    setAuthMode('onboarding');
  };

  const handleLoginAsStudent = async (email?: string, password?: string) => {
    const finalEmail = (email || '').trim();
    const finalPassword = password || '';
    if (!finalEmail || !finalPassword) {
      throw new Error('Email and password are required.');
    }
    const res = await authApi.login(finalEmail, finalPassword);
    if (!res.success || !res.token) {
      throw new Error(res.error || 'Login failed. Please check your credentials.');
    }
    setToken(res.token);

    if (res.user?.role === 'admin') {
      setRole('admin');
      if (res.profile) setAdminUser((prev) => ({ ...prev, ...res.profile }));
      const [studentsRes, statsRes, logsRes, appsRes, analyticsRes, reportsRes, notifsRes] = await Promise.all([
        adminApi.getStudents().catch(() => ({ success: false, data: null })),
        adminApi.getStats().catch(() => ({ success: false, data: null })),
        adminApi.getActivityLogs().catch(() => ({ success: false, data: null })),
        adminApi.getApplications().catch(() => ({ success: false, data: null })),
        adminApi.getPlatformAnalytics().catch(() => ({ success: false, data: null })),
        reportsApi.getAll().catch(() => ({ success: false, data: null })),
        notificationsApi.getAll().catch(() => ({ success: false, data: null })),
      ]);
      if (studentsRes.success && studentsRes.data) setAdminStudents(studentsRes.data);
      if (statsRes.success && statsRes.data) setAdminStats(statsRes.data);
      if (logsRes.success && logsRes.data) setActivityLogs(logsRes.data);
      if (appsRes.success && appsRes.data) setApplications(appsRes.data);
      if (analyticsRes.success && analyticsRes.data) setPlatformAnalytics(analyticsRes.data);
      if (reportsRes.success && Array.isArray(reportsRes.data)) setReports(reportsRes.data);
      if (notifsRes.success && Array.isArray(notifsRes.data)) setAdminNotifications(notifsRes.data);
      setIsAuthenticated(true);
      setAdminActiveTab('dashboard');
      return;
    }

    const [meRes, notifsRes] = await Promise.all([
      studentApi.getProfile().catch(() => ({ success: false, data: null })),
      notificationsApi.getAll().catch(() => ({ success: false, data: null })),
    ]);
    if (meRes.success && meRes.data) {
      const d = meRes.data;
      setUser(d);
      const s = d.skills || [];
      const p = d.projects || [];
      const e = d.experiences || [];
      const c = d.certifications || [];
      const rt = d.roadmapTasks || [];
      setSkills(s);
      setProjects(p);
      setExperiences(e);
      setCertifications(c);
      if (d.semesterDetails && d.semesterDetails.length > 0) setSemesters(d.semesterDetails);
      if (d.recentActivities) setRecentActivities(d.recentActivities);
      if (d.achievements) setAchievements(d.achievements);
      if (d.skillGrowth && d.skillGrowth.length > 0) setSkillGrowth(d.skillGrowth);
      if (d.roadmapTasks) setNextSteps(rt);

      const computed = calculateCareerReadiness(d, s, p, e, c, rt);
      setCareerReadiness(computed);
    } else if (res.profile) {
      setUser(res.profile);
    }
    if (notifsRes.success && Array.isArray(notifsRes.data)) {
      setNotifications(notifsRes.data);
    }
    setRole('student');
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLoginAsAdmin = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Admin email and password are required');
    }
    const res = await authApi.login(email.trim(), password);
    if (!res.success || !res.token) {
      throw new Error(res.error || 'Admin login failed');
    }
    setToken(res.token);
    if (res.profile) setAdminUser((prev) => ({ ...prev, ...res.profile }));
    const [studentsRes, statsRes, logsRes, appsRes, analyticsRes, reportsRes, notifsRes] = await Promise.all([
      adminApi.getStudents().catch(() => ({ success: false, data: null })),
      adminApi.getStats().catch(() => ({ success: false, data: null })),
      adminApi.getActivityLogs().catch(() => ({ success: false, data: null })),
      adminApi.getApplications().catch(() => ({ success: false, data: null })),
      adminApi.getPlatformAnalytics().catch(() => ({ success: false, data: null })),
      reportsApi.getAll().catch(() => ({ success: false, data: null })),
      notificationsApi.getAll().catch(() => ({ success: false, data: null })),
    ]);
    if (studentsRes.success && studentsRes.data) setAdminStudents(studentsRes.data);
    if (statsRes.success && statsRes.data) setAdminStats(statsRes.data);
    if (logsRes.success && logsRes.data) setActivityLogs(logsRes.data);
    if (appsRes.success && appsRes.data) setApplications(appsRes.data);
    if (analyticsRes.success && analyticsRes.data) setPlatformAnalytics(analyticsRes.data);
    if (reportsRes.success && Array.isArray(reportsRes.data)) setReports(reportsRes.data);
    if (notifsRes.success && Array.isArray(notifsRes.data)) setAdminNotifications(notifsRes.data);
    setRole('admin');
    setIsAuthenticated(true);
    setAdminActiveTab('dashboard');
  };

  const handleCompleteOnboarding = async (
    userProfile: StudentUser,
    selectedSkillsList: SkillProgressItem[],
    projectsList: ProjectItem[],
    experienceList: ExperienceItem[],
    readiness: CareerReadinessBreakdown,
    customNextSteps?: NextActionItem[],
    password?: string,
    semesterDetailsList?: SemesterDetail[],
    strategicAdvice?: string,
    criticalSkillGaps?: string[]
  ) => {
    const enrichedUser: StudentUser = {
      ...userProfile,
      strategicAdvice: strategicAdvice || userProfile.strategicAdvice,
      criticalSkillGaps: criticalSkillGaps || userProfile.criticalSkillGaps,
    };

    setUser(enrichedUser);
    if (selectedSkillsList.length > 0) setSkills(selectedSkillsList);
    if (projectsList.length > 0) setProjects(projectsList);
    if (experienceList.length > 0) setExperiences(experienceList);
    if (semesterDetailsList && semesterDetailsList.length > 0) setSemesters(semesterDetailsList);
    if (customNextSteps && customNextSteps.length > 0) setNextSteps(customNextSteps);
    setCareerReadiness(readiness);

    try {
      const regRes = await authApi.register({
        email: userProfile.email,
        password: password || 'CampusOSPass@2025!',
        name: userProfile.name,
        degree: userProfile.degree,
        university: userProfile.university,
        semester: userProfile.semester,
        careerGoal: userProfile.careerGoal,
      });

      if (!regRes.success || !regRes.token) {
        throw new Error(regRes.error || 'Failed to authenticate user.');
      }

      const token = regRes.token;
      setToken(token);

      await studentApi.saveOnboarding({
        degree: userProfile.degree,
        university: userProfile.university,
        semester: userProfile.semester,
        totalSemesters: userProfile.totalSemesters || 8,
        completedSemesters: userProfile.completedSemesters,
        careerGoal: userProfile.careerGoal,
        skills: selectedSkillsList,
        headline: userProfile.headline,
        aboutMe: userProfile.aboutMe,
        location: userProfile.location,
        gpa: userProfile.gpa,
        educationDates: userProfile.educationDates,
        relevantCoursework: userProfile.relevantCoursework,
        semesterDetails: semesterDetailsList,
        projects: projectsList,
        experiences: experienceList,
        careerReadiness: readiness.overall,
        nextSteps: customNextSteps,
        strategicAdvice,
        criticalSkillGaps,
      });

      // Hydrate fresh state from DB
      const profileRes = await studentApi.getProfile();
      if (profileRes.success && profileRes.data) {
        const d = profileRes.data;
        setUser({
          ...d,
          strategicAdvice: strategicAdvice || d.strategicAdvice,
          criticalSkillGaps: criticalSkillGaps || d.criticalSkillGaps,
        });
        if (d.skills && d.skills.length > 0) setSkills(d.skills);
        if (d.projects && d.projects.length > 0) setProjects(d.projects);
        if (d.experiences && d.experiences.length > 0) setExperiences(d.experiences);
        if (d.certifications && d.certifications.length > 0) setCertifications(d.certifications);
        if (d.semesterDetails && d.semesterDetails.length > 0) setSemesters(d.semesterDetails);
        if (d.recentActivities && d.recentActivities.length > 0) setRecentActivities(d.recentActivities);
        if (d.achievements && d.achievements.length > 0) setAchievements(d.achievements);
        if (d.skillGrowth && d.skillGrowth.length > 0) setSkillGrowth(d.skillGrowth);
        if (d.roadmapTasks && d.roadmapTasks.length > 0) setNextSteps(d.roadmapTasks);
      }
    } catch (err) {
      console.error('Onboarding backend sync error:', err);
    }

    setRole('student');
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  // Student Actions Handlers
  const handleAddExperience = async (newExp: ExperienceItem) => {
    const nextExp = [newExp, ...experiences];
    setExperiences(nextExp);
    try {
      const res = await studentApi.addExperience(newExp);
      if (res.success && res.data?.id) {
        setExperiences((prev) => prev.map((e) => (e.id === newExp.id ? { ...e, id: res.data.id } : e)));
      }
    } catch (err) {
      console.warn('Sync experience error:', err);
    }

    const newScore = updateReadiness(undefined, undefined, undefined, nextExp);
    pushNotification(
      'Experience Verified',
      `Logged professional role: ${newExp.title} at ${newExp.company}. Career readiness improved to ${newScore.overall}%!`,
      'profile'
    );
    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'added',
        title: 'Added role:',
        target: `${newExp.title} at ${newExp.company}`,
        timeAgo: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleAddProject = async (newProj: ProjectItem) => {
    const nextProj = [newProj, ...projects];
    setProjects(nextProj);
    try {
      const res = await studentApi.addProject(newProj);
      if (res.success && res.data?.id) {
        setProjects((prev) => prev.map((p) => (p.id === newProj.id ? { ...p, id: res.data.id } : p)));
      }
    } catch (err) {
      console.warn('Sync project error:', err);
    }

    const newScore = updateReadiness(undefined, undefined, nextProj);
    pushNotification(
      'Project Showcase Added',
      `Added verified project "${newProj.title}" [${newProj.category}]. Career readiness surged to ${newScore.overall}%!`,
      'profile'
    );
    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'added',
        title: 'Added project:',
        target: newProj.title,
        timeAgo: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleAddSkill = async (newSkill: SkillProgressItem) => {
    const nextSkills = [...skills, newSkill];
    setSkills(nextSkills);
    try {
      const res = await studentApi.addSkill(newSkill);
      if (res.success && res.data?.id) {
        setSkills((prev) => prev.map((s) => (s.id === newSkill.id ? { ...s, id: res.data.id } : s)));
      }
    } catch (err) {
      console.warn('Sync skill error:', err);
    }

    const newScore = updateReadiness(undefined, nextSkills);
    pushNotification(
      'Technical Skill Added',
      `Added ${newSkill.name} (${newSkill.level}) to your verified skills passport. Readiness: ${newScore.overall}%.`,
      'profile'
    );
    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'added',
        title: 'Added skill:',
        target: newSkill.name,
        timeAgo: 'Just now',
      },
      ...prev,
    ]);

    const curMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    setSkillGrowth((prev) =>
      prev.map((m) => (m.month === curMonth ? { ...m, points: Math.min(350, m.points + 5) } : m))
    );
  };

  const handleRemoveSkill = (skillId: string) => {
    const updated = skills.filter((s) => s.id !== skillId);
    setSkills(updated);
    updateReadiness(undefined, updated);
    studentApi.deleteSkill(skillId).catch((err) => console.warn('Delete skill error:', err));
  };

  const handleAddCertification = async (newCert: CertificationItem) => {
    const nextCerts = [newCert, ...certifications];
    setCertifications(nextCerts);
    try {
      const res = await studentApi.addCertification(newCert);
      if (res.success && res.data?.id) {
        setCertifications((prev) => prev.map((c) => (c.id === newCert.id ? { ...c, id: res.data.id } : c)));
      }
    } catch (err) {
      console.warn('Sync certification error:', err);
    }

    const newScore = updateReadiness(undefined, undefined, undefined, undefined, nextCerts);
    pushNotification(
      'Certification Recorded',
      `Earned verified credential: ${newCert.title} from ${newCert.organization}. Readiness: ${newScore.overall}%!`,
      'profile'
    );
    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'added',
        title: 'Added credential:',
        target: `${newCert.title} (${newCert.organization})`,
        timeAgo: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleUpdateCertification = async (id: string, updatedCert: Partial<CertificationItem>) => {
    const nextCerts = certifications.map((c) => (c.id === id ? { ...c, ...updatedCert } : c));
    setCertifications(nextCerts);
    updateReadiness(undefined, undefined, undefined, undefined, nextCerts);
    try {
      await studentApi.updateCertification(id, updatedCert);
    } catch (err) {
      console.warn('Update certification error:', err);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    const nextCerts = certifications.filter((c) => c.id !== id);
    setCertifications(nextCerts);
    updateReadiness(undefined, undefined, undefined, undefined, nextCerts);
    try {
      await studentApi.deleteCertification(id);
    } catch (err) {
      console.warn('Delete certification error:', err);
    }
  };

  const handleUpdateUser = async (updated: Partial<StudentUser>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    if (updated.certifications) {
      setCertifications(updated.certifications);
    }
    updateReadiness(updated, undefined, undefined, undefined, updated.certifications);
    pushNotification('Profile Updated', 'Your academic profile and credentials have been updated.', 'profile');
    try {
      if (updated.notificationPreferences) {
        studentApi.updatePreferences(updated.notificationPreferences).catch(() => {});
      }
      const res = await studentApi.updateProfile(updated);
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn('Sync profile update error:', err);
    }
  };

  const handleUpdateCareerGoal = (goal: string) => {
    setUser((prev) => ({ ...prev, careerGoal: goal }));
    const newScore = updateReadiness({ careerGoal: goal });
    pushNotification(
      'Career Track Set',
      `Target goal updated to ${goal}. Roadmaps & readiness re-indexed to ${newScore.overall}%.`,
      'profile'
    );
    studentApi.updateProfile({ careerGoal: goal }).catch((err) => console.warn('Update career goal error:', err));

    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'updated',
        title: 'Updated career goal:',
        target: goal,
        timeAgo: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleCompleteAction = (actionId: string) => {
    const nextNextSteps = nextSteps.map((step) => (step.id === actionId ? { ...step, status: 'completed' as const } : step));
    setNextSteps(nextNextSteps);
    studentApi.updateRoadmapTask(actionId, { status: 'completed' }).catch((err) => console.warn('Update roadmap task error:', err));

    const newScore = updateReadiness(undefined, undefined, undefined, undefined, undefined, nextNextSteps);
    pushNotification(
      'Milestone Completed! 🎯',
      `Accomplished roadmap milestone step. Readiness increased to ${newScore.overall}%!`,
      'roadmap'
    );

    const curMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    setSkillGrowth((prev) => {
      const hasMonth = prev.some((m) => m.month === curMonth);
      if (hasMonth) {
        return prev.map((m) => (m.month === curMonth ? { ...m, points: Math.min(350, m.points + 10) } : m));
      }
      return [...prev, { month: curMonth, points: 120 }];
    });
    studentApi.addSkillGrowth({ month: curMonth, points: 120 }).catch(() => {});

    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'completed',
        title: 'Completed milestone:',
        target: 'Roadmap action step',
        timeAgo: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleToggleActionStatus = (actionId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    const nextNextSteps = nextSteps.map((step) => (step.id === actionId ? { ...step, status: newStatus } : step));
    setNextSteps(nextNextSteps);
    studentApi.updateRoadmapTask(actionId, { status: newStatus }).catch((err) => console.warn('Update roadmap task error:', err));

    if (newStatus === 'completed') {
      const newScore = updateReadiness(undefined, undefined, undefined, undefined, undefined, nextNextSteps);
      pushNotification(
        'Milestone Completed! 🎯',
        `Accomplished roadmap milestone. Readiness is now ${newScore.overall}%!`,
        'roadmap'
      );

      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: 'completed',
          title: 'Completed milestone:',
          target: 'Roadmap action step',
          timeAgo: 'Just now',
        },
        ...prev,
      ]);
    }
  };

  const handleAddRoadmapTask = async (taskData: any) => {
    try {
      const nextNum = String(nextSteps.length + 1).padStart(2, '0');
      const res = await studentApi.addRoadmapTask({
        number: nextNum,
        title: taskData.title,
        category: taskData.category || 'Project',
        priority: taskData.priority || 'Medium',
        estimatedTime: taskData.estimatedTime || '2 weeks',
        actionType: taskData.actionType || 'Milestone',
        status: taskData.status || 'pending',
        source: 'manual',
      });
      if (res.success && res.data) {
        setNextSteps((prev) => [...prev, res.data]);
        setRecentActivities((prev) => [
          {
            id: `act-${Date.now()}`,
            type: 'updated',
            title: 'Added roadmap milestone:',
            target: taskData.title,
            timeAgo: 'Just now',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.warn('Add roadmap task error:', err);
    }
  };

  const handleDeleteRoadmapTask = (actionId: string) => {
    setNextSteps((prev) => prev.filter((step) => step.id !== actionId));
    studentApi.deleteRoadmapTask(actionId).catch((err) => console.warn('Delete roadmap task error:', err));
  };

  const handleRecalibrateRoadmap = async () => {
    try {
      const res = await studentApi.regenerateRoadmap();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setNextSteps(res.data);
      }
    } catch (err) {
      console.warn('Recalibrate roadmap error:', err);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    notificationsApi.markAllAsRead().catch((err) => console.warn('Mark all as read error:', err));
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    const mainContainer = document.getElementById('main-content-scroll') || document.getElementById('admin-main-content-scroll');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Admin Handlers
  const handleToggleStudentStatus = (id: string) => {
    const student = adminStudents.find((s) => s.id === id);
    const nextStatus = student?.status === 'Active' ? 'Needs Attention' : 'Active';
    setAdminStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
    adminApi.updateStudent(id, { status: nextStatus }).catch((err) => console.warn('Update student status error:', err));
  };

  const handleResetStudentOnboarding = (id: string) => {
    setAdminStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, profileCompletion: 25, onboardingStatus: 'In Progress' } : s))
    );
    adminApi.updateStudent(id, { profileCompletion: 25, onboardingStatus: 'In Progress' }).catch(() => {});
  };

  const handleUpdateStudentNotes = (id: string, notes: string) => {
    setAdminStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, advisorNotes: notes } : s))
    );
    if (selectedAdminStudent && selectedAdminStudent.id === id) {
      setSelectedAdminStudent((prev) => (prev ? { ...prev, advisorNotes: notes } : null));
    }
    adminApi.updateStudent(id, { advisorNotes: notes }).catch((err) => console.warn('Update notes error:', err));
  };

  const handleAddOpportunity = (newOpp: OpportunityItem) => {
    setOpportunities((prev) => [newOpp, ...prev]);
    opportunitiesApi.create(newOpp).catch((err) => console.warn('Create opportunity error:', err));
  };

  const handleAddAnnouncement = (newAnn: AnnouncementItem) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
    announcementsApi.create(newAnn).catch((err) => console.warn('Create announcement error:', err));
  };


  // =============================================================
  // RENDER: SESSION HYDRATION LOADING STATE
  // =============================================================
  if (isHydratingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-white">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#283593] to-[#4338CA] shadow-[0_0_35px_rgba(40,53,147,0.7)] border border-[#8F9CFE]/40">
            <span className="font-black text-2xl tracking-wider text-white">CO</span>
            <div className="absolute -inset-1 rounded-2xl border border-[#8F9CFE]/30 animate-pulse"></div>
          </div>
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8F9CFE] border-t-transparent"></div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">Campus OS</p>
            <p className="text-xs text-slate-400 mt-0.5">Connecting securely to academic cloud...</p>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: AUTH & ONBOARDING FLOW
  // =============================================================
  if (!isAuthenticated) {
    return (
      <AuthOnboardingView
        initialMode={authMode}
        onLoginAsStudent={handleLoginAsStudent}
        onLoginAsAdmin={handleLoginAsAdmin}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  // =============================================================
  // RENDER: ADMIN CONTROL CENTER
  // =============================================================
  if (role === 'admin') {
    return (
      <AdminLayout
        admin={adminUser}
        activeTab={adminActiveTab}
        onSelectTab={setAdminActiveTab}
        searchQuery={adminSearchQuery}
        onSearchChange={setAdminSearchQuery}
        onOpenNotifications={() => setIsAdminNotificationsOpen(!isAdminNotificationsOpen)}
        onOpenHelp={() => setIsAdminHelpOpen(true)}
        onOpenSettings={() => setAdminActiveTab('settings')}
        onOpenProfile={() => setIsAdminProfileOpen(true)}
        onSwitchToStudent={() => setRole('student')}
        onLogout={handleLogout}
        studentsCount={adminStudents.length || adminStats.totalStudents}
      >
        {/* Route Admin Views */}
        {(adminActiveTab === 'dashboard' || adminActiveTab === 'admin-dashboard') && (
          <AdminDashboardView
            adminName={adminUser.name}
            stats={adminStats}
            students={adminStudents}
            activityLogs={activityLogs}
            onNavigateTab={setAdminActiveTab}
            onSelectStudent={setSelectedAdminStudent}
            onOpenNewAnnouncement={() => setIsAdminNewAnnOpen(true)}
            onOpenNewOpportunity={() => setIsAdminNewOppOpen(true)}
          />
        )}

        {(adminActiveTab === 'profile' ||
          adminActiveTab === 'admin-profile' ||
          adminActiveTab === 'credentials' ||
          adminActiveTab === 'admin-credentials') && (
          <AdminProfileView
            admin={adminUser}
            onUpdateAdmin={(updated) => setAdminUser(updated)}
          />
        )}

        {(adminActiveTab === 'student' ||
          adminActiveTab === 'students' ||
          adminActiveTab === 'admin-students' ||
          adminActiveTab === 'users' ||
          adminActiveTab === 'admin-users') && (
          <AdminStudentsView
            students={adminStudents}
            searchQuery={adminSearchQuery}
            onSearchChange={setAdminSearchQuery}
            onSelectStudent={setSelectedAdminStudent}
            onToggleStudentStatus={handleToggleStudentStatus}
            onResetStudentOnboarding={handleResetStudentOnboarding}
          />
        )}

        {(adminActiveTab === 'analytics' ||
          adminActiveTab === 'admin-analytics' ||
          adminActiveTab === 'platform-analytics' ||
          adminActiveTab === 'academic' ||
          adminActiveTab === 'skills' ||
          adminActiveTab === 'projects' ||
          adminActiveTab === 'experience' ||
          adminActiveTab === 'roadmaps' ||
          adminActiveTab === 'career') && (
          <AdminPlatformAnalyticsView
            academicData={platformAnalytics?.academic || emptyAcademicData}
            skillsData={platformAnalytics?.skills}
            projectsData={platformAnalytics?.projects}
            experienceData={platformAnalytics?.experience}
            careerData={platformAnalytics?.career}
            roadmapData={platformAnalytics?.roadmap}
          />
        )}

        {(adminActiveTab === 'opportunities' ||
          adminActiveTab === 'admin-opportunities') && (
          <AdminOpportunitiesView
            opportunities={opportunities}
            onOpenNewOpportunity={() => setIsAdminNewOppOpen(true)}
          />
        )}

        {(adminActiveTab === 'announcements' ||
          adminActiveTab === 'admin-announcements') && (
          <AdminAnnouncementsView
            announcements={announcements}
            onOpenNewAnnouncement={() => setIsAdminNewAnnOpen(true)}
          />
        )}

        {(adminActiveTab === 'notifications' ||
          adminActiveTab === 'admin-notifications') && (
          <AdminNotificationsView
            notifications={adminNotifications}
          />
        )}

        {(adminActiveTab === 'activity-logs' ||
          adminActiveTab === 'admin-activity-logs') && (
          <AdminActivityLogsView
            activityLogs={activityLogs}
          />
        )}


        {(adminActiveTab === 'settings' ||
          adminActiveTab === 'admin-settings') && (
          <AdminSettingsView />
        )}

        {(adminActiveTab === 'applications' ||
          adminActiveTab === 'admin-applications' ||
          adminActiveTab === 'opportunity-applications') && (
          <AdminApplicationsView applications={applications} />
        )}

        {(adminActiveTab === 'reports' ||
          adminActiveTab === 'admin-reports' ||
          adminActiveTab === 'application-reports' ||
          adminActiveTab === 'admin-application-reports') && (
          <AdminReportsView reports={reports} />
        )}

        {/* Modals & Flyouts */}
        <AdminStudentDetailModal
          student={selectedAdminStudent}
          isOpen={!!selectedAdminStudent}
          onClose={() => setSelectedAdminStudent(null)}
          onToggleStatus={handleToggleStudentStatus}
          onResetOnboarding={handleResetStudentOnboarding}
        />

        <AdminNotificationsFlyout
          isOpen={isAdminNotificationsOpen}
          onClose={() => setIsAdminNotificationsOpen(false)}
          notifications={adminNotifications}
          onNavigateToNotifications={() => setAdminActiveTab('notifications')}
        />

        <AdminHelpModal
          isOpen={isAdminHelpOpen}
          onClose={() => setIsAdminHelpOpen(false)}
        />

        <AdminNewOpportunityModal
          isOpen={isAdminNewOppOpen}
          onClose={() => setIsAdminNewOppOpen(false)}
          onAddOpportunity={handleAddOpportunity}
        />

        <AdminNewAnnouncementModal
          isOpen={isAdminNewAnnOpen}
          onClose={() => setIsAdminNewAnnOpen(false)}
          onAddAnnouncement={handleAddAnnouncement}
        />

        <AdminProfileModal
          isOpen={isAdminProfileOpen}
          onClose={() => setIsAdminProfileOpen(false)}
          admin={adminUser}
          onUpdateAdmin={(updated) => setAdminUser(updated)}
        />
      </AdminLayout>
    );
  }

  // =============================================================
  // RENDER: STUDENT PORTAL
  // =============================================================
  return (
    <DashboardLayout
      user={effectiveUser}
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onQuickAction={(action) => {
        if (action === 'roadmap') setActiveTab('roadmap');
      }}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
      onOpenSettings={() => handleSelectTab('settings')}
      isMobileSidebarOpen={isMobileSidebarOpen}
      setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      unreadCount={unreadCount}
      onSwitchToAdmin={() => setRole('admin')}
      onLogout={handleLogout}
      onStartOnboarding={handleStartOnboarding}
    >
      {/* Primary CampusOS Student Dashboard View */}
      {activeTab === 'dashboard' ? (
        <DashboardPage
          user={effectiveUser}
          checklistItems={dynamicChecklistItems}
          nextSteps={nextSteps}
          skills={skills}
          projects={projects}
          experiences={experiences}
          semesters={semesters}
          careerReadiness={careerReadiness}
          skillGrowth={skillGrowth}
          achievements={achievements}
          recentActivities={recentActivities}
          searchQuery={searchQuery}
          onAddExperience={handleAddExperience}
          onAddProject={handleAddProject}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onUpdateCareerGoal={handleUpdateCareerGoal}
          onCompleteAction={handleCompleteAction}
          onNavigateTab={handleSelectTab}
          onRecalibrateRoadmap={handleRecalibrateRoadmap}
        />
      ) : (
        <JourneySubviews
          user={effectiveUser}
          activeTab={activeTab}
          nextSteps={nextSteps}
          skills={skills}
          projects={projects}
          experiences={experiences}
          certifications={certifications}
          semesters={semesters}
          careerReadiness={careerReadiness}
          achievements={achievements}
          recentActivities={recentActivities}
          onBackToDashboard={() => setActiveTab('dashboard')}
          onAddProject={() => setIsAddProjOpen(true)}
          onAddExperience={() => setIsAddExpOpen(true)}
          onAddCertification={handleAddCertification}
          onUpdateCertification={handleUpdateCertification}
          onDeleteCertification={handleDeleteCertification}
          onUpdateSkills={() => setIsSkillsModalOpen(true)}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onUpdateCareerGoal={() => setIsCareerGoalOpen(true)}
          onSelectAction={(action) => setSelectedAction(action)}
          onToggleActionStatus={handleToggleActionStatus}
          onAddRoadmapTask={handleAddRoadmapTask}
          onDeleteRoadmapTask={handleDeleteRoadmapTask}
          onRecalibrateRoadmap={handleRecalibrateRoadmap}
          onNavigateTab={handleSelectTab}
          onUpdateUser={handleUpdateUser}
          onStartOnboarding={handleStartOnboarding}
          onLogout={handleLogout}
        />
      )}


      {/* Floating Notifications Flyout */}
      <NotificationsFlyout
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onMarkAsRead={handleMarkNotificationAsRead}
      />

      {/* Quick Add Modals */}
      <AddExperienceModal
        isOpen={isAddExpOpen}
        onClose={() => setIsAddExpOpen(false)}
        onAdd={handleAddExperience}
      />

      <AddProjectModal
        isOpen={isAddProjOpen}
        onClose={() => setIsAddProjOpen(false)}
        onAdd={handleAddProject}
      />

      <UpdateCareerGoalModal
        isOpen={isCareerGoalOpen}
        onClose={() => setIsCareerGoalOpen(false)}
        currentGoal={user.careerGoal}
        onUpdate={handleUpdateCareerGoal}
      />

      <UpdateSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={skills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
      />

      <ActionDetailModal
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        action={selectedAction}
        careerGoal={user.careerGoal}
        onCompleteAction={handleCompleteAction}
        onUpdateStatus={handleToggleActionStatus}
        onDeleteAction={handleDeleteRoadmapTask}
        onConsultGPT={(prompt) => handleSelectTab('ai-mentor')}
      />

      {/* Real-time Floating Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#8F9CFE]/80 bg-slate-900/95 backdrop-blur-md px-4 py-3 text-xs text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#283593] text-white">
            <Bell className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 max-w-xs">
            <p className="font-bold text-white text-[12px] truncate">{activeToast.title}</p>
            <p className="text-slate-300 text-[11px] leading-tight line-clamp-1">{activeToast.message}</p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="ml-1 rounded-lg p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
