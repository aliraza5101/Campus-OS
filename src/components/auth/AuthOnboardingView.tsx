import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ChevronRight,
  Brain,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Sparkle,
  LogIn,
  UserPlus,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Lock,
  BadgeCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  StudentUser,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  CareerReadinessBreakdown,
  NextActionItem,
  SemesterDetail,
} from '../../types';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { CampusOSLogo } from '../common/CampusOSLogo';
import { aiApi, authApi, setToken } from '../../services/api';

interface AuthOnboardingViewProps {
  onLoginAsStudent: (email?: string, password?: string) => Promise<boolean | void> | void;
  onLoginAsAdmin: (email?: string, password?: string) => Promise<boolean | void> | void;
  onCompleteOnboarding: (
    userProfile: StudentUser,
    selectedSkills: SkillProgressItem[],
    projects: ProjectItem[],
    experiences: ExperienceItem[],
    readiness: CareerReadinessBreakdown,
    nextSteps?: NextActionItem[],
    password?: string,
    semesterDetails?: SemesterDetail[],
    strategicAdvice?: string,
    criticalSkillGaps?: string[]
  ) => void;
  initialMode?: 'onboarding' | 'login';
}

const AVAILABLE_DEGREES = [
  'BS Artificial Intelligence',
  'BS Computer Science',
  'BS Software Engineering',
  'BS Data Science',
  'BS Cyber Security',
  'BS Information Technology',
];

