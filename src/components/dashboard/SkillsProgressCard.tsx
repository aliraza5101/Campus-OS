import React from 'react';
import { ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SkillProgressItem } from '../../types';

interface SkillsProgressCardProps {
  skills: SkillProgressItem[];
  onViewAll: () => void;
}

export const SkillsProgressCard: React.FC<SkillsProgressCardProps> = ({
  skills,
  onViewAll,
}) => {
  return (
    <div
      id="card-skills-progress"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Skills Progress
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track the skills you're building for your career.
          </p>
        </div>

        <button
          id="btn-view-skills-progress"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
        >
          <span>View</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Skills Progress List */}
      <div className="space-y-3.5 mt-4">
        {skills.map((skill) => {
          return (
            <div
              key={skill.id}
              className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 shadow-2xs transition hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 truncate">{skill.name}</span>
                  {skill.verified && (
                    <span title="Verified in coursework">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#283593] shrink-0" />
                    </span>
                  )}
                  <span className="hidden xs:inline text-[10px] text-slate-400 font-normal shrink-0">
                    • {skill.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="rounded-md bg-slate-100 px-1.5 sm:px-2 py-0.5 text-[9.5px] sm:text-[10px] font-semibold text-slate-600">
                    {skill.level}
                  </span>
                  <span className="font-bold text-slate-900 text-xs w-8 sm:w-9 text-right">
                    {skill.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className="h-full rounded-full bg-[#283593] transition-all duration-500"
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
