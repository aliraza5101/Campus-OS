import React from 'react';
import { Target, TrendingUp, Sparkles } from 'lucide-react';
import { CareerReadinessBreakdown } from '../../types';

interface CareerReadinessCardProps {
  data: CareerReadinessBreakdown;
  onExploreGoals?: () => void;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  data,
  onExploreGoals,
}) => {
  const metrics = [
    { label: 'Skills', value: data.skills },
    { label: 'Projects', value: data.projects },
    { label: 'Experience', value: data.experience },
    { label: 'Profile', value: data.profile },
    { label: 'Networking', value: data.networking },
  ];

  return (
    <div
      id="card-career-readiness"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
            <Target className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Career Readiness
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#283593] border border-[#C7D2FE]/60">
          <TrendingUp className="h-3 w-3" />
          <span>Strong Progress</span>
        </span>
      </div>

      {/* Main Big Score */}
      <div className="my-4 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Overall Readiness Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {data.overall}%
            </span>
            <span className="text-xs text-slate-500 font-medium">ready for AI roles</span>
          </div>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#283593] text-white shadow-xs">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="space-y-2.5">
        {metrics.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-2.5 shadow-2xs hover:border-[#283593] transition">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">{item.label}</span>
              <span className="font-bold text-slate-800">{item.value}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#283593] transition-all duration-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
