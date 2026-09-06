import React from 'react';
import { ArrowUpRight, Briefcase, Plus } from 'lucide-react';
import { ExperienceItem } from '../../types';

interface ExperienceCardProps {
  experiences: ExperienceItem[];
  onViewAll: () => void;
  onAddExperience: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experiences,
  onViewAll,
  onAddExperience,
}) => {
  return (
    <div
      id="card-experience"
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs min-h-[220px] transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Experience
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-experience-cta"
              onClick={onAddExperience}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#283593] hover:text-[#1F297E] transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Experience</span>
            </button>
            <button
              id="btn-view-experience"
              onClick={onViewAll}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition ml-2"
            >
              <span>View</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 mb-4">
          Your professional journey
        </p>

        {/* Content Area */}
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-[#FAFBFD] p-6 text-center">
            <Briefcase className="h-7 w-7 text-slate-300 mb-2" />
            <p className="text-xs text-slate-600 font-medium mb-2">
              No experience added yet.
            </p>
            <button
              onClick={onAddExperience}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#283593] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1F297E] transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Experience</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 text-xs shadow-2xs transition hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{exp.title}</p>
                  <p className="text-slate-600 font-medium">
                    {exp.company} • {exp.employmentType}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {exp.period} | {exp.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
