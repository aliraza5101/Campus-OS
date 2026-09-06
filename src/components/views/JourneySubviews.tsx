import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { OpportunitiesView } from './OpportunitiesView';
import { AIMentorChatView } from './AIMentorChatView';
import { RoadmapView } from './RoadmapView';
import { AcademicProgressView } from './AcademicProgressView';
import { SkillsPortfolioView } from './SkillsPortfolioView';
import { VerifiedProjectsView } from './VerifiedProjectsView';
import { ExperienceRolesView } from './ExperienceRolesView';
import { SettingsView } from './SettingsView';
import {
  Compass,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  Target,
  Building2,
  Microscope,
  TrendingUp,
  Trophy,
  Activity,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Tag,
  ExternalLink,
  BookOpen,
  MapPin,
  Calendar,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  RotateCcw,
  Edit2,
  Code,
  Award,
} from 'lucide-react';
import {
  StudentUser,
  NextActionItem,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  SemesterDetail,
  CareerReadinessBreakdown,
  AchievementItem,
  RecentActivityItem,
  CertificationItem,
} from '../../types';

interface SubviewProps {
  user: StudentUser;
  activeTab: string;
  nextSteps: NextActionItem[];
  skills: SkillProgressItem[];
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  semesters: SemesterDetail[];
  careerReadiness: CareerReadinessBreakdown;
  achievements: AchievementItem[];
  recentActivities: RecentActivityItem[];
  certifications?: CertificationItem[];
  onAddCertification?: (cert: CertificationItem) => Promise<void> | void;
  onUpdateCertification?: (id: string, updatedCert: Partial<CertificationItem>) => Promise<void> | void;
  onDeleteCertification?: (id: string) => Promise<void> | void;
  onBackToDashboard: () => void;
  onAddProject: () => void;
  onAddExperience: () => void;
  onUpdateSkills: () => void;
  onAddSkill?: (skill: SkillProgressItem) => void;
  onRemoveSkill?: (skillId: string) => void;
  onUpdateCareerGoal: () => void;
  onSelectAction: (action: NextActionItem) => void;
  onToggleActionStatus?: (actionId: string, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onAddRoadmapTask?: (task: any) => Promise<void> | void;
  onDeleteRoadmapTask?: (actionId: string) => Promise<void> | void;
  onRecalibrateRoadmap?: () => Promise<void> | void;
  onNavigateTab?: (tab: string, prompt?: string) => void;
  onUpdateUser?: (updated: Partial<StudentUser>) => void;
  onStartOnboarding?: () => void;
  onLogout?: () => void;
}

export const JourneySubviews: React.FC<SubviewProps> = ({
  user,
  activeTab,
  nextSteps,
  skills,
  projects,
  experiences,
  semesters,
  careerReadiness,
  achievements,
  recentActivities,
  certifications: passedCertifications,
  onAddCertification,
  onUpdateCertification,
  onDeleteCertification,
  onBackToDashboard,
  onAddProject,
  onAddExperience,
  onUpdateSkills,
  onAddSkill,
  onRemoveSkill,
  onUpdateCareerGoal,
  onSelectAction,
  onToggleActionStatus,
  onAddRoadmapTask,
  onDeleteRoadmapTask,
  onRecalibrateRoadmap,
  onNavigateTab,
  onUpdateUser,
  onStartOnboarding,
  onLogout,
}) => {
  // Student Profile Photo & Edit Profile State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Technical Skills State
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState('Machine Learning & AI');
  const [skillInputError, setSkillInputError] = useState<string | null>(null);

  // Education Section State & Default Coursework
  const defaultCoursework = [
    'Data Structures & Algorithms',
    'Machine Learning',
    'Deep Learning & Neural Networks',
    'Database Systems',
    'Computer Vision',
    'Artificial Intelligence',
    'Linear Algebra & Calculus',
    'Natural Language Processing',
  ];

  const [isEditEducationOpen, setIsEditEducationOpen] = useState(false);
  const [educationForm, setEducationForm] = useState({
    degree: user.degree,
    university: user.university,
    educationDates: user.educationDates || '2022 - 2026 (Expected)',
    semester: user.semester,
    gpa: user.gpa,
    relevantCoursework: user.relevantCoursework && user.relevantCoursework.length > 0 ? user.relevantCoursework : defaultCoursework,
  });
  const [educationErrors, setEducationErrors] = useState<Record<string, string>>({});
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [courseInputError, setCourseInputError] = useState<string | null>(null);

  // Inline Coursework Tag State
  const [isAddingCourseInline, setIsAddingCourseInline] = useState(false);
  const [inlineCourseInput, setInlineCourseInput] = useState('');

  const handleOpenEditEducation = () => {
    setEducationForm({
      degree: user.degree,
      university: user.university,
      educationDates: user.educationDates || '2022 - 2026 (Expected)',
      semester: user.semester,
      gpa: user.gpa,
      relevantCoursework: user.relevantCoursework && user.relevantCoursework.length > 0 ? user.relevantCoursework : defaultCoursework,
    });
    setEducationErrors({});
    setNewCourseName('');
    setCourseInputError(null);
    setIsEditEducationOpen(true);
  };

  const handleAddCourseworkToModal = (courseToAdd: string) => {
    const trimmed = courseToAdd.trim();
    if (!trimmed) {
      setCourseInputError('Please enter a course name');
      return;
    }
    if (educationForm.relevantCoursework.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCourseInputError(`"${trimmed}" is already in the list.`);
      return;
    }
    setEducationForm((prev) => ({
      ...prev,
      relevantCoursework: [...prev.relevantCoursework, trimmed],
    }));
    setNewCourseName('');
    setCourseInputError(null);
  };

  const handleRemoveCourseworkFromModal = (courseToRemove: string) => {
    setEducationForm((prev) => ({
      ...prev,
      relevantCoursework: prev.relevantCoursework.filter((c) => c !== courseToRemove),
    }));
  };

  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!educationForm.degree.trim()) {
      errors.degree = 'Degree program is required';
    }
    if (!educationForm.university.trim()) {
      errors.university = 'University name is required';
    }
    const semNum = Number(educationForm.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 12) {
      errors.semester = 'Semester must be between 1 and 12';
    }
    const gpaNum = Number(educationForm.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      errors.gpa = 'CGPA must be between 0.00 and 4.00';
    }

    if (Object.keys(errors).length > 0) {
      setEducationErrors(errors);
      return;
    }