const CAREER_TRACKS = [
  {
    id: 'ai_ml',
    title: 'AI / Machine Learning Engineer',
    emoji: '🤖',
    desc: 'Python, Machine Learning, Neural Networks & Computer Vision',
    skills: [
      { name: 'Python', level: 'Advanced' as const, category: 'AI & Data', percentage: 85 },
      { name: 'Machine Learning', level: 'Intermediate' as const, category: 'AI & Data', percentage: 75 },
      { name: 'PyTorch', level: 'Intermediate' as const, category: 'AI & Data', percentage: 70 },
      { name: 'Computer Vision', level: 'Intermediate' as const, category: 'Specialization', percentage: 65 },
      { name: 'Git & GitHub', level: 'Intermediate' as const, category: 'Engineering Tools', percentage: 80 },
    ],
  },
  {
    id: 'computer_vision',
    title: 'Computer Vision Engineer',
    emoji: '👁️',
    desc: 'OpenCV, PyTorch, 3D Perception, Edge Vision & YOLO',
    skills: [
      { name: 'Python', level: 'Advanced' as const, category: 'AI & Data', percentage: 85 },
      { name: 'OpenCV', level: 'Advanced' as const, category: 'Vision', percentage: 80 },
      { name: 'PyTorch', level: 'Intermediate' as const, category: 'AI & Data', percentage: 75 },
      { name: 'C++', level: 'Intermediate' as const, category: 'Languages', percentage: 70 },
      { name: 'Deep Learning', level: 'Intermediate' as const, category: 'AI & Data', percentage: 75 },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Web Developer',
    emoji: '💻',
    desc: 'React, Node.js, TypeScript, APIs & Databases',
    skills: [
      { name: 'React', level: 'Advanced' as const, category: 'Frontend', percentage: 85 },
      { name: 'TypeScript', level: 'Intermediate' as const, category: 'Languages', percentage: 75 },
      { name: 'Node.js', level: 'Intermediate' as const, category: 'Backend', percentage: 70 },
      { name: 'PostgreSQL', level: 'Intermediate' as const, category: 'Databases', percentage: 68 },
      { name: 'Git & GitHub', level: 'Advanced' as const, category: 'Engineering Tools', percentage: 80 },
    ],
  },
  {
    id: 'datascience',
    title: 'Data Scientist & Analyst',
    emoji: '📊',
    desc: 'Data Analysis, SQL, Python, Charts & Statistics',
    skills: [
      { name: 'Python', level: 'Advanced' as const, category: 'Core', percentage: 88 },
      { name: 'SQL', level: 'Advanced' as const, category: 'Databases', percentage: 82 },
      { name: 'Data Analysis', level: 'Intermediate' as const, category: 'Analytics', percentage: 78 },
      { name: 'Statistics', level: 'Intermediate' as const, category: 'Mathematics', percentage: 70 },
    ],
  },
  {
    id: 'cloud_devops',
    title: 'Cloud & DevOps Engineer',
    emoji: '☁️',
    desc: 'Docker, AWS/Cloud, Linux & Automated CI/CD Pipelines',
    skills: [
      { name: 'Linux', level: 'Advanced' as const, category: 'Systems', percentage: 80 },
      { name: 'Docker', level: 'Intermediate' as const, category: 'Containers', percentage: 72 },
      { name: 'AWS', level: 'Intermediate' as const, category: 'Cloud', percentage: 65 },
      { name: 'CI/CD Pipelines', level: 'Intermediate' as const, category: 'DevOps', percentage: 70 },
      { name: 'Git & GitHub', level: 'Advanced' as const, category: 'Engineering Tools', percentage: 80 },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst & Engineer',
    emoji: '🛡️',
    desc: 'Network Security, Ethical Hacking, Forensics & Cryptography',
    skills: [
      { name: 'Network Security', level: 'Intermediate' as const, category: 'Security', percentage: 75 },
      { name: 'Linux', level: 'Advanced' as const, category: 'Systems', percentage: 80 },
      { name: 'Python', level: 'Intermediate' as const, category: 'Languages', percentage: 70 },
      { name: 'Ethical Hacking', level: 'Intermediate' as const, category: 'Security', percentage: 68 },
      { name: 'Cryptography', level: 'Beginner' as const, category: 'Core', percentage: 60 },
    ],
  },
  {
    id: 'mobile_dev',
    title: 'Mobile App Developer',
    emoji: '📱',
    desc: 'Flutter, React Native, Swift, Kotlin & Mobile APIs',
    skills: [
      { name: 'Flutter', level: 'Advanced' as const, category: 'Mobile', percentage: 82 },
      { name: 'Dart / TypeScript', level: 'Intermediate' as const, category: 'Languages', percentage: 75 },
      { name: 'REST APIs', level: 'Advanced' as const, category: 'Backend', percentage: 80 },
      { name: 'Firebase', level: 'Intermediate' as const, category: 'Cloud', percentage: 70 },
    ],
  },
  {
    id: 'embedded_iot',
    title: 'Embedded Systems & IoT Engineer',
    emoji: '⚡',
    desc: 'C/C++, Microcontrollers, Arduino, ROS & Sensor Networks',
    skills: [
      { name: 'C / C++', level: 'Advanced' as const, category: 'Languages', percentage: 85 },
      { name: 'Microcontrollers', level: 'Intermediate' as const, category: 'Hardware', percentage: 75 },
      { name: 'IoT Protocols', level: 'Intermediate' as const, category: 'Networking', percentage: 70 },
      { name: 'Linux', level: 'Intermediate' as const, category: 'Systems', percentage: 75 },
    ],
  },
  {
    id: 'ui_ux',
    title: 'UI/UX & Product Designer',
    emoji: '🎨',
    desc: 'Figma, Wireframing, User Research & Design Systems',
    skills: [
      { name: 'Figma', level: 'Advanced' as const, category: 'Design', percentage: 88 },
      { name: 'UI / Wireframing', level: 'Advanced' as const, category: 'Design', percentage: 85 },
      { name: 'User Research', level: 'Intermediate' as const, category: 'Product', percentage: 75 },
      { name: 'Design Systems', level: 'Intermediate' as const, category: 'Design', percentage: 70 },
    ],
  },
  {
    id: 'blockchain',
    title: 'Blockchain & Web3 Developer',
    emoji: '⛓️',
    desc: 'Solidity, Ethereum, Smart Contracts & Distributed Ledgers',
    skills: [
      { name: 'Solidity', level: 'Intermediate' as const, category: 'Web3', percentage: 72 },
      { name: 'JavaScript / TypeScript', level: 'Advanced' as const, category: 'Languages', percentage: 80 },
      { name: 'Smart Contracts', level: 'Intermediate' as const, category: 'Web3', percentage: 75 },
      { name: 'Cryptography', level: 'Intermediate' as const, category: 'Core', percentage: 65 },
    ],
  },
];

const SKILL_SUGGESTIONS = [
  'Python',
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'SQL',
  'Machine Learning',
  'PyTorch',
  'Computer Vision',
  'Git & GitHub',
  'Docker',
  'FastAPI',
  'Tailwind CSS',
  'Data Structures',
];

export const AuthOnboardingView: React.FC<AuthOnboardingViewProps> = ({
  onLoginAsStudent,
  onLoginAsAdmin,
  onCompleteOnboarding,
  initialMode = 'onboarding',
}) => {
  const [activeMode, setActiveMode] = useState<'onboarding' | 'login'>(initialMode);
  const [loginRoleTab, setLoginRoleTab] = useState<'student' | 'admin'>('student');

  // Typewriter effect for tagline under CampusOS
  const FULL_TAGLINE = 'YOUR CAMPUS. YOUR ROADMAP. YOUR FUTURE.';
  const [typedTagline, setTypedTagline] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (typedTagline.length < FULL_TAGLINE.length) {
        timer = setTimeout(() => {
          setTypedTagline(FULL_TAGLINE.slice(0, typedTagline.length + 1));
        }, 75);
      } else {
        // Hold full text for 3.2 seconds
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3200);
      }
    } else {
      if (typedTagline.length > 0) {
        timer = setTimeout(() => {
          setTypedTagline(FULL_TAGLINE.slice(0, typedTagline.length - 1));
        }, 35);
      } else {
        // Pause briefly before typing again
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 600);
      }
    }

    return () => clearTimeout(timer);
  }, [typedTagline, isDeleting]);

  // Multi-Step Onboarding State
  const [step, setStep] = useState<number>(1);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  // AI Loading Screen
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [aiStageText, setAiStageText] = useState<string>('Setting up your dashboard...');

  // Strict Validation State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isFresherConfirmed, setIsFresherConfirmed] = useState<boolean>(false);

  // Dynamic AI Assessment Preview
  const [aiPreviewData, setAiPreviewData] = useState<{
    readiness?: number;
    strategicAdvice?: string;
    criticalSkillGaps?: string[];
    stepsCount?: number;
  } | null>(null);

  // Step 1: Basic Student Identity & Academic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [gpa, setGpa] = useState<string>('');
  const [semesterGpas, setSemesterGpas] = useState<Record<number, string>>({});
  const [location, setLocation] = useState('');
  const [educationDates, setEducationDates] = useState('');
  const [headline, setHeadline] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  // Step 2: Goal, Skills, Coursework & Experience
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [skillsList, setSkillsList] = useState<SkillProgressItem[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillLevel, setCustomSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  const [relevantCoursework, setRelevantCoursework] = useState<string[]>([]);
  const [newCourseInput, setNewCourseInput] = useState('');

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expType, setExpType] = useState('Internship');
  const [expPeriod, setExpPeriod] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Step 3: Projects & Repositories & GitHub Profile
  const [githubUrl, setGithubUrl] = useState('');
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('Software Engineering');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectGithubUrl, setNewProjectGithubUrl] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<'In Progress' | 'Completed'>('In Progress');

  // Track select helper
  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    const track = CAREER_TRACKS.find((t) => t.id === trackId);
    if (track) {
      setCareerGoal(track.title);
      const formattedSkills: SkillProgressItem[] = track.skills.map((s, idx) => ({
        id: `sk-track-${idx}-${Date.now()}`,
        name: s.name,
        level: s.level,
        percentage: s.percentage,
        category: s.category,
        verified: true,
      }));
      setSkillsList(formattedSkills);
    }
  };

  const handleAddCustomSkill = (skillName?: string, skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert') => {
    const nameToAdd = (skillName || customSkillInput).trim();
    if (!nameToAdd) return;
    if (skillsList.some((s) => s.name.toLowerCase() === nameToAdd.toLowerCase())) return;

    const level = skillLevel || customSkillLevel;
    const percentage = level === 'Expert' ? 95 : level === 'Advanced' ? 85 : level === 'Intermediate' ? 70 : 50;

    const newSkill: SkillProgressItem = {
      id: `sk-custom-${Date.now()}`,
      name: nameToAdd,
      level: level,
      percentage: percentage,
      category: 'Technical',
      verified: false,
    };
    setSkillsList([...skillsList, newSkill]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkillsList(skillsList.filter((s) => s.id !== skillId));
  };

  const handleAddCoursework = () => {
    if (!newCourseInput.trim()) return;
    if (relevantCoursework.some((c) => c.toLowerCase() === newCourseInput.trim().toLowerCase())) return;
    setRelevantCoursework([...relevantCoursework, newCourseInput.trim()]);
    setNewCourseInput('');
  };

  const handleRemoveCoursework = (courseName: string) => {
    setRelevantCoursework(relevantCoursework.filter((c) => c !== courseName));
  };

  const handleAddExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) return;
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      company: expCompany.trim(),
      employmentType: expType,
      period: expPeriod.trim() || '2024 - Present',
      location: location || 'Remote / Pakistan',
      description: expDesc.trim() || 'Role and responsibilities during academic study.',
    };
    setExperienceList([...experienceList, newExp]);
    setExpTitle('');
    setExpCompany('');
    setExpDesc('');
    setExpPeriod('');
  };

  const handleRemoveExperience = (expId: string) => {
    setExperienceList(experienceList.filter((e) => e.id !== expId));
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    const techArray = newProjectTech
      ? newProjectTech.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Python', 'TypeScript', 'React'];

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      category: newProjectCategory || 'Software Engineering',
      status: newProjectStatus,
      progress: newProjectStatus === 'Completed' ? 100 : 65,
      description: newProjectDesc.trim() || 'University semester project and code repository.',
      techStack: techArray,
      githubUrl: newProjectGithubUrl.trim() || githubUrl || 'https://github.com',
    };
    setProjectsList([...projectsList, newProj]);
    setNewProjectTitle('');
    setNewProjectTech('');
    setNewProjectDesc('');
    setNewProjectGithubUrl('');
  };

  const handleRemoveProject = (projId: string) => {
    setProjectsList(projectsList.filter((p) => p.id !== projId));
  };

  // Semester change and dynamic SGPA / CGPA calculations
  const handleSemesterChange = (newSem: number) => {
    setSemester(newSem);
    if (newSem > 1) {
      setSemesterGpas((prev) => {
        const next = { ...prev };
        for (let s = 1; s < newSem; s++) {
          if (next[s] === undefined) {
            next[s] = gpa || '';
          }
        }
        return next;
      });
      const vals: number[] = [];
      for (let s = 1; s < newSem; s++) {
        const v = parseFloat(semesterGpas[s]);
        if (!isNaN(v) && v > 0) vals.push(v);
      }
      if (vals.length > 0) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        setGpa(avg.toFixed(2));
      }
    }
  };

  const handleSemesterGpaChange = (semNum: number, value: string) => {
    setSemesterGpas((prev) => {
      const next = { ...prev, [semNum]: value };
      const vals: number[] = [];
      for (let s = 1; s < semester; s++) {
        const v = s === semNum ? parseFloat(value) : parseFloat(next[s]);
        if (!isNaN(v) && v > 0 && v <= 4.0) vals.push(v);
      }
      if (vals.length > 0) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        setGpa(avg.toFixed(2));
      }
      return next;
    });
  };



  // Email Login State & Handler
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Admin Credential Verification States
  const [showAdminVerification, setShowAdminVerification] = useState(false);
  const [adminStaffId, setAdminStaffId] = useState('');
  const [adminDeptCode, setAdminDeptCode] = useState('');
  const [adminSecurityPin, setAdminSecurityPin] = useState('');
  const [adminPinShow, setAdminPinShow] = useState(false);
  const [adminVerificationError, setAdminVerificationError] = useState<string | null>(null);

  const handleVerifyAndLoginAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminStaffId.trim()) {
      setAdminVerificationError('Faculty Staff ID is required');
      return;
    }
    if (!adminSecurityPin.trim()) {
      setAdminVerificationError('Master 6-digit Security PIN is required');
      return;
    }
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setAdminVerificationError('Please enter your Institutional Email and Password first.');
      return;
    }
    setAdminVerificationError(null);
    try {
      await onLoginAsAdmin(signInEmail.trim(), signInPassword.trim());
      setShowAdminVerification(false);
    } catch (err: any) {
      setAdminVerificationError(err.message || 'Admin authentication failed.');
    }
  };

  const handleEmailSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSignInError(null);
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError('Email and password are required.');
      return;
    }

    setIsSigningIn(true);
    try {
      if (loginRoleTab === 'admin') {
        await onLoginAsAdmin(signInEmail.trim(), signInPassword.trim());
      } else {
        await onLoginAsStudent(signInEmail.trim(), signInPassword.trim());
      }
    } catch (err: any) {
      setSignInError(err.message || 'Invalid email or password.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Comprehensive Step Validation Engine
  const validateStep = (targetStep: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (targetStep === 1) {
      if (!name.trim() || name.trim().length < 2) {
        errors.push('Full Name is required (minimum 2 characters).');
      }
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        errors.push('A valid University Email is required (e.g. name@student.edu).');
      }
      if (!university.trim()) {
        errors.push('University / Institution name is required.');
      }
      if (!degree.trim()) {
        errors.push('Degree Program selection is required.');
      }
      const numGpa = parseFloat(gpa);
      if (!gpa || isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
        errors.push('A valid Cumulative CGPA between 0.00 and 4.00 is required.');
      }
      if (semester > 1) {
        for (let s = 1; s < semester; s++) {
          const sVal = semesterGpas[s];
          const sGpa = parseFloat(sVal);
          if (sVal === undefined || sVal === '' || isNaN(sGpa) || sGpa < 0 || sGpa > 4.0) {
            errors.push(`Please enter your SGPA for Semester ${s} (between 0.00 and 4.00).`);
          }
        }
      }
      if (!location.trim()) {
        errors.push('City / Location is required.');
      }
      if (!educationDates.trim()) {
        errors.push('Graduation Period is required (e.g. 2022 - 2026).');
      }
      if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
      }
      if (password !== confirmPassword) {
        errors.push('Confirm Password does not match your password.');
      }
      if (!agreedToTerms) {
        errors.push('You must agree to CampusOS Terms & Privacy Policy to sign up.');
      }
    }

    if (targetStep === 2) {
      if (!careerGoal.trim()) {
        errors.push('Target Career Goal / Dream Role is required.');
      }
      if (!headline.trim()) {
        errors.push('Professional Headline is required (e.g. Aspiring AI Engineer).');
      }
      if (!aboutMe.trim() || aboutMe.trim().length < 10) {
        errors.push('Short Bio / About Me is required (minimum 10 characters).');
      }
    }

    if (targetStep === 3) {
      if (skillsList.length < 2) {
        errors.push('Please add at least 2 technical or professional skills to your profile.');
      }
      if (relevantCoursework.length < 2) {
        errors.push('Please add at least 2 relevant academic semester courses.');
      }
    }

    if (targetStep === 4) {
      if (!githubUrl.trim() || githubUrl.trim().length < 4) {
        errors.push('GitHub Profile or Portfolio Link is required.');
      }
      if (projectsList.length < 1) {
        errors.push('Please add at least 1 semester project or repository to your portfolio.');
      }
      if (experienceList.length < 1 && !isFresherConfirmed) {
        errors.push('Please add your work/internship experience, or check the confirmation if you have no prior work experience.');
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleStepClick = (target: number) => {
    if (target === step) return;
    if (target > step) {
      for (let s = 1; s < target; s++) {
        const check = validateStep(s);
        if (!check.valid) {
          setValidationErrors(check.errors);
          setStep(s);
          return;
        }
      }
    }
    setValidationErrors([]);
    setStep(target);
  };

  const handleContinueNext = () => {
    const check = validateStep(step);
    if (!check.valid) {
      setValidationErrors(check.errors);
      return;
    }
    setValidationErrors([]);
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleLaunchDashboard = () => {
    // Validate all 4 steps rigorously before allowing sign up or AI launch
    for (let s = 1; s <= 4; s++) {
      const check = validateStep(s);
      if (!check.valid) {
        setValidationErrors(check.errors);
        setStep(s);
        return;
      }
    }
    setValidationErrors([]);
    triggerAiEngineAndComplete();
  };

  // Launch Real AI Engine Calculation & Tailor Dashboard
  const triggerAiEngineAndComplete = async () => {
    // Re-verify all steps before activating AI
    for (let s = 1; s <= 4; s++) {
      const check = validateStep(s);
      if (!check.valid) {
        setValidationErrors(check.errors);
        setStep(s);
        return;
      }
    }

    setIsAnalyzingAI(true);
    setAiProgress(20);
    setAiStageText('Connecting to Campus OS AI Career Engine...');

    const numGPA = parseFloat(gpa) || 3.50;

    const userProfile: StudentUser = {
      name: name.trim(),
      email: email.trim(),
      degree: degree,
      university: university.trim(),
      semester: semester,
      totalSemesters: 8,
      completedSemesters: Math.max(0, semester - 1),
      careerGoal: careerGoal.trim(),
      gpa: numGPA,
      profileCompletion: 95,
      careerReadiness: 78,
      creditsCompleted: semester * 15 + 3,
      totalCredits: 132,
      academicStanding: numGPA >= 3.5 ? "Dean's Honor List" : numGPA >= 3.0 ? 'Good Standing' : 'Academic Probation',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      location: location.trim(),
      headline: headline.trim(),
      aboutMe: aboutMe.trim(),
      educationDates: educationDates.trim(),
      relevantCoursework: relevantCoursework,
    };

    const updatedProjects = projectsList.map((p) => ({
      ...p,
      githubUrl: p.githubUrl || githubUrl || '',
    }));

    // Construct full 8-semester detail array reflecting student's real inputs
    const semesterDetailsList: SemesterDetail[] = [];
    for (let s = 1; s <= 8; s++) {
      if (s < semester) {
        const termGpa = parseFloat(semesterGpas[s]) || numGPA;
        semesterDetailsList.push({
          semester: s,
          status: 'completed',
          gpa: Number(termGpa.toFixed(2)),
          coursesCount: 5,
        });
      } else if (s === semester) {
        semesterDetailsList.push({
          semester: s,
          status: 'current',
          gpa: numGPA,
          coursesCount: 5,
        });
      } else {
        semesterDetailsList.push({
          semester: s,
          status: 'upcoming',
          gpa: 0,
          coursesCount: 5,
        });
      }
    }

    try {
      setAiProgress(45);
      setAiStageText(`AI is evaluating ${skillsList.length} skills & portfolio for ${careerGoal}...`);

      const aiResponse = await aiApi.analyzeOnboarding({
        name: userProfile.name,
        degree: userProfile.degree,
        semester: userProfile.semester,
        university: userProfile.university,
        careerGoal: userProfile.careerGoal,
        gpa: userProfile.gpa,
        skills: skillsList,
        projects: updatedProjects,
        experiences: experienceList,
        relevantCoursework: relevantCoursework,
      });

      setAiProgress(75);
      setAiStageText('Synthesizing customized semester milestones & strategic roadmap...');

      const aiData = aiResponse?.data;
      const computedReadiness: CareerReadinessBreakdown = aiData?.careerReadiness || {
        skills: Math.min(100, Math.max(50, skillsList.length * 15)),
        projects: Math.min(100, Math.max(40, updatedProjects.length * 20)),
        experience: experienceList.length > 0 ? 85 : 50,
        profile: 95,
        networking: 70,
        overall: 78,
      };

      const aiNextSteps: NextActionItem[] | undefined = aiData?.nextSteps;
      const strategicAdvice: string | undefined = aiData?.strategicAdvice;
      const criticalSkillGaps: string[] | undefined = aiData?.criticalSkillGaps;

      userProfile.careerReadiness = computedReadiness.overall;
      userProfile.strategicAdvice = strategicAdvice;
      userProfile.criticalSkillGaps = criticalSkillGaps;

      setAiPreviewData({
        readiness: computedReadiness.overall,
        strategicAdvice,
        criticalSkillGaps,
        stepsCount: aiNextSteps?.length || 3,
      });

      setAiProgress(100);
      setAiStageText('Personalizing your CampusOS dashboard...');

      setTimeout(() => {
        onCompleteOnboarding(
          userProfile,
          skillsList,
          updatedProjects,
          experienceList,
          computedReadiness,
          aiNextSteps,
          password,
          semesterDetailsList,
          strategicAdvice,
          criticalSkillGaps
        );
      }, 700);
    } catch (err) {
      console.warn('AI Analysis fallback:', err);
      setTimeout(() => {
        finalizeDataAndLaunch();
      }, 500);
    }
  };

  const finalizeDataAndLaunch = () => {
    const numGPA = parseFloat(gpa) || 3.50;

    const userProfile: StudentUser = {
      name: name.trim() || 'Student',
      email: email.trim() || 'student@campus.edu',
      degree: degree,
      university: university.trim() || 'University',
      semester: semester,
      totalSemesters: 8,
      completedSemesters: Math.max(0, semester - 1),
      careerGoal: careerGoal.trim() || 'Software Engineer',
      gpa: numGPA,
      profileCompletion: 95,
      careerReadiness: 78,
      creditsCompleted: semester * 15 + 3,
      totalCredits: 132,
      academicStanding: numGPA >= 3.5 ? "Dean's Honor List" : numGPA >= 3.0 ? 'Good Standing' : 'Academic Probation',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      location: location.trim() || 'Campus',
      headline: headline.trim() || `Aspiring ${careerGoal} | Student at ${university}`,
      aboutMe: aboutMe.trim() || `Passionate ${degree} student at ${university} focused on ${careerGoal}.`,
      educationDates: educationDates.trim() || '2022 - 2026',
      relevantCoursework: relevantCoursework,
    };

    const updatedProjects = projectsList.map((p) => ({
      ...p,
      githubUrl: p.githubUrl || githubUrl || 'https://github.com',
    }));

    // Construct full 8-semester detail array reflecting student's real inputs
    const semesterDetailsList: SemesterDetail[] = [];
    for (let s = 1; s <= 8; s++) {
      if (s < semester) {
        const termGpa = parseFloat(semesterGpas[s]) || numGPA;
        semesterDetailsList.push({
          semester: s,
          status: 'completed',
          gpa: Number(termGpa.toFixed(2)),
          coursesCount: 5,
        });
      } else if (s === semester) {
        semesterDetailsList.push({
          semester: s,
          status: 'current',
          gpa: numGPA,
          coursesCount: 5,
        });
      } else {
        semesterDetailsList.push({
          semester: s,
          status: 'upcoming',
          gpa: 0,
          coursesCount: 5,
        });
      }
    }

    const completionScore = calculateProfileCompletion(
      userProfile,
      skillsList,
      updatedProjects,
      experienceList
    );

    userProfile.profileCompletion = completionScore;

    const computedReadiness: CareerReadinessBreakdown = {
      skills: Math.min(100, Math.max(50, skillsList.length * 15)),
      projects: Math.min(100, Math.max(40, updatedProjects.length * 20)),
      experience: experienceList.length > 0 ? 85 : 50,
      profile: completionScore,
      networking: 70,
      overall: 0,
    };

    computedReadiness.overall = Math.round(
      (computedReadiness.skills +
        computedReadiness.projects +
        computedReadiness.experience +
        computedReadiness.profile +
        computedReadiness.networking) /
        5
    );

    const fallbackAdvice = `Prioritize building flagship portfolio repositories aligned with ${careerGoal} while maintaining your academic standing in Semester ${semester}.`;
    const fallbackGaps = ['System Architecture & Cloud', 'Advanced CI/CD Pipelines', 'Production Deployment'];

    userProfile.strategicAdvice = fallbackAdvice;
    userProfile.criticalSkillGaps = fallbackGaps;

    onCompleteOnboarding(
      userProfile,
      skillsList,
      updatedProjects,
      experienceList,
      computedReadiness,
      undefined,
      password,
      semesterDetailsList,
      fallbackAdvice,
      fallbackGaps
    );
  };


  return (
    <div className="min-h-screen lg:h-screen w-full bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-[#283593] selection:text-white overflow-y-auto lg:overflow-hidden">
      {/* ========================================================================= */}
      {/* LEFT SPLIT PANEL: WHOLE SCREEN ON LEFT SIDE OCCUPIED BY CAMPUSOS BRAND    */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-1/2 lg:h-screen min-h-[380px] lg:min-h-screen bg-white flex flex-col items-center justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 select-none">
        {/* Subtle Ambient Background Glow Effects */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F4F7FB] to-[#EEF2FF]/60" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-[#283593]/15 via-[#0084FF]/20 to-[#2CE88E]/15 blur-3xl opacity-70 animate-pulse" />
        </div>
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Top subtle badge for balanced vertical framing */}
        <div className="relative z-10 w-full flex items-center justify-between opacity-80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#283593] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Student Intelligence Platform
            </span>
          </div>
        </div>

        {/* Brand Display Artwork with Typewriter Tagline */}
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center select-none py-4 my-auto">
          {/* Logo Container */}
          <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center p-2">
            <CampusOSLogo className="w-full h-full object-contain drop-shadow-md" />
          </div>

          {/* CampusOS Title */}
          <div className="mt-4 sm:mt-6 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B1336]">
              Campus
            </span>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-[#00D2FF] via-[#0084FF] to-[#2CE88E] bg-clip-text text-transparent ml-0.5">
              OS
            </span>
          </div>

          {/* Tagline Under CampusOS with Typewriting Animation */}
          <div className="mt-4 sm:mt-5 flex items-center gap-2.5 sm:gap-3.5 w-full max-w-sm sm:max-w-md lg:max-w-lg justify-center px-4">
            <div className="h-[1.5px] w-6 sm:w-10 lg:w-14 bg-slate-300 shrink-0" />
            <div className="min-h-[26px] flex items-center justify-center">
              <span className="text-xs sm:text-sm lg:text-[14px] font-extrabold tracking-[0.16em] sm:tracking-[0.20em] text-[#1E293B] uppercase text-center whitespace-nowrap">
                {typedTagline}
              </span>
              <span className="inline-block w-[2px] h-3.5 sm:h-4.5 bg-[#283593] ml-1 animate-pulse" />
            </div>
            <div className="h-[1.5px] w-6 sm:w-10 lg:w-14 bg-slate-300 shrink-0" />
          </div>
        </div>

        {/* Bottom subtle institutional footer */}
        <div className="relative z-10 w-full text-center text-slate-400 text-[11px] font-medium shrink-0 pt-2">
          <span>Empowering academic & career success</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SPLIT PANEL: CLEAN LIGHT TALENT/STUDENT ONBOARDING & LOGIN FORM     */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 h-full lg:h-screen bg-white flex flex-col p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Authentication Switcher Bar (Sign In & Sign Up) */}
        <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-6 border-b border-slate-100 shrink-0">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-2xs w-full sm:w-auto">
            <button
              id="auth-btn-sign-in"
              type="button"
              onClick={() => setActiveMode('login')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeMode === 'login'
                  ? 'bg-[#283593] text-white shadow-md shadow-[#283593]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
            <button
              id="auth-btn-sign-up"
              type="button"
              onClick={() => {
                setActiveMode('onboarding');
                setStep(1);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeMode === 'onboarding'
                  ? 'bg-[#283593] text-white shadow-md shadow-[#283593]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-500">
              {activeMode === 'login' ? 'Institutional & Student Login' : 'New Talent Registration'}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-xl mx-auto flex-1 my-auto py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isAnalyzingAI ? 'analyzing' : activeMode === 'login' ? 'login' : `step-${step}`}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* AI PROCESSING MODAL SCREEN */}
          {isAnalyzingAI ? (
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 text-center shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Glowing Background Accent */}
              <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#283593] via-[#4338CA] to-[#0084FF] text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-bounce">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1.5 rounded-2xl border-2 border-indigo-400/40 animate-ping opacity-35" />
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-[#283593] mb-3">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  CampusOS AI Career Engine • Live Dashboard Synthesis
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                  Personalizing Your Student Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-5 font-medium">{aiStageText}</p>

                {/* Live Progress Bar */}
                <div className="w-full max-w-md bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200 mb-2.5 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#283593] via-[#6366F1] to-[#10B981] h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
                <div className="w-full max-w-md flex items-center justify-between text-[11px] font-bold text-slate-500 mb-5 px-1">
                  <span>AI Assessment In-Flight</span>
                  <span className="text-[#283593]">{aiProgress}% Complete</span>
                </div>

                {/* Dynamic Assessment Matrix */}
                <div className="w-full max-w-md grid grid-cols-2 gap-2 text-left mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Pathway</span>
                    <strong className="text-slate-900 font-extrabold truncate block">{careerGoal || 'Software Engineer'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Academic Term</span>
                    <strong className="text-slate-900 font-extrabold block">Semester {semester} of 8</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Skills Analyzed</span>
                    <strong className="text-indigo-900 font-extrabold block">{skillsList.length} Technical Skills</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Portfolio Artifacts</span>
                    <strong className="text-emerald-900 font-extrabold block">{projectsList.length} Project(s) Verified</strong>
                  </div>
                </div>

                {/* Real-time AI Output Preview when available */}
                {aiPreviewData && (
                  <div className="w-full max-w-md p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-left space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-900">
                        <Sparkles className="h-3 w-3 text-indigo-600" />
                        AI Strategic Assessment Generated
                      </span>
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        Readiness: {aiPreviewData.readiness}%
                      </span>
                    </div>
                    {aiPreviewData.strategicAdvice && (
                      <p className="text-[11px] text-slate-700 leading-relaxed italic line-clamp-2">
                        "{aiPreviewData.strategicAdvice}"
                      </p>
                    )}
                    {aiPreviewData.criticalSkillGaps && aiPreviewData.criticalSkillGaps.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">Identified Gaps:</span>
                        {aiPreviewData.criticalSkillGaps.slice(0, 3).map((g, idx) => (
                          <span key={idx} className="text-[9.5px] font-bold text-indigo-800 bg-white border border-indigo-200 px-1.5 py-0.2 rounded">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeMode === 'onboarding' ? (
            /* ========================================================================= */
            /* TALENT / STUDENT ONBOARDING FORM                                          */
            /* ========================================================================= */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Form Title & Subtitle */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#283593] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    <Sparkles className="h-3 w-3" />
                    Sign Up • Step {step} of 4
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMode('login')}
                    className="text-xs font-medium text-slate-500 hover:text-[#283593] transition cursor-pointer"
                  >
                    Already have an account? <span className="font-bold text-[#283593] hover:underline">Sign In</span>
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {step === 1 && 'Create your student profile'}
                  {step === 2 && 'Define your career track & persona'}
                  {step === 3 && 'Skills & academic coursework'}
                  {step === 4 && 'Projects, experience & links'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step === 1 && 'All academic and identity fields marked with * are required for account creation.'}
                  {step === 2 && 'Select your target engineering track and enter your professional summary.'}
                  {step === 3 && 'Add at least 2 technical competencies and 2 relevant academic semester courses.'}
                  {step === 4 && 'Add your portfolio repository and work experience to launch your AI dashboard.'}
                </p>
              </div>

              {/* Step Progress Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { num: 1, label: 'Academics' },
                  { num: 2, label: 'Career Path' },
                  { num: 3, label: 'Skills' },
                  { num: 4, label: 'Projects' },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => handleStepClick(s.num)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                      s.num === step
                        ? 'border-[#283593] bg-blue-50/50 text-[#283593]'
                        : s.num < step
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                        s.num === step
                          ? 'bg-[#283593] text-white'
                          : s.num < step
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {s.num < step ? <Check className="h-3 w-3" /> : s.num}
                    </span>
                    <span className="text-[11px] font-bold truncate">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Global Multi-Step Validation Error Alert Box */}
              {validationErrors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 shadow-sm animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Please provide all required onboarding details to proceed:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11.5px] text-rose-700 space-y-0.5 font-medium pl-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* STEP 1: ACADEMICS & STUDENT DETAILS */}
              {step === 1 && (
                <div className="space-y-3">
                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        University Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your university email address"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        University / Institution *
                      </label>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="Enter your university name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        Degree Program *
                      </label>
                      <select
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none font-medium transition"
                      >
                        <option value="">Select Degree Program...</option>
                        {AVAILABLE_DEGREES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-0.5">
                          Current Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => handleSemesterChange(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-[#283593] focus:outline-none transition"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>
                              Semester {s} {s === 1 ? '(Freshman)' : s === 8 ? '(Final Term)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-0.5">
                          Cumulative CGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          max="4.00"
                          min="0.00"
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="Enter CGPA (e.g. 3.50)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-[#283593] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Previous Semesters SGPA breakdown when semester > 1 */}
                    {semester > 1 && (
                      <div className="sm:col-span-2 p-3 rounded-xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 border border-indigo-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-[#283593]" />
                            <span className="text-xs font-bold text-slate-900">
                              Previous Semesters SGPA (Semesters 1 to {semester - 1})
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-[#283593] bg-white px-2 py-0.5 rounded-md border border-indigo-100 shadow-2xs">
                            {semester - 1} Completed Term{semester - 1 > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Please enter your exact SGPA for each past semester. This directly populates your transcript and semester roadmap on the dashboard.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {Array.from({ length: semester - 1 }, (_, i) => i + 1).map((sNum) => (
                            <div key={sNum} className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs focus-within:border-[#283593]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-slate-800">Sem {sNum} SGPA</span>
                                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">Passed</span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                min="0.00"
                                max="4.00"
                                value={semesterGpas[sNum] !== undefined ? semesterGpas[sNum] : ''}
                                onChange={(e) => handleSemesterGpaChange(sNum, e.target.value)}
                                placeholder="SGPA (e.g. 3.70)"
                                className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 focus:border-[#283593] focus:outline-none bg-slate-50/50 focus:bg-white"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-indigo-100/70 text-[11px]">
                          <span className="text-slate-600">
                            Average CGPA:{' '}
                            <strong className="text-[#283593] font-black">{gpa || '--'}</strong>
                            {parseFloat(gpa) > 0 && (
                              <span className="ml-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {parseFloat(gpa) >= 3.5 ? "Dean's List" : parseFloat(gpa) >= 3.0 ? 'Good Standing' : 'Academic Standing'}
                              </span>
                            )}
                          </span>
                          <span className="text-[10.5px] text-slate-400">
                            Active term: Semester {semester}
                          </span>
                        </div>
                      </div>
                    )}

                    {semester === 1 && (
                      <div className="sm:col-span-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-blue-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#283593] shrink-0" />
                        <span>Freshman entry: You are beginning Semester 1. Enter your target GPA or high-school baseline above.</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your city / location"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        Graduation Period
                      </label>
                      <input
                        type="text"
                        value={educationDates}
                        onChange={(e) => setEducationDates(e.target.value)}
                        placeholder="Enter graduation years (e.g. 2023 - 2027)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password (min 6 characters)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    {passwordError && (
                      <div className="sm:col-span-2 p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium animate-in fade-in">
                        ⚠️ {passwordError}
                      </div>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-0.5">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#283593] focus:ring-[#283593] cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-600 leading-snug">
                        I agree to CampusOS{' '}
                        <span className="text-[#283593] font-semibold hover:underline">
                          Terms & Privacy Policy
                        </span>
                        , and consent to academic progress tracking.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: CAREER PATH & PERSONA */}
              {step === 2 && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-900">
                        Target Career Goal / Dream Role:
                      </label>
                      <span className="text-[10.5px] text-[#283593] font-semibold">
                        Type custom or pick a recommendation
                      </span>
                    </div>
                    <input
                      type="text"
                      value={careerGoal}
                      onChange={(e) => {
                        setCareerGoal(e.target.value);
                        setSelectedTrackId('');
                      }}
                      placeholder="e.g. AI / Machine Learning Engineer, Computer Vision Specialist..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs focus:border-[#283593] focus:ring-1 focus:ring-[#283593] focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Recommended Career Pathways ({CAREER_TRACKS.length}):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {CAREER_TRACKS.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => handleSelectTrack(track.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                            selectedTrackId === track.id || careerGoal.toLowerCase() === track.title.toLowerCase()
                              ? 'border-[#283593] bg-blue-50/70 shadow-2xs ring-1 ring-blue-500/20'
                              : 'border-slate-200 bg-white hover:border-[#8F9CFE] hover:bg-slate-50/80'
                          }`}
                        >
                          <span className="text-lg">{track.emoji}</span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{track.title}</h4>
                            <p className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">
                              {track.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Professional Headline:
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Aspiring AI Engineer | Computer Science Student"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Short Bio / About Me:
                    </label>
                    <textarea
                      rows={2}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      placeholder="Write a brief bio about yourself..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: SKILLS & COURSEWORK */}
              {step === 3 && (
                <div className="space-y-3">
                  {/* Skills Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Technical & Soft Skills ({skillsList.length}):
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] max-h-28 overflow-y-auto p-2 bg-slate-50/60 rounded-xl border border-slate-200">
                      {skillsList.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          No skills added yet. Select quick suggestions below or add your own skills.
                        </span>
                      ) : (
                        skillsList.map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs"
                          >
                            <span>{skill.name}</span>
                            <span className="text-[9.5px] font-bold text-blue-700 bg-blue-100/70 px-1 py-0.2 rounded">
                              {skill.level}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Custom Skill Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        placeholder="Enter a skill name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none"
                      />
                      <select
                        value={customSkillLevel}
                        onChange={(e) => setCustomSkillLevel(e.target.value as any)}
                        className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddCustomSkill()}
                        className="px-3 py-1.5 rounded-xl bg-[#283593] text-white text-xs font-bold hover:bg-[#1F297E] transition cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>

                    <div>
                      <span className="text-[10.5px] text-slate-500 font-semibold block mb-1">
                        Quick Add Suggested Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {SKILL_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleAddCustomSkill(s)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-[#283593] hover:text-[#283593] transition cursor-pointer"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Coursework Section */}
                  <div className="border-t border-slate-100 pt-2.5 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Relevant Academic Coursework ({relevantCoursework.length}):
                    </label>
                    <div className="flex flex-wrap items-center gap-1 min-h-[42px] max-h-24 overflow-y-auto p-2 bg-slate-50/60 rounded-xl border border-slate-200">
                      {relevantCoursework.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          No coursework added yet. Enter courses you have studied or are currently enrolled in.
                        </span>
                      ) : (
                        relevantCoursework.map((course) => (
                          <span
                            key={course}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-white px-2 py-0.5 text-xs font-medium text-blue-900 shadow-2xs"
                          >
                            <BookOpen className="h-3 w-3 text-[#283593]" />
                            <span>{course}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoursework(course)}
                              className="text-blue-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newCourseInput}
                        onChange={(e) => setNewCourseInput(e.target.value)}
                        placeholder="Enter course name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCoursework();
                          }
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCoursework}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                      >
                        + Course
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PROJECTS, EXPERIENCE & LINKS */}
              {step === 4 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      GitHub Profile or Portfolio Link:
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Enter your GitHub profile URL"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#283593] focus:outline-none"
                    />
                  </div>

                  {/* Work & Internship Experience */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Work & Internship Experience *
                      </label>
                      <span className="text-[10.5px] text-slate-400">
                        {experienceList.length > 0 ? `${experienceList.length} added` : 'Required (or confirm fresher)'}
                      </span>
                    </div>
                    {experienceList.length > 0 ? (
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {experienceList.map((exp) => (
                          <div
                            key={exp.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/80 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900">{exp.title}</span>
                              <span className="text-slate-500 ml-1.5">({exp.company})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer ml-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <label className="flex items-start gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isFresherConfirmed}
                          onChange={(e) => {
                            setIsFresherConfirmed(e.target.checked);
                            if (e.target.checked) setValidationErrors([]);
                          }}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#283593] focus:ring-[#283593] cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-700 font-medium leading-snug">
                          I am currently a student / fresher with no prior formal employment or internship experience yet.
                        </span>
                      </label>
                    )}
                    <div className="rounded-xl border border-dashed border-slate-300 p-2 space-y-1.5 bg-white">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={expTitle}
                          onChange={(e) => setExpTitle(e.target.value)}
                          placeholder="Enter job or role title"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={expCompany}
                          onChange={(e) => setExpCompany(e.target.value)}
                          placeholder="Enter company or organization name"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={expType}
                          onChange={(e) => setExpType(e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900 bg-white"
                        >
                          <option value="Internship">Internship</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Full-Time">Full-Time</option>
                          <option value="Research Assistant">Research Assistant</option>
                        </select>
                        <input
                          type="text"
                          value={expPeriod}
                          onChange={(e) => setExpPeriod(e.target.value)}
                          placeholder="Enter duration (e.g. Jun 2024 - Present)"
                          className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          disabled={!expTitle.trim() || !expCompany.trim()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#283593] text-white hover:bg-[#1F297E] transition disabled:opacity-40 cursor-pointer shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Projects & Repositories ({projectsList.length}):
                    </label>
                    {projectsList.length > 0 ? (
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {projectsList.map((proj) => (
                          <div
                            key={proj.id}
                            className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900">{proj.title}</span>
                              <span className="text-slate-500 text-[10px] ml-1.5">[{proj.status}]</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveProject(proj.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-[11px] text-slate-400 italic text-center">
                        No projects added yet. Enter your semester projects or repositories below.
                      </div>
                    )}

                    <div className="rounded-xl border border-dashed border-slate-300 p-2 space-y-1.5 bg-white">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          placeholder="Enter project title *"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={newProjectTech}
                          onChange={(e) => setNewProjectTech(e.target.value)}
                          placeholder="Enter technologies used (comma-separated)"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <input
                          type="url"
                          value={newProjectGithubUrl}
                          onChange={(e) => setNewProjectGithubUrl(e.target.value)}
                          placeholder="Enter GitHub repository URL"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                        <select
                          value={newProjectStatus}
                          onChange={(e) => setNewProjectStatus(e.target.value as any)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900 bg-white"
                        >
                          <option value="In Progress">Status: In Progress</option>
                          <option value="Completed">Status: Completed</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                          placeholder="Enter brief project description"
                          className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddProject}
                          disabled={!newProjectTitle.trim()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#283593] text-white hover:bg-[#1F297E] transition disabled:opacity-40 cursor-pointer shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(Math.max(1, step - 1))}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    step === 1
                      ? 'opacity-30 cursor-not-allowed text-slate-400'
                      : 'text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleContinueNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#283593] hover:bg-[#1F297E] shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                  >
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchDashboard}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#283593] via-[#1A237E] to-[#10B981] hover:from-[#1F297E] hover:to-[#059669] shadow-lg shadow-blue-500/25 active:scale-98 transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Launch My Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* QUICK SIGN IN PANEL                                                       */
            /* ========================================================================= */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition ${
                    loginRoleTab === 'admin'
                      ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                      : 'text-[#283593] bg-blue-50 border-blue-100'
                  }`}>
                    {loginRoleTab === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3" />
                        Admin Portal
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-3 w-3" />
                        Student Sign In
                      </>
                    )}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                  {loginRoleTab === 'admin' ? 'Institutional Admin Portal' : 'Sign in to CampusOS'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {loginRoleTab === 'admin'
                    ? 'Faculty, Dean & Administrator control center for student career outcomes.'
                    : 'Access your semester milestones, career roadmap, or institutional dashboard.'}
                </p>
              </div>

              {/* Portal Role Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
                <button
                  id="tab-role-student"
                  type="button"
                  onClick={() => {
                    setLoginRoleTab('student');
                    setSignInError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    loginRoleTab === 'student'
                      ? 'bg-white text-[#283593] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Student Sign In</span>
                </button>
                <button
                  id="tab-role-admin"
                  type="button"
                  onClick={() => {
                    setLoginRoleTab('admin');
                    setSignInError(null);
                    if (!signInEmail) setSignInEmail('admin@campus.edu');
                    if (!signInPassword) setSignInPassword('CampusAdmin2025!');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    loginRoleTab === 'admin'
                      ? 'bg-[#283593] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Direct Institutional & Student Sign In Form */}
              <form
                id="sign-in-form-email"
                onSubmit={handleEmailSignIn}
                className="space-y-3 pt-0.5"
              >
                {signInError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium animate-in fade-in">
                    ⚠️ {signInError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {loginRoleTab === 'admin' ? 'Institutional Admin Email *' : 'Email Address *'}
                  </label>
                  <input
                    id="sign-in-input-email"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder={loginRoleTab === 'admin' ? 'admin@campus.edu' : 'Enter your email address'}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-[#283593] outline-none transition"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Password *
                    </label>
                  </div>
                  <input
                    id="sign-in-input-password"
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-[#283593] outline-none transition"
                  />
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#283593] text-white px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-[#1f297e] active:scale-[0.99] transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {loginRoleTab === 'admin' ? (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>{isSigningIn ? 'Authenticating Admin...' : 'Sign In as Administrator'}</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>{isSigningIn ? 'Signing In...' : 'Sign In to CampusOS'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Institutional Admin Quick Access Card - Always Available */}
              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Institutional Admin Demo Access
                </span>
              </div>

              <div className="space-y-3">
                <button
                  id="admin-demo-quick-login-btn"
                  type="button"
                  onClick={() => {
                    setLoginRoleTab('admin');
                    setSignInEmail('admin@campus.edu');
                    setSignInPassword('CampusAdmin2025!');
                    setAdminStaffId('ADM-2024-001');
                    setAdminDeptCode('CS-DEAN-01');
                    setAdminSecurityPin('123456');
                    setShowAdminVerification(true);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/70 hover:border-indigo-300 transition text-left group active:scale-[0.99] shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xs">
                      SM
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          Dr. Sarah Malik
                        </span>
                        <span className="text-[10px] font-semibold bg-white border border-indigo-200 px-1.5 py-0.5 rounded text-indigo-700">
                          Admin / Dean
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Dean of Computing • Institutional Control Center Access
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 group-hover:border-indigo-400 transition">
                    <span>Clearance</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              </div>

              {/* Bottom Switch back to Sign Up flow */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('onboarding');
                    setStep(1);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#283593] hover:text-[#1F297E] hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50/50 transition"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Don't have an account? Sign Up</span>
                </button>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Legal & Security Notice */}
        <div className="w-full max-w-xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px] shrink-0 mt-auto">
          <span className="flex items-center gap-1.5">
            🔒 Your information is securely protected
          </span>
          <span>CampusOS • Student Career Platform</span>
        </div>
      </div>

      {/* Admin Credential Verification Modal */}
      <AnimatePresence>
        {showAdminVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminVerification(false);
                    setAdminVerificationError(null);
                  }}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Institutional Admin Clearance</h3>
                    <p className="text-xs text-indigo-200">Required credentials for Dean & Administrative access</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleVerifyAndLoginAdmin} className="p-6 space-y-4">
                {/* Admin user preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    SM
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">Dr. Sarah Malik</span>
                      <span className="text-[10px] font-semibold bg-white border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">
                        Dean of Computing
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Tier 1 Institutional Administrator</p>
                  </div>
                </div>

                {adminVerificationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {adminVerificationError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Faculty / Staff ID
                    </label>
                    <input
                      type="text"
                      value={adminStaffId}
                      onChange={(e) => setAdminStaffId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Faculty / Staff ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department Authorization Code
                    </label>
                    <input
                      type="text"
                      value={adminDeptCode}
                      onChange={(e) => setAdminDeptCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Department Code"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Master 6-Digit Admin PIN
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={adminPinShow ? 'text' : 'password'}
                        value={adminSecurityPin}
                        onChange={(e) => setAdminSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter 6-digit PIN"
                        maxLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setAdminPinShow(!adminPinShow)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {adminPinShow ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enforces institutional clearance before granting control center access.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Verify Credentials & Access Control Center
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

