import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Target,
  TrendingUp,
  Compass,
  ArrowRight,
  Plus,
  Award,
  Zap,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { SemesterJourneyCard } from '../components/dashboard/SemesterJourneyCard';
import { CareerDirectionCard } from '../components/dashboard/CareerDirectionCard';
import { NextStepsCard } from '../components/dashboard/NextStepsCard';
import { AcademicProgressCard } from '../components/dashboard/AcademicProgressCard';
import { SkillsProgressCard } from '../components/dashboard/SkillsProgressCard';
import { ProjectsCard } from '../components/dashboard/ProjectsCard';
import { ExperienceCard } from '../components/dashboard/ExperienceCard';
import { TopOpportunitiesCard } from '../components/dashboard/TopOpportunitiesCard';
import { AIMentorCard } from '../components/dashboard/AIMentorCard';
import { CampusOSProfileCard } from '../components/dashboard/CampusOSProfileCard';
import { StudentProfileCard } from '../components/dashboard/StudentProfileCard';
import { CareerReadinessCard } from '../components/dashboard/CareerReadinessCard';
import { SkillGrowthCard } from '../components/dashboard/SkillGrowthCard';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';

import { AddExperienceModal } from '../components/modals/AddExperienceModal';
import { AddProjectModal } from '../components/modals/AddProjectModal';
import { UpdateCareerGoalModal } from '../components/modals/UpdateCareerGoalModal';
import { UpdateSkillsModal } from '../components/modals/UpdateSkillsModal';
import { ActionDetailModal } from '../components/modals/ActionDetailModal';

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
} from '../types';

