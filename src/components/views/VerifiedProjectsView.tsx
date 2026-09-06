import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  ArrowLeft,
  Code2,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProjectItem } from '../../types';

interface VerifiedProjectsViewProps {
  projects: ProjectItem[];
  onBackToDashboard: () => void;
  onAddProject: () => void;
}

export const VerifiedProjectsView: React.FC<VerifiedProjectsViewProps> = ({
  projects,
  onBackToDashboard,
  onAddProject,
}) => {
  const [animateProgress, setAnimateProgress] = useState(false);

  // Trigger smooth progress bar animation on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Dynamically calculate project metrics from existing data
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => p.status === 'Completed' || (p.progress !== undefined && p.progress >= 100)
  ).length;
  const inProgressProjects = projects.filter(
    (p) => p.status !== 'Completed' && (p.progress === undefined || p.progress < 100)
  ).length;

  // Helper to select an appropriate subtle icon for known projects
  const getProjectIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('vision') || lower.includes('reid') || lower.includes('cv') || lower.includes('image')) {
      return (
        <Eye className="h-5 w-5 text-[#283593] transition-colors duration-200" />
      );
    }
    if (lower.includes('campus') || lower.includes('os') || lower.includes('system') || lower.includes('app')) {
      return (
        <Code2 className="h-5 w-5 text-[#283593] transition-colors duration-200" />
      );
    }
    return (
      <Layers className="h-5 w-5 text-[#283593] transition-colors duration-200" />
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Verified Projects
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Showcase your portfolio of technical artifacts, GitHub repositories, and AI deployments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-add-project-verified"
              onClick={onAddProject}
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] hover:bg-[#1A237E] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:shadow-[0_4px_16px_rgba(40,53,147,0.2)] transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Project</span>
            </button>
            <button
              id="btn-back-to-dashboard-projects"
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DYNAMIC PORTFOLIO SUMMARY                             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-[#8F9CFE]/80 bg-white p-3.5 sm:p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Total Projects
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {totalProjects}
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              in portfolio
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[#8F9CFE]/80 bg-white p-3.5 sm:p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700/80 block">
            Completed
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-800">
              {completedProjects}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline">
              verified
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[#8F9CFE]/80 bg-white p-3.5 sm:p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#283593]/80 block">
            In Progress
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#283593]">
              {inProgressProjects}
            </span>
            <span className="text-[11px] text-[#4338CA] font-medium hidden sm:inline">
              active development
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. VERIFIED PROJECT CARDS GRID                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {projects.map((proj, idx) => {
          const isCompleted = proj.status === 'Completed' || (proj.progress !== undefined && proj.progress >= 100);
          const currentProgress = proj.progress ?? (isCompleted ? 100 : 0);

          return (
            <div
              key={proj.id || idx}
              id={`project-card-${proj.id || idx}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
            >
              <div>
                {/* Card Header: Icon + Title + Status Badge */}
                <div className="flex items-start justify-between gap-3 pb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] border border-[#C7D2FE]/60 text-[#283593] group-hover:border-[#8F9CFE] group-hover:shadow-[0_0_12px_rgba(40,53,147,0.18)] transition-all duration-200">
                      {getProjectIcon(proj.title)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#283593] transition-colors">
                        {proj.title}
                      </h2>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-[#283593] shrink-0" />
                    )}
                    <span>{proj.status}</span>
                  </span>
                </div>

                {/* Project Description */}
                <p className="mt-2 text-sm sm:text-[14.5px] leading-relaxed text-slate-600 font-normal">
                  {proj.description}
                </p>

                {/* Technology Chips */}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {proj.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-lg bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/70 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar & Percentage Section */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {currentProgress}%
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-[#1A237E] via-[#283593] to-[#6366F1]'
                    }`}
                    style={{
                      width: animateProgress ? `${currentProgress}%` : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
