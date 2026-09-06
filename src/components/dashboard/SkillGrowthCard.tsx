import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { SkillGrowthMonth } from '../../types';

interface SkillGrowthCardProps {
  growthData: SkillGrowthMonth[];
  onViewSkills: () => void;
}

export const SkillGrowthCard: React.FC<SkillGrowthCardProps> = ({
  growthData,
  onViewSkills,
}) => {
  return (
    <div
      id="card-skill-growth"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Skill Growth
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your progress over the last 4 months
          </p>
        </div>

        <button
          id="btn-view-skill-growth"
          onClick={onViewSkills}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
        >
          <span>View</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chart Canvas Area */}
      <div className="mt-4 pt-1">
        <div className="space-y-3">
          {/* Y-Axis level indicators */}
          <div className="flex items-center gap-3">
            <span className="w-5 text-[11px] text-slate-400 text-right">50</span>
            <div className="flex-1 h-[1px] bg-slate-200/60" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 text-[11px] text-slate-400 text-right">38</span>
            <div className="flex-1 h-[1px] bg-slate-200/60" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 text-[11px] text-slate-400 text-right">25</span>
            <div className="flex-1 h-[1px] bg-slate-200/60" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 text-[11px] text-slate-400 text-right">13</span>
            <div className="flex-1 h-[1px] bg-slate-200/60" />
          </div>
        </div>

        {/* Bottom Bar Indicator Pills & Month Labels */}
        <div className="flex items-end justify-between pl-8 pr-2 mt-3 pt-2">
          {growthData.map((item) => {
            const heightPx = Math.max(12, Math.min(50, Math.round((item.points / 60) * 50)));

            return (
              <div key={item.month} className="flex flex-col items-center gap-2">
                <div
                  className="w-7 rounded-t-lg bg-[#283593] transition-all duration-500 shadow-xs hover:bg-[#1F297E]"
                  style={{ height: `${heightPx}px` }}
                  title={`${item.month}: ${item.points} points`}
                />
                <span className="text-[11px] text-slate-500 font-semibold">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
