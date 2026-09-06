import React from 'react';
import {
  Briefcase,
  Plus,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { ExperienceItem } from '../../types';

interface ExperienceRolesViewProps {
  experiences: ExperienceItem[];
  onBackToDashboard: () => void;
  onAddExperience: () => void;
}

export const ExperienceRolesView: React.FC<ExperienceRolesViewProps> = ({
  experiences,
  onBackToDashboard,
  onAddExperience,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Experience & Roles
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Document internships, research assistantships, and professional activities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-add-experience-header"
              onClick={onAddExperience}
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] hover:bg-[#1A237E] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:shadow-[0_4px_16px_rgba(40,53,147,0.2)] transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Experience</span>
            </button>
            <button
              id="btn-back-to-dashboard-experience"
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
      {/* 2. MAIN CONTENT: EMPTY STATE OR ROLES LIST               */}
      {/* ======================================================== */}
      {experiences.length === 0 ? (
        /* Empty State */
        <div
          id="experience-empty-state"
          className="rounded-2xl border border-[#8F9CFE]/80 bg-white px-6 py-12 sm:py-16 text-center shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            {/* Small-to-medium professional icon container */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE]/70 text-[#283593] shadow-xs mb-4">
              <Briefcase className="h-7 w-7" />
            </div>

            {/* Empty-state title */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2">
              No experience recorded yet
            </h2>

            {/* Empty-state description */}
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
              Add internships, campus roles, research assistantships, or other professional experiences to strengthen your profile.
            </p>

            {/* Primary CTA */}
            <button
              id="btn-add-first-role"
              onClick={onAddExperience}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#283593] hover:bg-[#1F297E] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-[0_6px_20px_rgba(40,53,147,0.28)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Role</span>
            </button>
          </div>
        </div>
      ) : (
        /* Rendered Roles List (when items exist) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="group rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE]/60">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#283593] transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate">
                        {exp.company}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {exp.employmentType}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{exp.period}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{exp.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
