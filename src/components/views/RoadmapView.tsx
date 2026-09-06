import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  CircleDot,
  Circle,
  Eye,
  Binary,
  FolderGit2,
  Users,
  Target,
  Sparkles,
  Plus,
  RotateCw,
  Trash2,
  Code,
  Database,
  Shield,
  Cloud,
  Layers,
  LineChart,
  Terminal,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Award,
} from 'lucide-react';
import { StudentUser, NextActionItem } from '../../types';
import { AddRoadmapTaskModal } from '../modals/AddRoadmapTaskModal';
import { FocusPillarModal, FocusPillar } from '../modals/FocusPillarModal';
import { studentApi } from '../../services/api';

interface RoadmapViewProps {
  user: StudentUser;
  nextSteps: NextActionItem[];
  onBackToDashboard: () => void;
  onSelectAction: (action: NextActionItem) => void;
  onUpdateCareerGoal?: () => void;
  onToggleActionStatus?: (actionId: string, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onAddRoadmapTask?: (task: {
    title: string;
    category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: string;
    actionType: string;
  }) => Promise<void> | void;
  onDeleteRoadmapTask?: (actionId: string) => Promise<void> | void;
  onRecalibrateRoadmap?: () => Promise<void> | void;
  onNavigateTab?: (tab: string, prompt?: string) => void;
}

// Map string icon names to Lucide icons
const iconMap: Record<string, any> = {
  Eye,
  Binary,
  FolderGit2,
  Users,
  Code,
  Database,
  Shield,
  Cloud,
  Layers,
  LineChart,
  Terminal,
};

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  user,
  nextSteps = [],
  onBackToDashboard,
  onSelectAction,
  onUpdateCareerGoal,
  onToggleActionStatus,
  onAddRoadmapTask,
  onDeleteRoadmapTask,
  onRecalibrateRoadmap,
  onNavigateTab,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<FocusPillar | null>(null);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [recalibrateToast, setRecalibrateToast] = useState<string | null>(null);
  const [pillars, setPillars] = useState<FocusPillar[]>([]);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [isLoadingPillars, setIsLoadingPillars] = useState(false);
  const [isRecalibratingPillars, setIsRecalibratingPillars] = useState(false);

  // Load Focus Pillars dynamically from API with fallback
  useEffect(() => {
    let isMounted = true;
    const fetchPillars = async () => {
      try {
        setIsLoadingPillars(true);
        const res = await studentApi.getFocusPillars();
        if (res.success && res.data?.pillars && isMounted) {
          setPillars(res.data.pillars);
          if (res.data.stageLabel) setStageLabel(res.data.stageLabel);
          return;
        }
      } catch (err) {
        // fallback will execute below
      } finally {
        if (isMounted) setIsLoadingPillars(false);
      }

      // Local fallback based on track
      if (isMounted) {
        const track = detectLocalTrack(user.careerGoal, user.degree);
        setPillars(getLocalFallbackPillars(track, user.semester || 1, user.careerGoal));
      }
    };

    fetchPillars();
    return () => {
      isMounted = false;
    };
  }, [user.careerGoal, user.degree, user.semester]);

  const handleRecalibratePillars = async () => {
    try {
      setIsRecalibratingPillars(true);
      const res = await studentApi.regenerateFocusPillars();
      if (res.success && res.data?.pillars) {
        setPillars(res.data.pillars);
        if (res.data.stageLabel) setStageLabel(res.data.stageLabel);
        setRecalibrateToast('AI Focus Pillars recalibrated for your current academic stage!');
        setTimeout(() => setRecalibrateToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to recalibrate pillars:', err);
    } finally {
      setIsRecalibratingPillars(false);
    }
  };

  // Dynamically calculate career roadmap alignment
  const completedTasks = nextSteps.filter((s) => s.status === 'completed').length;
  const inProgressTasks = nextSteps.filter((s) => s.status === 'in-progress' || (s as any).status === 'in_progress').length;
  const todoTasks = nextSteps.filter((s) => !s.status || s.status === 'pending').length;

  const targetAlignment = Math.min(
    100,
    Math.max(
      45,
      user.careerReadiness > 0
        ? user.careerReadiness
        : nextSteps.length > 0
        ? Math.round((completedTasks / nextSteps.length) * 100) || 54
        : 54
    )
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(targetAlignment);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetAlignment]);

  // SVG Circular Progress math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Filter next steps
  const filteredSteps = nextSteps.filter((step) => {
    const st = step.status || 'pending';
    if (statusFilter === 'all') return true;
    if (statusFilter === 'todo') return st === 'pending';
    if (statusFilter === 'in-progress') return st === 'in-progress' || (st as any) === 'in_progress';
    if (statusFilter === 'completed') return st === 'completed';
    return true;
  });

  const handleCycleStatus = (step: NextActionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleActionStatus) return;

    const cur = step.status || 'pending';
    let next: 'pending' | 'in-progress' | 'completed' = 'in-progress';
    if (cur === 'pending') next = 'in-progress';
    else if (cur === 'in-progress' || (cur as any) === 'in_progress') next = 'completed';
    else if (cur === 'completed') next = 'pending';

    onToggleActionStatus(step.id, next);
  };

