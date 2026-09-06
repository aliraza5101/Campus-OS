import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Plus,
  Code2,
  Brain,
  Eye,
  BarChart3,
  GitBranch,
  CheckCircle2,
  Layers,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { SkillProgressItem } from '../../types';

interface SkillsPortfolioViewProps {
  skills: SkillProgressItem[];
  onBackToDashboard: () => void;
  onUpdateSkills: () => void;
}

// Icon mapper for skills
const getSkillIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('python') || lower.includes('program')) return Code2;
  if (lower.includes('machine learning') || lower.includes('ai')) return Brain;
  if (lower.includes('computer vision') || lower.includes('vision')) return Eye;
  if (lower.includes('data analysis') || lower.includes('data')) return BarChart3;
  if (lower.includes('git') || lower.includes('github')) return GitBranch;
  return Cpu;
};

export const SkillsPortfolioView: React.FC<SkillsPortfolioViewProps> = ({
  skills = [],
  onBackToDashboard,
  onUpdateSkills,
}) => {
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Dynamically calculate overall progress average safely
  const totalPercentage = skills.reduce((acc, s) => acc + (s.percentage || 0), 0);
  const overallProgress = skills.length > 0 ? Math.round(totalPercentage / skills.length) : 0;
  const advancedCount = skills.filter((s) => s.level?.toLowerCase() === 'advanced').length;
  const verifiedCount = skills.filter((s) => s.verified).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Skills Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Track, verify, and expand technical competencies for AI roles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-manage-skills-header"
              onClick={onUpdateSkills}
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] hover:bg-[#1A237E] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:shadow-[0_4px_16px_rgba(40,53,147,0.2)] transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manage Skills</span>
            </button>
            <button
              id="btn-back-to-dashboard-skills"
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Stat Bar: Overall Skills Progress (Dynamically Calculated) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4"
      >
        {/* Metric 1: Overall Average */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">
              Overall Skills Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#283593] tracking-tight leading-none">
                {overallProgress}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                average proficiency
              </span>
            </div>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#283593]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: Tracked Skills */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">
              Competencies Tracked
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {skills.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                active technical skills
              </span>
            </div>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3: Verified / Advanced */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">
              Verified & Advanced
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight leading-none">
                {verifiedCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                of {skills.length} verified
              </span>
            </div>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {/* 3. Skills Grid (2-Column Desktop, 1-Column Mobile) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Technical Competencies
          </h2>
          <span className="text-xs font-medium text-slate-500">
            AI / Machine Learning Stack
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {skills.map((skill, index) => {
            const Icon = getSkillIcon(skill.name);
            const isAdvanced = skill.level?.toLowerCase() === 'advanced';

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 * index }}
                className="group relative flex flex-col justify-between rounded-xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-4.5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5"
              >
                <div>
                  {/* Top Row: Icon + Skill Name & Category + Level & Percentage Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Skill Icon */}
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/90 text-[#283593] shadow-2xs group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                        <Icon className="h-4.5 w-4.5" />
                      </span>

                      {/* Skill Name & Category */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-900 leading-snug group-hover:text-[#283593] transition-colors truncate">
                            {skill.name}
                          </h3>
                          {skill.verified && (
                            <span className="inline-flex items-center text-emerald-600 shrink-0" title="Verified Skill">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="inline-block text-xs font-medium text-slate-500 uppercase tracking-wide">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    {/* Level & Percentage Badge */}
                    <div className="shrink-0 flex flex-col items-end">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide ${
                          isAdvanced
                            ? 'bg-indigo-50 text-[#283593] border border-indigo-100'
                            : 'bg-slate-100 text-slate-700 border border-slate-200/70'
                        }`}
                      >
                        {skill.level.toUpperCase()} · {skill.percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Refined Progress Bar with Subtle Glow */}
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-medium text-slate-400">
                      Proficiency Level
                    </span>
                    <span className="font-bold text-slate-800">
                      {skill.percentage}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#283593] transition-all duration-700 ease-out"
                      style={{
                        width: animateProgress ? `${skill.percentage}%` : '0%',
                        boxShadow: '0 0 6px rgba(40, 53, 147, 0.3)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