interface DashboardPageProps {
  user: StudentUser;
  checklistItems: ProfileChecklistItem[];
  nextSteps: NextActionItem[];
  skills: SkillProgressItem[];
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  semesters: SemesterDetail[];
  careerReadiness: CareerReadinessBreakdown;
  skillGrowth: SkillGrowthMonth[];
  achievements: AchievementItem[];
  recentActivities: RecentActivityItem[];
  searchQuery: string;
  onAddExperience: (exp: ExperienceItem) => void;
  onAddProject: (proj: ProjectItem) => void;
  onAddSkill: (skill: SkillProgressItem) => void;
  onRemoveSkill: (skillId: string) => void;
  onUpdateCareerGoal: (goal: string) => void;
  onCompleteAction: (actionId: string) => void;
  onNavigateTab: (tab: string) => void;
  onRecalibrateRoadmap?: () => Promise<void> | void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  checklistItems,
  nextSteps,
  skills,
  projects,
  experiences,
  semesters,
  careerReadiness,
  skillGrowth,
  achievements,
  recentActivities,
  searchQuery,
  onAddExperience,
  onAddProject,
  onAddSkill,
  onRemoveSkill,
  onUpdateCareerGoal,
  onCompleteAction,
  onNavigateTab,
  onRecalibrateRoadmap,
}) => {
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [isCareerGoalOpen, setIsCareerGoalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<NextActionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChecklistAction = (actionKey?: string) => {
    if (actionKey === 'add_experience') {
      setIsAddExpOpen(true);
    } else if (actionKey === 'add_project') {
      setIsAddProjOpen(true);
    } else if (actionKey === 'career_goal') {
      setIsCareerGoalOpen(true);
    } else if (actionKey === 'skills') {
      setIsSkillsModalOpen(true);
    } else if (actionKey === 'github') {
      showToast('GitHub repository connected successfully!');
    } else if (actionKey === 'profile_photo') {
      showToast('Profile photo verified.');
    } else if (actionKey === 'education') {
      showToast('Academic verification confirmed.');
    }
  };

  // Search filtering for skills and projects
  const filteredSkills = searchQuery
    ? skills.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : skills;

  const filteredProjects = searchQuery
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  return (
    <div id="campusos-dashboard-root" className="relative space-y-5 pb-2">
      {/* Subtle Ambient Background Mesh Orbs for Glassmorphism Refraction */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-300/30 blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-1/3 -right-12 h-96 w-96 rounded-full bg-gradient-to-br from-purple-200/35 to-indigo-200/25 blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-10 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-200/30 to-purple-200/20 blur-3xl -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900/90 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* ======================================================== */}
        {/* LEFT / CENTER MAIN COLUMN (approx. 67% on desktop)       */}
        {/* ======================================================== */}
        <div className="space-y-5 xl:col-span-8">
          {/* ======================================================== */}
          {/* MINIMAL WELCOME BANNER (Clean White Background)          */}
          {/* ======================================================== */}
          <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 text-slate-900 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_32px_rgba(40,53,147,0.1)]">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
              {/* Left: Clean Heading & Core Metrics Only */}
              <div className="space-y-3 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-slate-900 leading-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-[#1A237E] via-[#283593] to-[#6366F1]">{user.name || 'Ali Raza'}</span>! 👋
                </h1>

                {/* Direct Metric Badges - Cleanly aligned across mobile, tablet, and desktop */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 py-0.5">
                  <span className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-white border border-[#8F9CFE]/60 px-3 py-1.5 text-xs sm:text-[13px] font-medium text-slate-700 shadow-2xs transition-all hover:border-[#283593] hover:bg-white hover:shadow-xs">
                    <Target className="h-4 w-4 text-[#283593]" />
                    <span>Semester <strong className="text-slate-900 font-bold">{user.semester} of {user.totalSemesters || 8}</strong></span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-white border border-[#8F9CFE]/60 px-3 py-1.5 text-xs sm:text-[13px] font-medium text-slate-700 shadow-2xs transition-all hover:border-[#283593] hover:bg-white hover:shadow-xs">
                    <TrendingUp className="h-4 w-4 text-[#283593]" />
                    <span>AI Readiness: <strong className="text-[#283593] font-bold">{user.careerReadiness || careerReadiness.overall}%</strong></span>
                  </span>
                </div>
              </div>

              {/* Right: Streamlined Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => onNavigateTab('roadmap')}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs"
                >
                  <Compass className="h-4 w-4 text-[#283593]" />
                  <span>Explore Roadmap</span>
                </button>
                <button
                  onClick={() => onNavigateTab('ai-mentor')}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-linear-to-r from-[#283593] to-[#6366F1] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:from-[#1F297E] hover:to-[#5558E6] transition active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Campus GPT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 1: Top 2 Hero Cards (Semester Journey & Career Direction) */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SemesterJourneyCard
              user={user}
              onViewAcademic={() => onNavigateTab('academic-progress')}
            />

            <CareerDirectionCard
              user={user}
              onViewRoadmap={() => onNavigateTab('roadmap')}
            />
          </div>

          {/* AI Intelligence Assessment & Strategy Card */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-5 text-slate-900 shadow-xs transition-all hover:border-[#283593] hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#283593] to-[#4338CA] text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      CampusOS AI Career Intelligence Directive
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      AI Calibrated
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Customized from your onboarding profile assessment for <strong className="text-slate-800">{user.careerGoal || 'Software Engineer'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('ai-mentor')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-[#283593] hover:bg-indigo-50 transition cursor-pointer self-start sm:self-center shadow-2xs"
              >
                <Brain className="h-3.5 w-3.5" />
                <span>Discuss with AI Mentor</span>
              </button>
            </div>

            {/* Strategic Advice Text */}
            <div className="p-3.5 rounded-xl bg-white/95 border border-indigo-100 shadow-2xs mb-3 text-xs text-slate-700 leading-relaxed">
              <strong className="text-indigo-950 font-bold block mb-1 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-[#283593]" />
                Personalized AI Strategic Analysis:
              </strong>
              <span>
                {user.strategicAdvice ||
                  `Focus on bridging core technical depth while advancing your Semester ${user.semester || 1} coursework in ${user.degree || 'Computing'}. Complete and deploy flagship portfolio repositories to maximize engineering competitiveness.`}
              </span>
            </div>

            {/* Critical Skill Gaps */}
            {user.criticalSkillGaps && user.criticalSkillGaps.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-100/70">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-rose-500" />
                  AI Identified Priority Skill Gaps:
                </span>
                {user.criticalSkillGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-100/70 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-900 shadow-2xs"
                  >
                    <span>{gap}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Personalized Next Steps Card */}
          <NextStepsCard
            actions={nextSteps}
            onActionClick={(action) => setSelectedAction(action)}
            onViewAll={() => onNavigateTab('roadmap')}
            onRecalibrate={onRecalibrateRoadmap}
          />

          {/* Row 3: Academic Progress Card */}
          <AcademicProgressCard
            user={user}
            semesters={semesters}
            onViewAll={() => onNavigateTab('academic-progress')}
          />

          {/* Row 4: Skills Progress Card */}
          <SkillsProgressCard
            skills={filteredSkills}
            onViewAll={() => onNavigateTab('skills')}
          />

          {/* Row 5: Projects & Experience Split Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProjectsCard
              projects={filteredProjects}
              onViewAll={() => onNavigateTab('projects')}
              onAddProject={() => setIsAddProjOpen(true)}
            />

            <ExperienceCard
              experiences={experiences}
              onViewAll={() => onNavigateTab('experience')}
              onAddExperience={() => setIsAddExpOpen(true)}
            />
          </div>

          {/* Row 6: Top Matched Opportunities Card */}
          <TopOpportunitiesCard
            user={user}
            onViewAll={() => onNavigateTab('opportunities')}
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (approx. 33% on desktop)                    */}
        {/* ======================================================== */}
        <div className="space-y-5 xl:col-span-4">
          {/* 1. AI Career Mentor (Mini Card - Aligned with Welcome Banner) */}
          <AIMentorCard
            user={user}
            careerReadiness={careerReadiness}
            skills={skills}
            projects={projects}
            certifications={user.certifications}
            recentActivities={recentActivities}
            onOpenFullChat={() => onNavigateTab('ai-mentor')}
          />

          {/* 2. My Profile Snapshot */}
          <StudentProfileCard
            user={user}
            onViewProfile={() => onNavigateTab('profile')}
          />

          {/* 3. Complete Your CampusOS Profile */}
          <CampusOSProfileCard
            items={checklistItems}
            onActionClick={handleChecklistAction}
          />

          {/* 4. Career Readiness */}
          <CareerReadinessCard
            data={careerReadiness}
            onExploreGoals={() => onNavigateTab('roadmap')}
          />

          {/* 5. Skill Growth (4-Month Progress) */}
          <SkillGrowthCard
            growthData={skillGrowth}
            onViewSkills={() => onNavigateTab('skills')}
          />

          {/* 6. Quick Actions */}
          <QuickActionsCard
            onAddProject={() => setIsAddProjOpen(true)}
            onAddExperience={() => setIsAddExpOpen(true)}
            onUpdateSkills={() => setIsSkillsModalOpen(true)}
            onUpdateCareerGoal={() => setIsCareerGoalOpen(true)}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS                                       */}
      {/* ======================================================== */}
      <AddExperienceModal
        isOpen={isAddExpOpen}
        onClose={() => setIsAddExpOpen(false)}
        onAdd={(exp) => {
          onAddExperience(exp);
          showToast('Experience added to your profile!');
        }}
      />

      <AddProjectModal
        isOpen={isAddProjOpen}
        onClose={() => setIsAddProjOpen(false)}
        onAdd={(proj) => {
          onAddProject(proj);
          showToast(`Project "${proj.title}" added to your portfolio!`);
        }}
      />

      <UpdateCareerGoalModal
        isOpen={isCareerGoalOpen}
        onClose={() => setIsCareerGoalOpen(false)}
        currentGoal={user.careerGoal}
        onUpdate={(goal) => {
          onUpdateCareerGoal(goal);
          showToast(`Target career goal updated to ${goal}!`);
        }}
      />

      <UpdateSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={skills}
        onAddSkill={(sk) => {
          onAddSkill(sk);
          showToast(`Skill "${sk.name}" added!`);
        }}
        onRemoveSkill={(id) => {
          onRemoveSkill(id);
          showToast('Skill removed.');
        }}
      />

      <ActionDetailModal
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        action={selectedAction}
        onCompleteAction={(id) => {
          onCompleteAction(id);
          showToast('Next step marked as completed!');
        }}
      />
    </div>
  );
};