    setIsSavingEducation(true);
    if (onUpdateUser) {
      onUpdateUser({
        degree: educationForm.degree.trim(),
        university: educationForm.university.trim(),
        educationDates: educationForm.educationDates.trim(),
        semester: semNum,
        gpa: parseFloat(gpaNum.toFixed(2)),
        relevantCoursework: educationForm.relevantCoursework,
      });
    }
    setIsSavingEducation(false);
    setIsEditEducationOpen(false);
    setPhotoFeedback('Education details updated successfully!');
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  const handleAddInlineCoursework = (courseToAdd: string) => {
    const trimmed = courseToAdd.trim();
    if (!trimmed) return;
    const currentList = user.relevantCoursework && user.relevantCoursework.length > 0 ? user.relevantCoursework : defaultCoursework;
    if (currentList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
    const updated = [...currentList, trimmed];
    if (onUpdateUser) {
      onUpdateUser({ relevantCoursework: updated });
    }
    setInlineCourseInput('');
    setIsAddingCourseInline(false);
    setPhotoFeedback(`Added "${trimmed}" to relevant coursework!`);
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  const handleRemoveInlineCoursework = (courseToRemove: string) => {
    const currentList = user.relevantCoursework && user.relevantCoursework.length > 0 ? user.relevantCoursework : defaultCoursework;
    const updated = currentList.filter((c) => c !== courseToRemove);
    if (onUpdateUser) {
      onUpdateUser({ relevantCoursework: updated });
    }
    setPhotoFeedback(`Removed "${courseToRemove}" from coursework.`);
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  const handleAddSkillSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) {
      setSkillInputError('Please enter a skill name');
      return;
    }

    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInputError(`"${trimmed}" is already in your technical skills.`);
      return;
    }

    const defaultPct =
      newSkillLevel === 'Expert' ? 95 : newSkillLevel === 'Advanced' ? 85 : newSkillLevel === 'Intermediate' ? 65 : 45;

    const newSkillItem: SkillProgressItem = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      level: newSkillLevel,
      percentage: defaultPct,
      category: newSkillCategory.trim() || 'Technical',
      verified: false,
    };