  const handleRecalibrate = async () => {
    if (!onRecalibrateRoadmap) return;
    try {
      setIsRecalibrating(true);
      await onRecalibrateRoadmap();
      setRecalibrateToast('Roadmap milestones updated via AI!');
      setTimeout(() => setRecalibrateToast(null), 3500);
    } catch (err) {
      console.warn('Recalibrate error:', err);
    } finally {
      setIsRecalibrating(false);
    }
  };

  const handleConsultAI = (prompt?: string) => {
    if (onNavigateTab) {
      onNavigateTab('ai-mentor', prompt);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {recalibrateToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-8 z-50 flex items-center gap-2 rounded-xl bg-[#283593] text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-indigo-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>{recalibrateToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  My AI Career Roadmap
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">
                Curated semester-by-semester milestones tailored for {user.careerGoal || 'AI / Machine Learning Engineer'} roles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onUpdateCareerGoal && (
              <button
                id="btn-update-target-goal"
                onClick={onUpdateCareerGoal}
                className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
                title="Click to update target career goal"
              >
                <Target className="h-3.5 w-3.5 text-[#283593]" />
                <span>Target: {user.careerGoal || 'AI / ML Engineer'}</span>
              </button>
            )}

            <button
              id="btn-consult-ai-mentor-roadmap"
              onClick={() => handleConsultAI(`I want to review my career roadmap milestones for Semester ${user.semester} targeting ${user.careerGoal}. Can you advise me on priorities?`)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 border border-indigo-200/90 px-3.5 py-2 text-xs font-bold text-[#283593] transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Ask Campus GPT</span>
            </button>

            <button
              id="btn-back-to-dashboard-roadmap"
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Left Column (2 Cols): Priority Next Steps */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md h-full flex flex-col justify-between"
          >
            <div>
              {/* Header with Title & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                      Priority Next Steps
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-[#283593]">
                      {nextSteps.length} Actions
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 font-normal mt-1">
                    High-impact actions to execute for Semester {user.semester || 5}.
                  </p>
                </div>

                {/* Action Buttons: Add Milestone + Recalibrate */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Milestone</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRecalibrate}
                    disabled={isRecalibrating}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 border border-indigo-200 text-[#283593] px-3 py-1.5 text-xs font-bold transition shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Recalibrate roadmap with CampusOS AI"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
                    <span>{isRecalibrating ? 'AI Recalibrating...' : 'AI Recalibrate'}</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100 mb-3">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-[#283593] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({nextSteps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('todo')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'todo'
                      ? 'bg-[#283593] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  To Do ({todoTasks})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('in-progress')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'in-progress'
                      ? 'bg-[#283593] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  In Progress ({inProgressTasks})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'completed'
                      ? 'bg-[#283593] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Completed ({completedTasks})
                </button>
              </div>

              {/* List of Step Cards */}
              <div className="space-y-2.5">
                {filteredSteps.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#283593] mx-auto mb-3">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {statusFilter === 'all'
                        ? 'No roadmap actions configured'
                        : `No actions in "${statusFilter}" state`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Click "+ Add Milestone" to define custom targets or click "AI Recalibrate" to let Campus OS generate high-impact steps.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-xl bg-[#283593] text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#1F297E] transition cursor-pointer"
                      >
                        Add Custom Milestone
                      </button>
                      <button
                        type="button"
                        onClick={handleRecalibrate}
                        className="rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-2 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                      >
                        Generate via AI
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredSteps.map((step, index) => {
                    const isHighPriority = step.priority === 'High';
                    const isMediumPriority = step.priority === 'Medium';
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in-progress' || (step as any).status === 'in_progress';

                    // Status icon & label
                    let StatusIcon = Circle;
                    let statusLabel = 'To Do';
                    let statusColor = 'text-slate-400 group-hover:text-slate-600';
                    if (isCompleted) {
                      StatusIcon = CheckCircle2;
                      statusLabel = 'Completed';
                      statusColor = 'text-emerald-600';
                    } else if (isInProgress) {
                      StatusIcon = CircleDot;
                      statusLabel = 'In Progress';
                      statusColor = 'text-[#283593]';
                    }

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.04 * index }}
                        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-xl border p-3.5 sm:p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 ${
                          isCompleted
                            ? 'bg-slate-50/80 border-slate-200/60 opacity-85'
                            : 'bg-white border-slate-200/80 hover:border-[#283593] hover:shadow-xs'
                        }`}
                      >
                        {/* Content Left */}
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Interactive Status Cycle Button */}
                          <button
                            type="button"
                            onClick={(e) => handleCycleStatus(step, e)}
                            className={`mt-0.5 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer ${statusColor}`}
                            title={`Click to cycle status (Current: ${statusLabel})`}
                          >
                            <StatusIcon className="h-5 w-5" />
                          </button>

                          {/* Step Number Tag */}
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/90 text-xs font-bold text-[#283593] group-hover:bg-[#EEF2FF] group-hover:border-indigo-200 transition-colors">
                            {step.number}
                          </span>

                          <div className="min-w-0 space-y-1.5">
                            <p
                              className={`text-[15px] font-semibold leading-snug transition-colors ${
                                isCompleted
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-900 group-hover:text-[#283593]'
                              }`}
                            >
                              {step.title}
                            </p>

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {/* Category Tag */}
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] font-medium text-slate-700">
                                {step.category}
                              </span>

                              {/* Priority Pill */}
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                                  isHighPriority
                                    ? 'bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE]'
                                    : isMediumPriority
                                    ? 'bg-[#FAF5FF] text-[#6B21A8] border border-[#DDD6FE]'
                                    : 'bg-slate-50 text-slate-600 border border-slate-200/70'
                                }`}
                              >
                                {step.priority.toUpperCase()} PRIORITY
                              </span>

                              {/* Estimated Time */}
                              <span className="inline-flex items-center gap-1 text-[12px] text-slate-500 font-normal">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>{step.estimatedTime}</span>
                              </span>

                              {/* Progress/Status pill */}
                              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold border-l border-slate-200 pl-2 text-slate-600">
                                <span>{statusLabel}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Right */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => onSelectAction(step)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#283593] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1F297E] transition-all duration-150 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
                          >
                            <span>View Action</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </button>

                          {onDeleteRoadmapTask && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRoadmapTask(step.id);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-60 group-hover:opacity-100 cursor-pointer"
                              title="Delete Milestone"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (1 Col): Roadmap Alignment */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md flex flex-col justify-between h-full space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                    Roadmap Alignment
                  </h2>
                  <p className="text-[13px] text-slate-500 font-normal mt-1">
                    Progress towards your target career goal.
                  </p>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-[#283593] shrink-0">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>

              {/* Circular Progress Ring */}
              <div className="my-2 sm:my-3 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="h-24 w-24 sm:h-28 sm:w-28 -rotate-90 transform" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="text-slate-100"
                      strokeWidth="9"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="text-[#283593]"
                      strokeWidth="9"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                      {targetAlignment}%
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#283593] mt-0.5 uppercase tracking-wider">
                      Aligned
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-sm font-semibold text-slate-800 block">
                    Goal Alignment
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Target: <strong className="text-slate-700 font-semibold">{user.careerGoal || 'AI / ML Engineer'}</strong>
                  </span>
                </div>
              </div>

              {/* Dynamic Supporting Text / AI Strategic Advice */}
              <div className="rounded-xl bg-[#FAFBFD] border border-slate-200/70 p-3 text-xs text-slate-600 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-[#283593] font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Career Intelligence Directive</span>
                </div>
                <p>
                  {user.strategicAdvice
                    ? user.strategicAdvice
                    : `You are on track with Semester ${user.semester || 5} core requirements. Completing flagship ${user.careerGoal || 'engineering'} milestones will accelerate your readiness score into top percentiles.`}
                </p>
              </div>

              {/* Priority Skill Gaps if present */}
              {user.criticalSkillGaps && user.criticalSkillGaps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Priority Skill Gaps Identified:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.criticalSkillGaps.map((gap, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleConsultAI(`Can you give me a focused study plan and project ideas to master ${gap} for ${user.careerGoal}?`)}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800 transition cursor-pointer"
                        title="Click to consult AI Mentor on this skill"
                      >
                        <span>{gap}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Summary Pill & AI Consult Button */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Semester Stage</span>
                <span className="font-semibold text-slate-800">
                  Term {user.semester || 5} of {user.totalSemesters || 8}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleConsultAI(`Analyze my roadmap progress. I have completed ${completedTasks} of ${nextSteps.length} milestones. What should I prioritize this week?`)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#283593] hover:bg-[#1F297E] text-white py-2 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Consult AI Career Advisor</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Semester Focus Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Semester {user.semester || 1} Focus Pillars
              </h2>
              {stageLabel && (
                <span className="text-[11px] font-semibold text-[#283593] bg-[#EEF2FF] border border-[#C7D2FE] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#283593]" />
                  {stageLabel}
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md hidden md:inline-block">
                Click any pillar to explore
              </span>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-0.5">
              Core academic and experiential pillars to prioritize during your current term for {user.careerGoal || 'Software Engineering'}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRecalibratePillars}
            disabled={isRecalibratingPillars}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-[#F8F9FE] px-3 py-1.5 text-xs font-bold text-[#283593] hover:bg-[#EEF2FF] transition cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Recalibrate Focus Pillars using AI Engine"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isRecalibratingPillars ? 'animate-spin' : ''}`} />
            <span>{isRecalibratingPillars ? 'Recalibrating...' : 'AI Recalibrate'}</span>
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {pillars.map((pillar) => {
            const Icon = (typeof pillar.icon === 'string' ? iconMap[pillar.icon] : pillar.icon) || Eye;
            return (
              <div
                key={pillar.number}
                onClick={() => setSelectedPillar(pillar)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#FAFBFD] p-4 shadow-2xs hover:border-[#283593] hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-xs font-bold text-[#283593] shadow-2xs group-hover:bg-[#EEF2FF] group-hover:border-indigo-200 transition-colors">
                      {pillar.number}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200/70 text-[#283593] group-hover:bg-[#283593] group-hover:text-white transition-colors shadow-2xs">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-slate-900 leading-snug group-hover:text-[#283593] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1.5 line-clamp-2">
                    {pillar.tech}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>{pillar.tag}</span>
                  <span className="text-[#283593] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Explore <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Add Roadmap Task Modal */}
      <AddRoadmapTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        semester={user.semester || 5}
        onAdd={async (task) => {
          if (onAddRoadmapTask) {
            await onAddRoadmapTask(task);
            setRecalibrateToast('New milestone added to roadmap!');
            setTimeout(() => setRecalibrateToast(null), 3000);
          }
        }}
      />

      {/* Focus Pillar Deep Dive Modal */}
      <FocusPillarModal
        isOpen={!!selectedPillar}
        onClose={() => setSelectedPillar(null)}
        pillar={selectedPillar}
        semester={user.semester || 5}
        careerGoal={user.careerGoal || 'AI / ML Engineer'}
        onAddMilestone={async (milestone) => {
          if (onAddRoadmapTask) {
            await onAddRoadmapTask(milestone);
            setRecalibrateToast(`Added "${milestone.title}" to priority next steps!`);
            setTimeout(() => setRecalibrateToast(null), 3000);
          }
        }}
        onConsultGPT={(prompt) => handleConsultAI(prompt)}
      />
    </motion.div>
  );
};

// Helper: detect local track
function detectLocalTrack(goal?: string, degree?: string): string {
  const combined = `${goal || ''} ${degree || ''}`.toLowerCase();
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('vision') || combined.includes('nlp')) {
    return 'ai';
  }
  if (combined.includes('cloud') || combined.includes('devops') || combined.includes('sre') || combined.includes('infrastructure')) {
    return 'cloud';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('hack') || combined.includes('infosec')) {
    return 'cybersecurity';
  }
  if (combined.includes('data') || combined.includes('analytics') || combined.includes('bi')) {
    return 'data';
  }
  if (combined.includes('web') || combined.includes('full stack') || combined.includes('frontend') || combined.includes('backend') || combined.includes('software')) {
    return 'fullstack';
  }
  return 'general';
}

// Local fallback pillars if offline
function getLocalFallbackPillars(track: string, semester: number, careerGoal?: string): FocusPillar[] {
  const goal = careerGoal || 'Software Engineering';
  const sem = Number(semester) || 1;

  // STAGE 1: SEMESTER 1 & 2 (Freshman Foundations)
  if (sem <= 2) {
    if (track === 'ai') {
      return [
        {
          number: '01',
          title: 'Programming Foundations & Python Syntax',
          tech: 'Python 3 · Algorithmic Thinking · Functions & Logic',
          tag: 'Foundational Coding',
          icon: Code,
          description: `Master Python programming syntax, control flow, functions, and structured problem-solving for ${goal}.`,
          keyCompetencies: [
            'Python syntax, control flow, functions & scopes',
            'Recursion, string manipulation & basic algorithms',
            'File I/O, error handling & unit testing basics',
            'Clean code conventions & PEP 8 readability standards',
          ],
          recommendedProject: {
            title: 'Algorithmic Problem Solver & CLI Suite',
            description: 'Build a modular CLI toolkit containing math engines and interactive simulations.',
            techStack: ['Python', 'pytest', 'CLI'],
          },
          suggestedMilestone: {
            title: 'Master Python Core Fundamentals & Write 30+ Scripts',
            category: 'Skill',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '02',
          title: 'Linear Algebra & Matrix Computing',
          tech: 'Matrix Math · Vectors · NumPy · Derivatives',
          tag: 'Mathematics for AI',
          icon: Binary,
          description: 'Bridge university mathematics with computational matrix operations, vector spaces, and autograd intuition.',
          keyCompetencies: [
            'Matrix operations, determinants & dot products',
            'Vector spaces, basis, and transformations',
            'Partial derivatives, gradients & chain rule intuition',
            'Vectorized matrix computations with NumPy arrays',
          ],
          recommendedProject: {
            title: 'Matrix & Linear Transformation Visualizer',
            description: 'Implement a NumPy matrix computation and transformation visualizer.',
            techStack: ['Python', 'NumPy', 'Matplotlib'],
          },
          suggestedMilestone: {
            title: 'Complete Linear Algebra & Matrix Computing Drills',
            category: 'Academic',
            priority: 'High',
            estimatedTime: '3 weeks',
            actionType: 'Skill Milestone',
          },
        },
        {
          number: '03',
          title: 'Developer Tooling & Git Hygiene',
          tech: 'Git · GitHub · Linux CLI · VS Code & Environments',
          tag: 'Developer Tooling',
          icon: Terminal,
          description: 'Establish professional habits with Git branches, commit hygiene, virtual environments, and bash scripting.',
          keyCompetencies: [
            'Git branch workflows, rebasing, merge conflicts & PRs',
            'Linux bash command line navigation & file manipulation',
            'Python virtual environments (venv/conda) & package management',
            'Markdown documentation & structured GitHub READMEs',
          ],
          recommendedProject: {
            title: 'Curated Developer Script Vault on GitHub',
            description: 'Publish your first well-documented GitHub repository with clean commits and README.',
            techStack: ['Git', 'GitHub', 'Bash', 'Markdown'],
          },
          suggestedMilestone: {
            title: 'Publish 3 Verified Repositories to GitHub with Clean Commits',
            category: 'Project',
            priority: 'Medium',
            estimatedTime: '2 weeks',
            actionType: 'Build Project',
          },
        },
        {
          number: '04',
          title: 'Discrete Structures & Computational Logic',
          tech: 'Propositional Logic · Set Theory · Graph Basics · Proofs',
          tag: 'Academic Foundations',
          icon: Users,
          description: 'Strengthen mathematical logic with discrete structures and proofs to prepare for Data Structures in Year 2.',
          keyCompetencies: [
            'Boolean logic, truth tables & logical equivalences',
            'Sets, relations, functions & cardinality',
            'Mathematical induction & recurrence relations',
            'Basic graph terminology: vertices, edges, paths & cycles',
          ],
          recommendedProject: {
            title: 'Interactive Boolean Logic Simulator',
            description: 'Build a Python script that evaluates complex logic formulas and truth tables.',
            techStack: ['Python', 'Discrete Math'],
          },
          suggestedMilestone: {
            title: 'Score 85%+ in Discrete Math & Logic coursework',
            category: 'Academic',
            priority: 'Medium',
            estimatedTime: '4 weeks',
            actionType: 'Skill Milestone',
          },
        },
      ];
    }

    return [
      {
        number: '01',
        title: 'Core Programming Fundamentals',
        tech: 'Python / C++ · Functions · Memory & Types · Algorithmic Logic',
        tag: 'Foundational Coding',
        icon: Code,
        description: `Master core programming syntax, control flow, functions, memory allocation, and algorithmic problem-solving for ${goal}.`,
        keyCompetencies: [
          'Variable types, control structures & structured programming',
          'Modular function decomposition & unit testing basics',
          'Algorithmic problem-solving on arrays and strings',
          'Clean code principles, debugging & error handling',
        ],
        recommendedProject: {
          title: 'Algorithmic Tool Suite & Console Application',
          description: 'Build a modular console tool featuring data parsing, file persistence, and interactive user flows.',
          techStack: ['Python', 'pytest', 'CLI'],
        },
        suggestedMilestone: {
          title: 'Complete 30+ Core Programming Challenges with Unit Tests',
          category: 'Skill',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '02',
        title: 'Mathematical Foundations for Computing',
        tech: 'Discrete Mathematics · Linear Algebra · Calculus Basics',
        tag: 'Mathematics Core',
        icon: Binary,
        description: 'Establish the rigorous theoretical groundwork in discrete structures, propositional logic, and linear algebra.',
        keyCompetencies: [
          'Propositional & predicate logic, truth tables',
          'Matrix computations, dot products & systems of linear equations',
          'Set theory, functions, relations & proofs by induction',
          'Computational complexity fundamentals (Big-O overview)',
        ],
        recommendedProject: {
          title: 'Mathematical Logic & Matrix Calculator',
          description: 'Develop a computational script that solves matrix equations and evaluates logical expressions.',
          techStack: ['Python', 'NumPy', 'Math'],
        },
        suggestedMilestone: {
          title: 'Achieve Strong Academic Standing in Mathematics Coursework',
          category: 'Academic',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '03',
        title: 'Developer Environment & Git Hygiene',
        tech: 'Git · GitHub · Linux Terminal · Bash Scripting',
        tag: 'Developer Tooling',
        icon: Terminal,
        description: 'Build muscle memory with command-line environments, Linux file systems, Git branching, and GitHub workflows.',
        keyCompetencies: [
          'Linux CLI navigation, file permissions & piping',
          'Git commit hygiene, branching, merging & pull requests',
          'Configuring professional editor setups and extensions',
          'Automating simple developer tasks with shell scripts',
        ],
        recommendedProject: {
          title: 'Automated Developer Setup & Dotfiles Repository',
          description: 'Configure a personal GitHub dotfiles repository documenting your command-line environment.',
          techStack: ['Bash', 'Git', 'Linux'],
        },
        suggestedMilestone: {
          title: 'Establish Verifiable GitHub Activity with Clean Commits',
          category: 'Project',
          priority: 'Medium',
          estimatedTime: '2 weeks',
          actionType: 'Build Project',
        },
      },
      {
        number: '04',
        title: 'Academic Excellence & Professional Habits',
        tech: 'Study Strategy · Time Management · Tech Communities',
        tag: 'Academic Growth',
        icon: Users,
        description: `Set high GPA standards in Semester ${semester} and join student technical societies.`,
        keyCompetencies: [
          'Effective coursework planning and high-impact study routines',
          'Active participation in university tech clubs and hackathons',
          'Building strong peer study groups for technical collaboration',
          'Reading technical documentation and foundational CS articles',
        ],
        recommendedProject: {
          title: 'University Hackathon / Coding Contest Debut',
          description: 'Participate in your first on-campus competitive programming contest or hackathon.',
          techStack: ['C++', 'Python', 'Competitive Coding'],
        },
        suggestedMilestone: {
          title: 'Participate in First University Coding Competition or Hackathon',
          category: 'Career',
          priority: 'Medium',
          estimatedTime: '3 weeks',
          actionType: 'Apply Opportunity',
        },
      },
    ];
  }

  // STAGE 2: SEMESTER 3 & 4 (Sophomore Core Systems & Algorithms)
  if (sem <= 4) {
    return [
      {
        number: '01',
        title: 'Data Structures & Algorithmic Problem Solving',
        tech: 'Arrays · Trees · Graphs · Stacks · Queues · Big-O',
        tag: 'Core Algorithms',
        icon: Binary,
        description: `Master fundamental memory structures, graph traversals, and algorithmic complexity for ${goal}.`,
        keyCompetencies: [
          'Linked lists, binary search trees, heaps & hash maps',
          'Graph representations, BFS, DFS & topological sorting',
          'Time & space complexity analysis (Big-O notation)',
          'LeetCode Easy/Medium algorithmic problem solving',
        ],
        recommendedProject: {
          title: 'Custom Data Structures Library & Visualizer',
          description: 'Implement a comprehensive library of self-balancing trees, graphs, and priority queues.',
          techStack: ['Python', 'C++', 'Algorithms'],
        },
        suggestedMilestone: {
          title: 'Solve 60+ LeetCode Data Structure & Algorithm Problems',
          category: 'Skill',
          priority: 'High',
          estimatedTime: '4 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '02',
        title: 'Object-Oriented Design & Clean Architecture',
        tech: 'OOP · SOLID Principles · Design Patterns · Modularity',
        tag: 'Software Engineering',
        icon: Code,
        description: 'Learn object-oriented paradigms, encapsulation, design patterns, and clean modular codebases.',
        keyCompetencies: [
          'Class hierarchies, inheritance vs composition, and polymorphism',
          'SOLID software design principles for maintainable codebases',
          'Essential design patterns: Factory, Singleton, Strategy, Observer',
          'Modular architecture with interfaces and dependency injection',
        ],
        recommendedProject: {
          title: 'Modular Simulation Engine with Design Patterns',
          description: 'Architect a simulation platform utilizing OOP patterns and loose coupling.',
          techStack: ['Python/C++', 'Design Patterns', 'OOP'],
        },
        suggestedMilestone: {
          title: 'Build Test-Driven Object-Oriented Project with Tests',
          category: 'Project',
          priority: 'High',
          estimatedTime: '3 weeks',
          actionType: 'Build Project',
        },
      },
      {
        number: '03',
        title: 'Relational Databases & SQL Engineering',
        tech: 'PostgreSQL · SQL Normalization · Indexes · Transactions',
        tag: 'Database Architecture',
        icon: Database,
        description: 'Design robust relational schemas, write complex analytical SQL queries, and enforce ACID integrity.',
        keyCompetencies: [
          'Relational schema design, 3NF normalization & foreign keys',
          'Complex SQL: JOINs, GROUP BY, subqueries & window functions',
          'Indexing strategies (B-Tree, Hash) and query execution plans',
          'ACID transactions, concurrency control & data integrity',
        ],
        recommendedProject: {
          title: 'Academic Analytics Database with Complex SQL Queries',
          description: 'Design and populate a realistic relational database with automated seed scripts.',
          techStack: ['PostgreSQL', 'SQL', 'Docker'],
        },
        suggestedMilestone: {
          title: 'Master Advanced SQL Queries & Relational Schema Design',
          category: 'Skill',
          priority: 'Medium',
          estimatedTime: '2 weeks',
          actionType: 'Skill Milestone',
        },
      },
      {
        number: '04',
        title: 'Computer Systems, OS & Networking',
        tech: 'Linux OS · Processes & Threads · TCP/IP · Sockets',
        tag: 'Systems Architecture',
        icon: Terminal,
        description: 'Understand low-level architecture, processes, multithreading, virtual memory, and socket networking.',
        keyCompetencies: [
          'Process lifecycle, multithreading, concurrency & race conditions',
          'Virtual memory, paging, cache hierarchies & stack vs heap',
          'TCP/IP stack, sockets, HTTP/HTTPS protocols & DNS mechanics',
          'Linux system monitoring using top, htop, ps, netstat & lsof',
        ],
        recommendedProject: {
          title: 'Concurrent Client-Server Socket System',
          description: 'Implement a concurrent TCP client-server application handling simultaneous connections.',
          techStack: ['Python/C++', 'Sockets', 'Multithreading'],
        },
        suggestedMilestone: {
          title: 'Build Concurrent Client-Server Socket System',
          category: 'Project',
          priority: 'Medium',
          estimatedTime: '3 weeks',
          actionType: 'Build Project',
        },
      },
    ];
  }

  // STAGE 3 & 4 (Junior Specialization & Senior Capstone)
  if (track === 'fullstack') {
    return [
      {
        number: '01',
        title: 'Modern Web Architecture & React',
        tech: 'Next.js 15 · TypeScript · React Server Components',
        tag: 'Frontend Architecture',
        icon: Code,
        description: 'Architect scalable web user interfaces with Next.js App Router, streaming SSR, and type-safe state management.',
        keyCompetencies: ['React Server Components & streaming architectures', 'Zustand & TanStack Query for state synchronization', 'Accessible design tokens & Tailwind CSS styling', 'Core Web Vitals & performance optimization'],
        recommendedProject: { title: 'Real-Time Collaborative Web Workspace', description: 'Build a Next.js application with optimistic UI updates, WebSocket collaboration, and type-safe APIs.', techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'WebSockets'] },
        suggestedMilestone: { title: 'Build a Real-Time Collaborative Next.js App', category: 'Project', priority: 'High', estimatedTime: '3 weeks', actionType: 'Build Project' },
      },
      {
        number: '02',
        title: 'Distributed Backends & Databases',
        tech: 'PostgreSQL · Node.js · Redis · REST / GraphQL',
        tag: 'Backend Engineering',
        icon: Database,
        description: 'Design robust relational database schemas, complex SQL queries, index optimization, and Redis caching layers.',
        keyCompetencies: ['PostgreSQL relational schema modeling & indexing', 'Redis distributed caching, token bucket rate limiting', 'JWT authentication & role-based access control', 'RESTful API contracts with Zod validation'],
        recommendedProject: { title: 'High-Throughput Backend Microservice', description: 'Construct a secure Node.js backend with PostgreSQL pooler, Redis caching, and automated integration tests.', techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'] },
        suggestedMilestone: { title: 'Architect Scalable Backend with PostgreSQL & Redis', category: 'Skill', priority: 'High', estimatedTime: '2 weeks', actionType: 'Skill Milestone' },
      },
      {
        number: '03',
        title: 'Flagship Full-Stack SaaS Portfolio',
        tech: 'Next.js · Stripe · Docker · CI/CD Pipelines',
        tag: 'Flagship Systems',
        icon: FolderGit2,
        description: 'Ship an end-to-end commercial-grade web product complete with user authentication, Stripe billing, and cloud deployment.',
        keyCompetencies: ['Stripe subscription checkout & webhook handling', 'Automated CI/CD build & test workflows with GitHub Actions', 'Containerized production deployments on Vercel / Railway / AWS', 'Database migrations & zero-downtime releases'],
        recommendedProject: { title: 'Commercial Full-Stack SaaS with Live Payments', description: 'Deploy a live SaaS platform with auth, tenant isolation, and automated payment fulfillment.', techStack: ['Next.js', 'PostgreSQL', 'Stripe', 'Docker'] },
        suggestedMilestone: { title: 'Deploy Full-Stack SaaS with Stripe Integration', category: 'Project', priority: 'Medium', estimatedTime: '4 weeks', actionType: 'Build Project' },
      },
      {
        number: '04',
        title: 'System Design & Technical Interviews',
        tech: 'DSA Patterns · Distributed Systems · Technical CV',
        tag: 'Career Readiness',
        icon: Users,
        description: 'Master medium-hard algorithm problem patterns, distributed system design primers, and technical portfolio presentation.',
        keyCompetencies: ['75+ LeetCode DSA patterns: Trees, DP, Sliding Window, Graphs', 'System design fundamentals: Load balancers, CDNs, DB sharding', 'Production GitHub showcase with live demo links & documentation', 'Mock technical coding interviews & architectural whiteboard practice'],
        recommendedProject: { title: 'Distributed System Prototype: Rate Limiter & URL Engine', description: 'Build and document a distributed URL shortening service with Redis caching and analytic counters.', techStack: ['TypeScript', 'Redis', 'PostgreSQL'] },
        suggestedMilestone: { title: 'Complete 75+ DSA Problems & System Design Drills', category: 'Career', priority: 'Medium', estimatedTime: '3 weeks', actionType: 'Apply Opportunity' },
      },
    ];
  }

  // Default AI/ML track for Stage 3 & 4
  return [
    {
      number: '01',
      title: 'Applied Deep Learning & Vision',
      tech: 'PyTorch · CNNs · YOLOv8 · Transfer Learning',
      tag: 'Core AI Track',
      icon: Eye,
      description: `Master neural network architectures, computer vision feature representation, and transfer learning pipelines tailored for ${goal}.`,
      keyCompetencies: ['Convolutional Neural Networks & Feature Pyramids', 'Image Segmentation & Object Detection with YOLO', 'Transfer Learning using Pretrained PyTorch models', 'Inference optimization with ONNX / TensorRT runtime'],
      recommendedProject: { title: 'Real-Time Object Detection & Tracking System', description: 'Construct an end-to-end multi-stream camera detection pipeline using YOLOv8 with FastAPI inference endpoints.', techStack: ['Python', 'PyTorch', 'OpenCV', 'FastAPI'] },
      suggestedMilestone: { title: 'Build a Real-Time Object Detection System', category: 'Project', priority: 'High', estimatedTime: '4 weeks', actionType: 'Build Project' },
    },
    {
      number: '02',
      title: 'Algorithms & Mathematical Optimization',
      tech: 'Gradient Descent · Dynamic Programming · Graph Search',
      tag: 'Technical Coding',
      icon: Binary,
      description: 'Bridge computational complexity with linear algebra, automatic differentiation, and loss optimization for AI pipelines.',
      keyCompetencies: ['Matrix calculus, Jacobian tensors & autograd graph construction', 'Dynamic programming and tree traversal algorithms', 'Vectorized computing with NumPy & Tensor math', 'LeetCode Mediums: Graph search, BFS/DFS, Topo sort'],
      recommendedProject: { title: 'Custom Autograd & Neural Engine from Scratch', description: 'Implement a micro-autograd engine with backprop, computational graph visualization, and mini-batch SGD.', techStack: ['Python', 'NumPy', 'Graphviz'] },
      suggestedMilestone: { title: 'Master PyTorch & CNN Architectures', category: 'Skill', priority: 'High', estimatedTime: '3 weeks', actionType: 'Skill Milestone' },
    },
    {
      number: '03',
      title: 'Flagship AI Portfolio & MLOps',
      tech: 'Docker · FastAPI · Weights & Biases · HuggingFace',
      tag: 'Flagship Systems',
      icon: FolderGit2,
      description: 'Package, deploy, and benchmark production machine learning services with automated Docker containerization and caching.',
      keyCompetencies: ['Containerized model deployment using Docker & compose', 'Low-latency asynchronous REST inference endpoints', 'Experiment tracking & model artifact versioning', 'CI/CD automated regression tests for inference latency'],
      recommendedProject: { title: 'Production AI Inference Microservice', description: 'Deploy a resilient model inference service on cloud/Docker with caching, rate limiting, and health checks.', techStack: ['FastAPI', 'Docker', 'Redis', 'PyTorch'] },
      suggestedMilestone: { title: 'Deploy Production AI Microservice on Docker', category: 'Project', priority: 'Medium', estimatedTime: '3 weeks', actionType: 'Build Project' },
    },
    {
      number: '04',
      title: 'Industry Networking & Research Presence',
      tech: 'GitHub Portfolio · Open Source AI · CV Technical Prep',
      tag: 'Career Readiness',
      icon: Users,
      description: 'Position yourself for premier machine learning internships through verifiable open-source contributions and technical case studies.',
      keyCompetencies: ['Contributing code to open-source ML/CV repositories', 'Technical blogging on model architectures & benchmark results', 'Refining ATS-optimized CV targeting AI engineering internships', 'Behavioral & technical interview simulations'],
      recommendedProject: { title: 'Open Source AI Library Contribution', description: 'Submit verified pull requests, bug fixes, and documentation improvements to active open-source AI projects.', techStack: ['Git', 'GitHub', 'Python', 'CI/CD'] },
      suggestedMilestone: { title: 'Contribute to Open Source CV/ML Libraries', category: 'Career', priority: 'Medium', estimatedTime: '2 weeks', actionType: 'Apply Opportunity' },
    },
  ];
}