    if (onAddSkill) {
      onAddSkill(newSkillItem);
    }
    setNewSkillName('');
    setSkillInputError(null);
    setIsAddingSkill(false);
    setPhotoFeedback(`Added "${trimmed}" to your technical skills!`);
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  const handleQuickAddSkill = (skillName: string, category: string = 'Technical', level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = 'Intermediate') => {
    if (skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      return;
    }
    const defaultPct = level === 'Expert' ? 95 : level === 'Advanced' ? 85 : level === 'Intermediate' ? 70 : 45;
    const newSkillItem: SkillProgressItem = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: skillName,
      level: level,
      percentage: defaultPct,
      category: category,
      verified: false,
    };
    if (onAddSkill) {
      onAddSkill(newSkillItem);
    }
    setPhotoFeedback(`Added "${skillName}" to your technical skills!`);
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  const handleRemoveSkillItem = (skillId: string, skillName: string) => {
    if (onRemoveSkill) {
      onRemoveSkill(skillId);
    }
    setPhotoFeedback(`Removed "${skillName}" from technical skills.`);
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  // Certifications & Achievements Section State & Default Items
  const defaultCertifications: CertificationItem[] = [
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

  const currentCertifications =
    passedCertifications !== undefined
      ? passedCertifications
      : (user.certifications !== undefined ? user.certifications : defaultCertifications);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [certForm, setCertForm] = useState({
    title: '',
    organization: '',
    date: '',
    certificateLink: '',
    credentialId: '',
  });
  const [certErrors, setCertErrors] = useState<Record<string, string>>({});
  const [isSavingCert, setIsSavingCert] = useState(false);
  const [certToDelete, setCertToDelete] = useState<CertificationItem | null>(null);

  const handleOpenAddCert = () => {
    setEditingCert(null);
    setCertForm({
      title: '',
      organization: '',
      date: '',
      certificateLink: '',
      credentialId: '',
    });
    setCertErrors({});
    setIsCertModalOpen(true);
  };

  const handleOpenEditCert = (cert: CertificationItem) => {
    setEditingCert(cert);
    setCertForm({
      title: cert.title,
      organization: cert.organization,
      date: cert.date,
      certificateLink: cert.certificateLink || '',
      credentialId: cert.credentialId || '',
    });
    setCertErrors({});
    setIsCertModalOpen(true);
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!certForm.title.trim()) {
      errors.title = 'Certification / Achievement title is required';
    }
    if (!certForm.organization.trim()) {
      errors.organization = 'Issuing organization is required';
    }
    if (!certForm.date.trim()) {
      errors.date = 'Issue date or period is required';
    }

    if (Object.keys(errors).length > 0) {
      setCertErrors(errors);
      return;
    }

    setIsSavingCert(true);
    let link = certForm.certificateLink.trim();
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      link = `https://${link}`;
    }

    if (editingCert) {
      const updatedItem: Partial<CertificationItem> = {
        title: certForm.title.trim(),
        organization: certForm.organization.trim(),
        date: certForm.date.trim(),
        certificateLink: link,
        credentialId: certForm.credentialId.trim() || undefined,
      };

      if (onUpdateCertification) {
        onUpdateCertification(editingCert.id, updatedItem);
      } else if (onUpdateUser) {
        const updatedList = currentCertifications.map((item) =>
          item.id === editingCert.id ? { ...item, ...updatedItem } : item
        );
        onUpdateUser({ certifications: updatedList });
      }
      setPhotoFeedback(`Updated "${certForm.title.trim()}" successfully!`);
    } else {
      const newCert: CertificationItem = {
        id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: certForm.title.trim(),
        organization: certForm.organization.trim(),
        date: certForm.date.trim(),
        certificateLink: link,
        credentialId: certForm.credentialId.trim() || undefined,
      };

      if (onAddCertification) {
        onAddCertification(newCert);
      } else if (onUpdateUser) {
        onUpdateUser({ certifications: [newCert, ...currentCertifications] });
      }
      setPhotoFeedback(`Added "${certForm.title.trim()}" to certifications!`);
    }

    setIsSavingCert(false);
    setIsCertModalOpen(false);
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  const handleDeleteCert = (cert: CertificationItem) => {
    if (onDeleteCertification) {
      onDeleteCertification(cert.id);
    } else if (onUpdateUser) {
      const updatedCertList = currentCertifications.filter((c) => c.id !== cert.id);
      onUpdateUser({ certifications: updatedCertList });
    }
    setCertToDelete(null);
    setPhotoFeedback(`Removed "${cert.title}".`);
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  // Student Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    headline: user.headline || '',
    location: user.location,
    aboutMe: user.aboutMe || '',
    degree: user.degree,
    semester: user.semester,
    gpa: user.gpa,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleOpenEditProfile = () => {
    setEditForm({
      name: user.name,
      headline: user.headline || 'Aspiring AI & Machine Learning Engineer | Deep Learning & Intelligent Systems',
      location: user.location,
      aboutMe: user.aboutMe || 'Passionate Artificial Intelligence student dedicated to building scalable machine learning pipelines, computer vision models, and full-stack intelligent applications. Active contributor to campus developer clubs and hackathons.',
      degree: user.degree,
      semester: user.semester,
      gpa: user.gpa,
    });
    setEditErrors({});
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!editForm.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!editForm.degree.trim()) {
      errors.degree = 'Degree program is required';
    }
    const semNum = Number(editForm.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 12) {
      errors.semester = 'Semester must be a number between 1 and 12';
    }
    const gpaNum = Number(editForm.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      errors.gpa = 'CGPA must be between 0.00 and 4.00';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    if (onUpdateUser) {
      onUpdateUser({
        name: editForm.name.trim(),
        headline: editForm.headline.trim(),
        location: editForm.location.trim(),
        aboutMe: editForm.aboutMe.trim(),
        degree: editForm.degree.trim(),
        semester: semNum,
        gpa: parseFloat(gpaNum.toFixed(2)),
      });
    }
    setIsSavingProfile(false);
    setIsEditProfileOpen(false);
    setPhotoFeedback('Profile details updated successfully!');
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  const handleFileProcess = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
      setIsPhotoModalOpen(true);
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input value so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSavePhoto = () => {
    if (!photoPreview) return;
    setIsSavingPhoto(true);
    if (onUpdateUser) {
      onUpdateUser({ avatar: photoPreview });
    }
    setIsSavingPhoto(false);
    setIsPhotoModalOpen(false);
    setPhotoPreview(null);
    setPhotoFeedback('Profile photo updated successfully!');
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  const handleRemovePhoto = () => {
    if (onUpdateUser) {
      onUpdateUser({ avatar: '' });
    }
    setIsPhotoModalOpen(false);
    setPhotoPreview(null);
    setPhotoFeedback('Profile photo removed.');
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  const openPhotoModal = () => {
    setPhotoPreview(null);
    setPhotoError(null);
    setIsPhotoModalOpen(true);
  };
  // 0. AI CAREER MENTOR CHATBOT VIEW
  if (activeTab === 'ai-mentor') {
    return (
      <AIMentorChatView
        user={user}
        nextSteps={nextSteps}
        skills={skills}
        projects={projects}
        experiences={experiences}
        certifications={passedCertifications || []}
        recentActivities={recentActivities}
        semesters={semesters}
        careerReadiness={careerReadiness}
        onNavigateTab={onNavigateTab || onBackToDashboard}
        onAddProjectModal={onAddProject}
        onUpdateSkillsModal={onUpdateSkills}
      />
    );
  }

  // 0.1 DEDICATED FULL SETTINGS PAGE VIEW
  if (activeTab === 'settings') {
    return (
      <SettingsView
        user={user}
        onUpdateUser={onUpdateUser || (() => {})}
        onStartOnboarding={onStartOnboarding}
        onLogout={onLogout}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  // Common Top Header Banner for Subviews
  const renderHeader = (title: string, subtitle: string, icon: React.ReactNode, actionBtn?: React.ReactNode) => (
    <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs mb-5">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actionBtn}
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-slate-500" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 1. MY ROADMAP VIEW
  if (activeTab === 'roadmap') {
    return (
      <RoadmapView
        user={user}
        nextSteps={nextSteps}
        onBackToDashboard={onBackToDashboard}
        onSelectAction={onSelectAction}
        onUpdateCareerGoal={onUpdateCareerGoal}
        onToggleActionStatus={onToggleActionStatus}
        onAddRoadmapTask={onAddRoadmapTask}
        onDeleteRoadmapTask={onDeleteRoadmapTask}
        onRecalibrateRoadmap={onRecalibrateRoadmap}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  // 2. ACADEMIC PROGRESS VIEW
  if (activeTab === 'academic-progress') {
    return (
      <AcademicProgressView
        user={user}
        semesters={semesters}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // 3. SKILLS VIEW
  if (activeTab === 'skills') {
    return (
      <SkillsPortfolioView
        skills={skills}
        onBackToDashboard={onBackToDashboard}
        onUpdateSkills={onUpdateSkills}
      />
    );
  }

  // 4. PROJECTS VIEW
  if (activeTab === 'projects') {
    return (
      <VerifiedProjectsView
        projects={projects}
        onBackToDashboard={onBackToDashboard}
        onAddProject={onAddProject}
      />
    );
  }

  // 5. EXPERIENCE VIEW
  if (activeTab === 'experience') {
    return (
      <ExperienceRolesView
        experiences={experiences}
        onBackToDashboard={onBackToDashboard}
        onAddExperience={onAddExperience}
      />
    );
  }

  // 6. CAREER GOALS VIEW
  if (activeTab === 'career-goals') {
    return (
      <div className="space-y-5">
        {renderHeader(
          'Target Career Goals',
          'Define your target industry roles to calibrate personalized learning paths.',
          <Target className="h-5 w-5" />,
          <button
            onClick={onUpdateCareerGoal}
            className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1F297E]"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Change Career Goal</span>
          </button>
        )}

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#283593]">Active Career Target</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{user.careerGoal}</h3>
          <p className="text-xs text-slate-500 mt-1">
            CampusOS dynamically optimizes your roadmap, project suggestions, and milestone priorities for this role.
          </p>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">Average Entry Level Salary</span>
              <span className="text-base font-extrabold text-[#283593]">$85,000 - $115,000</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">Industry Demand</span>
              <span className="text-base font-extrabold text-emerald-600">Very High (Top 5%)</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">Key Competencies</span>
              <span className="text-slate-600 block mt-0.5">Python, PyTorch, Linear Algebra, CV/NLP</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. CONSOLIDATED OPPORTUNITIES VIEW (All categories in one clean page)
  if (activeTab === 'opportunities' || activeTab === 'internships' || activeTab === 'research') {
    const initialCategory =
      activeTab === 'internships'
        ? 'Internship'
        : activeTab === 'research'
        ? 'Research & Labs'
        : 'All';

    return (
      <OpportunitiesView
        user={user}
        initialCategory={initialCategory}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // 10. ACHIEVEMENTS VIEW
  if (activeTab === 'achievements') {
    return (
      <div className="space-y-5">
        {renderHeader(
          'Achievements & Badges',
          'Earn badges by completing roadmap milestones, projects, and academic honors.',
          <Trophy className="h-5 w-5" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isCompleted = ach.status === 'Completed';

            return (
              <div
                key={ach.id}
                className={`rounded-2xl border p-5 shadow-xs transition ${
                  isCompleted ? 'border-[#8F9CFE]/80 bg-white' : 'border-slate-200 bg-slate-50/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isCompleted ? 'bg-[#EEF2FF] text-[#283593]' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {ach.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{ach.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 11. ACTIVITY VIEW
  if (activeTab === 'activity') {
    return (
      <div className="space-y-5">
        {renderHeader(
          'Activity Log',
          'A chronological record of milestones reached, project updates, and achievements.',
          <Activity className="h-5 w-5" />
        )}

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs">
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 text-xs shadow-2xs hover:border-[#283593] hover:bg-[#F6F8FF] transition"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-500 mr-1.5">{act.title}</span>
                    <span className="font-bold text-slate-900">{act.target}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{act.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 12. PROFILE VIEW
  if (activeTab === 'profile') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="space-y-5"
      >
        {renderHeader(
          'Student Profile',
          'Manage your academic credentials, career objectives, and public student passport.',
          <User className="h-5 w-5" />
        )}

        {/* Success / Feedback Toast Notification */}
        {photoFeedback && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{photoFeedback}</span>
          </div>
        )}

        {/* Hidden File Input for Direct Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
          id="student-profile-file-input"
        />

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 md:p-6 shadow-xs hover:shadow-[0_8px_30px_rgba(40,53,147,0.06)] transition-all">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-slate-100">
            {/* Interactive Profile Picture with Camera/Edit Button & Ambient Glow Ring */}
            <div className="relative group shrink-0">
              <div
                onClick={openPhotoModal}
                className="cursor-pointer overflow-hidden rounded-full ring-4 ring-blue-100 hover:ring-[#8F9CFE] shadow-[0_0_20px_rgba(40,53,147,0.18)] hover:shadow-[0_0_28px_rgba(40,53,147,0.3)] transition-all duration-300"
                title="Click to change profile photo"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover group-hover:opacity-90 transition"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-[#283593] text-xl sm:text-2xl font-bold text-white shadow-inner">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'ST'}
                  </div>
                )}
              </div>

              {/* Camera / Edit Overlay Button */}
              <button
                type="button"
                id="btn-edit-profile-photo"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    openPhotoModal();
                  }
                }}
                className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#283593] text-white shadow-md ring-2 ring-white hover:bg-[#1F297E] hover:scale-105 active:scale-95 transition-all"
                title="Upload or change profile photo"
                aria-label="Upload or change profile photo"
              >
                <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Profile Information & Photo Management Actions */}
            <div className="text-center sm:text-left flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate sm:whitespace-normal">{user.name}</h3>
                  {user.headline && (
                    <p className="text-xs font-semibold text-[#283593] mt-0.5 line-clamp-2">
                      {user.headline}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {user.degree} • Semester {user.semester} of {user.totalSemesters || 8}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user.university} | {user.location}
                  </p>
                </div>

                {/* Profile Actions: Edit Profile, Change Photo, Remove */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 pt-1 w-full sm:w-auto">
                  <button
                    type="button"
                    id="btn-edit-student-profile"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 sm:py-1.5 text-xs font-bold text-white hover:bg-[#1F297E] active:scale-[0.98] transition shadow-xs flex-1 sm:flex-initial min-w-[110px]"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    id="btn-change-photo-dialog"
                    onClick={openPhotoModal}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAFBFD] px-3 py-2 sm:py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs flex-1 sm:flex-initial min-w-[110px]"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#283593]" />
                    <span>Change Photo</span>
                  </button>

                  {user.avatar && (
                    <button
                      type="button"
                      id="btn-remove-photo-direct"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50/60 px-2.5 py-2 sm:py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-2xs"
                      title="Remove profile photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Career Snapshot Grid (Responsive 2-col on mobile, 4-col on desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 mt-4 sm:mt-6 text-xs">
            <div className="rounded-xl bg-[#FAFBFD] p-3 sm:p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block mb-1 text-[11px] sm:text-xs">CGPA (Cumulative)</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm text-[#283593]">{(Number(user.gpa) || 3.82).toFixed(2)} / 4.00</span>
            </div>
            <div className="rounded-xl bg-[#FAFBFD] p-3 sm:p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block mb-1 text-[11px] sm:text-xs">Degree & Major</span>
              <span className="font-bold text-slate-900 truncate block text-xs sm:text-sm" title={user.degree}>{user.degree}</span>
            </div>
            <div className="rounded-xl bg-[#FAFBFD] p-3 sm:p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block mb-1 text-[11px] sm:text-xs">Current Semester</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">Sem {user.semester} ({user.academicStanding || 'Good'})</span>
            </div>
            <div className="rounded-xl bg-[#FAFBFD] p-3 sm:p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block mb-1 text-[11px] sm:text-xs">Location</span>
              <span className="font-bold text-slate-900 truncate block text-xs sm:text-sm" title={user.location}>{user.location}</span>
            </div>
          </div>

          {/* Profile Completion indicator */}
          <div className="mt-4 sm:mt-5 rounded-xl bg-[#FAFBFD] border border-slate-200 p-3 sm:p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold text-[11px] sm:text-xs">Profile Completion</span>
                <span className="rounded-md bg-blue-50 text-[#283593] border border-blue-100 px-1.5 py-0.5 text-[10px] font-bold">
                  {user.profileCompletion >= 100 ? '100% Complete' : `${user.profileCompletion}%`}
                </span>
              </div>
              <span className="font-extrabold text-[#283593] text-xs sm:text-sm">{user.profileCompletion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#283593] transition-all duration-500 ease-out"
                style={{ width: `${user.profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Key Career & Profile Metric Cards (Above About Me) */}
        <div id="student-key-metrics-bar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            id="profile-career-goal-card"
            onClick={onUpdateCareerGoal}
            className="rounded-2xl border border-blue-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#283593] hover:shadow-xs cursor-pointer group"
            title="Click to update career goal"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-xs font-medium">Career Goal</span>
              <Edit2 className="h-3 w-3 text-slate-300 group-hover:text-[#283593] transition" />
            </div>
            <span className="font-bold text-slate-900 text-sm sm:text-[15px] tracking-tight truncate block group-hover:text-[#283593] transition">
              {user.careerGoal || 'AI / Machine Learning Engineer'}
            </span>
          </div>

          <div className="rounded-2xl border border-blue-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#8F9CFE]">
            <span className="text-slate-400 block mb-1 text-xs font-medium">Career Readiness</span>
            <span className="font-bold text-[#283593] text-sm sm:text-[15px] tracking-tight block">
              {careerReadiness?.overall || user.careerReadiness || 68}%
            </span>
          </div>

          <div className="rounded-2xl border border-blue-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#8F9CFE]">
            <span className="text-slate-400 block mb-1 text-xs font-medium">Credits Completed</span>
            <span className="font-bold text-slate-900 text-sm sm:text-[15px] tracking-tight block">
              {user.creditsCompleted || 78} / {user.totalCredits || 132}
            </span>
          </div>

          <div className="rounded-2xl border border-blue-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#8F9CFE]">
            <span className="text-slate-400 block mb-1 text-xs font-medium">Student Email</span>
            <span className="font-bold text-slate-900 text-sm sm:text-[15px] tracking-tight truncate block">
              {user.email || 'ali.raza@ajku.edu.pk'}
            </span>
          </div>
        </div>

        {/* About Me Section */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
                <User className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">About Me</h4>
            </div>
            <button
              type="button"
              id="btn-edit-about-me"
              onClick={handleOpenEditProfile}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#283593] hover:text-[#1F297E] transition py-1 px-1.5 rounded-lg hover:bg-blue-50/50"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            {user.aboutMe ||
              'Passionate Artificial Intelligence student dedicated to building scalable machine learning pipelines, computer vision models, and full-stack intelligent applications. Active contributor to campus developer clubs and hackathons.'}
          </p>
        </div>

        {/* Education Section */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900">Education & Academic Record</h4>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-[#283593] border border-blue-100">
                  {user.academicStanding || 'Good Standing'}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-edit-education"
              onClick={handleOpenEditEducation}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#283593] shadow-2xs hover:bg-blue-50/50 hover:border-blue-300 transition self-start sm:self-auto"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#283593]" />
              <span>Edit Education</span>
            </button>
          </div>

          {/* Main Degree & Institution Banner */}
          <div className="rounded-xl border border-blue-100 bg-[#FAFBFD] p-3.5 sm:p-4 md:p-5 mb-4 sm:mb-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-slate-900">{user.degree}</span>
                  <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-bold">
                    Active Program
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <Building2 className="h-3.5 w-3.5 text-[#283593] shrink-0" />
                    <span className="truncate">{user.university}</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{user.educationDates || '2022 - 2026 (Expected)'}</span>
                  </div>
                </div>
              </div>

              {/* Quick CGPA Highlight Pill */}
              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-left sm:text-right shadow-2xs w-full sm:w-auto flex sm:block justify-between items-center">
                  <span className="text-[10.5px] font-semibold text-slate-400 sm:block mr-2 sm:mr-0">Cumulative GPA</span>
                  <span className="text-base font-extrabold text-[#283593]">
                    {(Number(user.gpa) || 3.82).toFixed(2)} <span className="text-xs font-normal text-slate-400">/ 4.00</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Credentials Subgrid (Responsive 2-col on mobile, 4-col on tablet/desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5 text-xs">
            <div className="rounded-xl bg-white p-2.5 sm:p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Current Semester</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Semester {user.semester} <span className="text-slate-400 text-[10.5px] sm:text-[11px] font-normal">/ {user.totalSemesters || 8}</span>
              </span>
            </div>
            <div className="rounded-xl bg-white p-2.5 sm:p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Academic Status</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{user.academicStanding || 'Good Standing'}</span>
              </span>
            </div>
            <div className="rounded-xl bg-white p-2.5 sm:p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Credits Completed</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                {user.creditsCompleted} <span className="text-slate-400 text-[10.5px] sm:text-[11px] font-normal">/ {user.totalCredits} Cr</span>
              </span>
            </div>
            <div className="rounded-xl bg-white p-2.5 sm:p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Program Duration</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">4 Years (8 Sems)</span>
            </div>
          </div>

          {/* Relevant Coursework Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#283593]" />
                <h5 className="text-xs font-bold text-slate-900">Relevant Coursework</h5>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {(user.relevantCoursework || defaultCoursework).length} courses
                </span>
              </div>

              <button
                type="button"
                id="btn-toggle-inline-add-course"
                onClick={() => setIsAddingCourseInline(!isAddingCourseInline)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#283593] hover:text-[#1F297E] transition self-start sm:self-auto py-0.5"
              >
                {isAddingCourseInline ? (
                  <>
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>Add Course</span>
                  </>
                )}
              </button>
            </div>

            {/* Inline Add Coursework Form */}
            {isAddingCourseInline && (
              <div className="mb-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-blue-100 bg-[#FAFBFD] p-2.5 animate-in fade-in">
                <input
                  type="text"
                  id="input-inline-coursework"
                  value={inlineCourseInput}
                  onChange={(e) => setInlineCourseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInlineCoursework(inlineCourseInput);
                    }
                  }}
                  placeholder="e.g. Operating Systems, Cloud Computing..."
                  autoFocus
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#283593] focus:ring-1 focus:ring-blue-100"
                />
                <button
                  type="button"
                  id="btn-submit-inline-coursework"
                  onClick={() => handleAddInlineCoursework(inlineCourseInput)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#283593] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1F297E] transition shadow-2xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
            )}

            {/* Coursework Tag Chips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(user.relevantCoursework && user.relevantCoursework.length > 0 ? user.relevantCoursework : defaultCoursework).map(
                (course, idx) => (
                  <div
                    key={`course-${idx}-${course}`}
                    id={`course-chip-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAFBFD] pl-2.5 sm:pl-3 pr-1.5 py-1 sm:py-1.5 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50/30 transition group shadow-2xs"
                  >
                    <span className="truncate max-w-[200px] sm:max-w-none">{course}</span>
                    <button
                      type="button"
                      id={`btn-remove-course-${idx}`}
                      onClick={() => handleRemoveInlineCoursework(course)}
                      title={`Remove ${course}`}
                      className="flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center rounded text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Suggested Courses Quick Add */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <span className="text-[10.5px] font-semibold text-slate-400 block mb-1.5">
                Suggested relevant courses to add:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Cloud Computing',
                  'Operating Systems',
                  'Distributed Systems',
                  'Reinforcement Learning',
                  'Software Engineering',
                  'Compiler Design',
                  'Cybersecurity Fundamentals',
                ]
                  .filter(
                    (sug) =>
                      !(user.relevantCoursework || defaultCoursework).some(
                        (c) => c.toLowerCase() === sug.toLowerCase()
                      )
                  )
                  .slice(0, 5)
                  .map((sug) => (
                    <button
                      key={`sug-course-${sug}`}
                      type="button"
                      onClick={() => handleAddInlineCoursework(sug)}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#283593] hover:text-[#283593] hover:bg-blue-50/50 transition"
                    >
                      <Plus className="h-3 w-3 text-slate-400" />
                      <span>{sug}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills Section */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
                <Code className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Technical Skills</h4>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-[#283593] border border-blue-100">
                  {skills.length} skills
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                id="btn-toggle-add-skill"
                onClick={() => {
                  setIsAddingSkill(!isAddingSkill);
                  setSkillInputError(null);
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                  isAddingSkill
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-[#283593] text-white hover:bg-[#1F297E] active:scale-[0.98]'
                }`}
              >
                {isAddingSkill ? (
                  <>
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Skill</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Skill Inline Form */}
          {isAddingSkill && (
            <div className="mb-5 rounded-xl border border-blue-100 bg-[#FAFBFD] p-3.5 sm:p-4 animate-in fade-in">
              <h5 className="text-xs font-bold text-slate-800 mb-3">Add New Technical Skill</h5>
              <form onSubmit={handleAddSkillSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Skill Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-new-skill-name"
                      value={newSkillName}
                      onChange={(e) => {
                        setNewSkillName(e.target.value);
                        if (skillInputError) setSkillInputError(null);
                      }}
                      placeholder="e.g. PyTorch, Docker, React"
                      autoFocus
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        skillInputError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'
                      }`}
                    />
                    {skillInputError && (
                      <p className="text-[10.5px] text-rose-600 mt-1">{skillInputError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Proficiency Level
                    </label>
                    <select
                      id="select-new-skill-level"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Beginner">Beginner (Foundational)</option>
                      <option value="Intermediate">Intermediate (Working knowledge)</option>
                      <option value="Advanced">Advanced (Proficient / Projects)</option>
                      <option value="Expert">Expert (Mastery / Production)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Category
                    </label>
                    <select
                      id="select-new-skill-category"
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Machine Learning & AI">Machine Learning & AI</option>
                      <option value="Programming Languages">Programming Languages</option>
                      <option value="Data Science & Analytics">Data Science & Analytics</option>
                      <option value="Web & Cloud Development">Web & Cloud Development</option>
                      <option value="DevOps & Tools">DevOps & Tools</option>
                    </select>
                  </div>
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <span className="text-[10.5px] font-semibold text-slate-400 block mb-1.5">
                    Popular suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['PyTorch', 'TensorFlow', 'Docker', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'Scikit-Learn', 'Git', 'Next.js', 'Kubernetes', 'Computer Vision']
                      .filter((s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase()))
                      .slice(0, 8)
                      .map((suggested) => (
                        <button
                          key={suggested}
                          type="button"
                          onClick={() => setNewSkillName(suggested)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-[#283593] hover:text-[#283593] transition"
                        >
                          + {suggested}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSkill(false);
                      setSkillInputError(null);
                    }}
                    className="rounded-xl px-3.5 py-2 sm:py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-new-skill"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 sm:py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Add to Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Skill Tags List */}
          {skills.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {skills.map((skill) => {
                  const levelBadgeStyles =
                    skill.level === 'Expert'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : skill.level === 'Advanced'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : skill.level === 'Intermediate'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <div
                      key={skill.id}
                      id={`skill-tag-${skill.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#FAFBFD] pl-3 pr-1.5 py-1.5 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50/30 transition group shadow-2xs"
                    >
                      <span className="font-bold text-slate-900">{skill.name}</span>
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${levelBadgeStyles}`}>
                        {skill.level}
                      </span>
                      <button
                        type="button"
                        id={`btn-remove-skill-${skill.id}`}
                        onClick={() => handleRemoveSkillItem(skill.id, skill.name)}
                        title={`Remove ${skill.name}`}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Quick Add Suggestions Row when not in form mode */}
              {!isAddingSkill && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Quick add recommended skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['PyTorch', 'TensorFlow', 'Docker', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'Scikit-Learn', 'Git', 'Next.js']
                      .filter((s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase()))
                      .slice(0, 6)
                      .map((suggestedSkill) => (
                        <button
                          key={`quick-${suggestedSkill}`}
                          type="button"
                          id={`btn-quick-add-${suggestedSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          onClick={() => handleQuickAddSkill(suggestedSkill, 'Technical', 'Intermediate')}
                          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#283593] hover:text-[#283593] hover:bg-blue-50/50 transition"
                        >
                          <Plus className="h-3 w-3 text-slate-400 group-hover:text-[#283593]" />
                          <span>{suggestedSkill}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-[#FAFBFD] px-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#283593] mb-2">
                <Code className="h-5 w-5" />
              </div>
              <h5 className="text-xs font-bold text-slate-800">No technical skills added yet</h5>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5 mb-3">
                Showcase your technical stack and programming competencies to recruiters and faculty.
              </p>
              <button
                type="button"
                id="btn-empty-add-first-skill"
                onClick={() => setIsAddingSkill(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Your First Skill</span>
              </button>
            </div>
          )}
        </div>

        {/* Certifications & Achievements Section */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
                <Award className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Certifications & Achievements</h4>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-[#283593] border border-blue-100">
                  {currentCertifications.length} credentials
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-add-certification"
              onClick={handleOpenAddCert}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1F297E] active:scale-[0.98] transition self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Certification</span>
            </button>
          </div>

          {/* Certification Cards List */}
          {currentCertifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {currentCertifications.map((cert) => (
                <div
                  key={cert.id}
                  id={`cert-card-${cert.id}`}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 sm:p-4 hover:border-blue-300 hover:bg-blue-50/20 transition group shadow-2xs"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Icon, Title & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600 mt-0.5 shadow-2xs">
                          <Award className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug break-words">
                            {cert.title}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mt-0.5">
                            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{cert.organization}</span>
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-80 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          id={`btn-edit-cert-${cert.id}`}
                          onClick={() => handleOpenEditCert(cert)}
                          title="Edit Certification"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-[#283593] hover:bg-blue-50/50 transition shadow-2xs"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-cert-${cert.id}`}
                          onClick={() => setCertToDelete(cert)}
                          title="Delete Certification"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 transition shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata: Date & Credential ID */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] pt-0.5">
                      <div className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>Issued {cert.date}</span>
                      </div>
                      {cert.credentialId && (
                        <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-mono text-[10px]">
                          <span>ID: {cert.credentialId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Link Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    {cert.certificateLink ? (
                      <a
                        href={cert.certificateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#283593] hover:text-[#1F297E] hover:underline transition"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View Certificate Credential</span>
                      </a>
                    ) : (
                      <span className="text-[10.5px] text-slate-400 italic">
                        Verified Institutional Honor / Academic Record
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-[#FAFBFD] px-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-2 border border-amber-100">
                <Award className="h-5 w-5" />
              </div>
              <h5 className="text-xs font-bold text-slate-800">No certifications or achievements added yet</h5>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5 mb-3.5">
                Add verified certifications, licenses, hackathon badges, or academic honors to stand out to recruiters and industry partners.
              </p>
              <button
                type="button"
                id="btn-empty-add-cert"
                onClick={handleOpenAddCert}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#283593] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Your First Certification</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Photo Upload / Edit / Preview / Remove Modal */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {photoPreview ? 'Preview & Save Photo' : 'Update Profile Photo'}
                    </h3>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500">Upload, change, or remove your student portrait</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setPhotoPreview(null);
                    setPhotoError(null);
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="overflow-y-auto pr-0.5 space-y-3.5">
                {/* Error Alert */}
                {photoError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                    {photoError}
                  </div>
                )}

                {/* Photo Preview & Comparison */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative mb-3">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md"
                        />
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs text-[10px] font-bold">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    ) : user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-blue-100 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-[#283593] text-2xl sm:text-3xl font-bold text-white ring-4 ring-blue-100 shadow-md">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'ST'}
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-700 text-center">
                    {photoPreview ? 'New Photo Preview (unsaved)' : user.avatar ? 'Current Profile Photo' : 'No photo uploaded (using initials)'}
                  </p>
                  {photoPreview && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5 text-center">
                      Click "Save Photo" below to apply this picture to your profile
                    </p>
                  )}
                </div>

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-[#283593] bg-[#EEF2FF]'
                      : 'border-slate-200 bg-[#FAFBFD] hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                  />
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white shadow-2xs border border-slate-200 text-[#283593] mb-2">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop photo
                  </p>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, WEBP or GIF (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 pt-4 mt-3 border-t border-slate-100 shrink-0">
                <div>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                      title="Remove profile photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      setPhotoPreview(null);
                      setPhotoError(null);
                    }}
                    className="flex-1 sm:flex-initial rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition text-center"
                  >
                    Cancel
                  </button>

                  {photoPreview ? (
                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      disabled={isSavingPhoto}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Photo</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Choose File</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#283593]">
                    <Edit2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Student Profile</h3>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500">Update your academic credentials, personal details, and bio</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-edit-profile-modal"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="space-y-3.5 sm:space-y-4 pt-3 sm:pt-4 overflow-y-auto pr-1">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-edit-profile-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                      editErrors.name ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                    }`}
                    placeholder="e.g. Ali Raza"
                  />
                  {editErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{editErrors.name}</p>
                  )}
                </div>

                {/* Professional Headline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    id="input-edit-profile-headline"
                    value={editForm.headline}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, headline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. Aspiring AI & Machine Learning Engineer | Deep Learning & Intelligent Systems"
                  />
                </div>

                {/* Degree & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degree / Major <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-edit-profile-degree"
                      value={editForm.degree}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, degree: e.target.value }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        editErrors.degree ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                      placeholder="e.g. BS Artificial Intelligence"
                    />
                    {editErrors.degree && (
                      <p className="text-[11px] text-rose-600 mt-1">{editErrors.degree}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="input-edit-profile-location"
                      value={editForm.location}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. Muzaffarabad, AJK"
                    />
                  </div>
                </div>

                {/* Semester & CGPA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Semester (1-12) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="input-edit-profile-semester"
                      min={1}
                      max={12}
                      value={editForm.semester}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, semester: parseInt(e.target.value) || 1 }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        editErrors.semester ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                    />
                    {editErrors.semester && (
                      <p className="text-[11px] text-rose-600 mt-1">{editErrors.semester}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CGPA (0.00 - 4.00) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="input-edit-profile-cgpa"
                      step="0.01"
                      min="0.00"
                      max="4.00"
                      value={editForm.gpa}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, gpa: parseFloat(e.target.value) || 0 }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        editErrors.gpa ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                      placeholder="3.42"
                    />
                    {editErrors.gpa && (
                      <p className="text-[11px] text-rose-600 mt-1">{editErrors.gpa}</p>
                    )}
                  </div>
                </div>

                {/* About Me */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    About Me
                  </label>
                  <textarea
                    id="input-edit-profile-aboutme"
                    rows={4}
                    value={editForm.aboutMe}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, aboutMe: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] p-3 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed"
                    placeholder="Write a brief overview about your background, career interests, and achievements..."
                  />
                  <p className="text-[10.5px] text-slate-400 text-right mt-1">
                    {editForm.aboutMe.length} characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    id="btn-cancel-edit-profile"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="rounded-xl px-4 py-2.5 sm:py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-save-edit-profile"
                    disabled={isSavingProfile}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-5 py-2.5 sm:py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Education Modal */}
        {isEditEducationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#283593]">
                    <GraduationCap className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Education & Coursework</h3>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500">Update degree, university, timeline, semester, CGPA, and coursework</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-edit-education-modal"
                  onClick={() => setIsEditEducationOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEducation} className="space-y-3.5 sm:space-y-4 pt-3 sm:pt-4 overflow-y-auto pr-1">
                {/* Degree Program */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Degree / Program <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-education-degree"
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm((prev) => ({ ...prev, degree: e.target.value }))}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                      educationErrors.degree ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                    }`}
                    placeholder="e.g. BS Artificial Intelligence"
                  />
                  {educationErrors.degree && (
                    <p className="text-[11px] text-rose-600 mt-1">{educationErrors.degree}</p>
                  )}
                </div>

                {/* University / Institution */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    University / Institution <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-education-university"
                    value={educationForm.university}
                    onChange={(e) => setEducationForm((prev) => ({ ...prev, university: e.target.value }))}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                      educationErrors.university ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                    }`}
                    placeholder="e.g. University of Azad Jammu & Kashmir"
                  />
                  {educationErrors.university && (
                    <p className="text-[11px] text-rose-600 mt-1">{educationErrors.university}</p>
                  )}
                </div>

                {/* Dates / Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dates / Duration
                  </label>
                  <input
                    type="text"
                    id="input-education-dates"
                    value={educationForm.educationDates}
                    onChange={(e) => setEducationForm((prev) => ({ ...prev, educationDates: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. 2022 - 2026 (Expected) or Fall 2022 - Spring 2026"
                  />
                </div>

                {/* Semester & CGPA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Semester (1-12) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="input-education-semester"
                      min={1}
                      max={12}
                      value={educationForm.semester}
                      onChange={(e) => setEducationForm((prev) => ({ ...prev, semester: parseInt(e.target.value) || 1 }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        educationErrors.semester ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                    />
                    {educationErrors.semester && (
                      <p className="text-[11px] text-rose-600 mt-1">{educationErrors.semester}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cumulative GPA (0.00 - 4.00) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="input-education-cgpa"
                      step="0.01"
                      min="0.00"
                      max="4.00"
                      value={educationForm.gpa}
                      onChange={(e) => setEducationForm((prev) => ({ ...prev, gpa: parseFloat(e.target.value) || 0 }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        educationErrors.gpa ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                      placeholder="3.42"
                    />
                    {educationErrors.gpa && (
                      <p className="text-[11px] text-rose-600 mt-1">{educationErrors.gpa}</p>
                    )}
                  </div>
                </div>

                {/* Relevant Coursework Manager */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Relevant Coursework ({educationForm.relevantCoursework.length})
                    </label>
                    <span className="text-[10.5px] text-slate-400">Press Enter or click Add</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                    <input
                      type="text"
                      id="input-modal-course-name"
                      value={newCourseName}
                      onChange={(e) => {
                        setNewCourseName(e.target.value);
                        if (courseInputError) setCourseInputError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCourseworkToModal(newCourseName);
                        }
                      }}
                      placeholder="Add course name (e.g. Distributed Systems)"
                      className={`flex-1 rounded-xl border px-3.5 py-2 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        courseInputError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                    />
                    <button
                      type="button"
                      id="btn-add-modal-course"
                      onClick={() => handleAddCourseworkToModal(newCourseName)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                  {courseInputError && (
                    <p className="text-[11px] text-rose-600 mb-2">{courseInputError}</p>
                  )}

                  {/* Course Tags List */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-[#FAFBFD] border border-slate-200">
                    {educationForm.relevantCoursework.length > 0 ? (
                      educationForm.relevantCoursework.map((course, idx) => (
                        <div
                          key={`modal-course-${idx}-${course}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs"
                        >
                          <span>{course}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourseworkFromModal(course)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic py-1">No coursework added yet.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    id="btn-cancel-edit-education"
                    onClick={() => setIsEditEducationOpen(false)}
                    className="rounded-xl px-4 py-2.5 sm:py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-save-edit-education"
                    disabled={isSavingEducation}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-5 py-2.5 sm:py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Education Details</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add / Edit Certification Modal */}
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#283593]">
                    <Award className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {editingCert ? 'Edit Certification or Achievement' : 'Add Certification or Achievement'}
                    </h3>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500">
                      Provide certificate title, issuing organization, date, and verification link
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-cert-modal"
                  onClick={() => setIsCertModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveCert} className="space-y-3.5 sm:space-y-4 pt-3 sm:pt-4 overflow-y-auto pr-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Certification / Achievement Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-cert-title"
                    value={certForm.title}
                    onChange={(e) => {
                      setCertForm((prev) => ({ ...prev, title: e.target.value }));
                      if (certErrors.title) setCertErrors((prev) => ({ ...prev, title: '' }));
                    }}
                    placeholder="e.g. Deep Learning Specialization, AWS Solutions Architect, Dean's Honor Roll"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                      certErrors.title ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                    }`}
                  />
                  {certErrors.title && (
                    <p className="text-[11px] text-rose-600 mt-1">{certErrors.title}</p>
                  )}
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Issuing Organization / Provider <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-cert-org"
                    value={certForm.organization}
                    onChange={(e) => {
                      setCertForm((prev) => ({ ...prev, organization: e.target.value }));
                      if (certErrors.organization) setCertErrors((prev) => ({ ...prev, organization: '' }));
                    }}
                    placeholder="e.g. DeepLearning.AI / Coursera, Google, AWS, University of Azad Jammu & Kashmir"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                      certErrors.organization ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                    }`}
                  />
                  {certErrors.organization && (
                    <p className="text-[11px] text-rose-600 mt-1">{certErrors.organization}</p>
                  )}
                </div>

                {/* Date & Credential ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issue Date / Period <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-cert-date"
                      value={certForm.date}
                      onChange={(e) => {
                        setCertForm((prev) => ({ ...prev, date: e.target.value }));
                        if (certErrors.date) setCertErrors((prev) => ({ ...prev, date: '' }));
                      }}
                      placeholder="e.g. Dec 2024, May 2024, 2023"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100 ${
                        certErrors.date ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-[#FAFBFD]'
                      }`}
                    />
                    {certErrors.date && (
                      <p className="text-[11px] text-rose-600 mt-1">{certErrors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Credential / License ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="input-cert-id"
                      value={certForm.credentialId}
                      onChange={(e) => setCertForm((prev) => ({ ...prev, credentialId: e.target.value }))}
                      placeholder="e.g. DL-AI-9842"
                      className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Certificate Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Certificate Verification Link / URL <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="input-cert-link"
                    value={certForm.certificateLink}
                    onChange={(e) => setCertForm((prev) => ({ ...prev, certificateLink: e.target.value }))}
                    placeholder="https://coursera.org/verify/..."
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs outline-none transition focus:border-[#283593] focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Include the link where recruiters can verify this credential online.
                  </p>
                </div>

                {/* Quick Presets */}
                {!editingCert && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10.5px] font-semibold text-slate-400 block mb-1.5">
                      Quick suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { title: 'Google Professional Machine Learning Engineer', org: 'Google Cloud' },
                        { title: 'Meta Front-End Developer Specialization', org: 'Meta / Coursera' },
                        { title: 'Kaggle Competitions Grandmaster / Medals', org: 'Kaggle' },
                        { title: 'National AI Hackathon Finalist', org: 'Ignite / TechFest' },
                      ].map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => {
                            setCertForm((prev) => ({
                              ...prev,
                              title: preset.title,
                              organization: preset.org,
                              date: prev.date || '2024',
                            }));
                          }}
                          className="rounded-lg border border-dashed border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-[#283593] hover:text-[#283593] transition"
                        >
                          + {preset.title.split(' ')[0]}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    id="btn-cancel-cert"
                    onClick={() => setIsCertModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 sm:py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-save-cert"
                    disabled={isSavingCert}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-5 py-2.5 sm:py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{editingCert ? 'Save Changes' : 'Add Certification'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Certification Confirmation Modal */}
        {certToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Delete Certification?</h4>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500">This action will remove the credential from your profile.</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 mb-4 text-xs">
                <p className="font-bold text-slate-900">{certToDelete.title}</p>
                <p className="text-slate-500 text-[11px]">{certToDelete.organization} • {certToDelete.date}</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-cancel-delete-cert"
                  onClick={() => setCertToDelete(null)}
                  className="rounded-xl px-3.5 py-2 sm:py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-cert"
                  onClick={() => handleDeleteCert(certToDelete)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 sm:py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // 13. SETTINGS VIEW
  if (activeTab === 'settings') {
    return (
      <SettingsView
        user={user}
        onUpdateUser={onUpdateUser || (() => {})}
        onStartOnboarding={onStartOnboarding}
        onLogout={onLogout}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  return null;
};
