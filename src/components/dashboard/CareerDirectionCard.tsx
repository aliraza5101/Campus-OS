import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { StudentUser } from '../../types';

interface CareerDirectionCardProps {
  user: StudentUser;
  onViewRoadmap: () => void;
}

export const CareerDirectionCard: React.FC<CareerDirectionCardProps> = ({
  user,
  onViewRoadmap,
}) => {
  const goalProgress = 58;

  return (
    <div
      id="card-career-direction"
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 min-h-[168px] shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <Target className="h-4 w-4 text-[#283593]" />
            <span>Your Career Direction</span>
          </div>
          <span className="text-[11px] font-semibold text-[#283593] bg-[#EEF2FF] border border-[#C7D2FE]/60 px-2.5 py-0.5 rounded-full">
            On Track
          </span>
        </div>

        {/* Career Goal Title */}
        <h3 className="text-[14.5px] font-bold text-slate-900 mt-2 leading-snug">
          {user.careerGoal}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Your current roadmap is aligned with your career goal.
        </p>
      </div>

      {/* Progress & Action CTA */}
      <div className="mt-4 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Goal Progress</span>
            <span className="font-bold text-slate-900">{goalProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full bg-[#283593] transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* View Roadmap Action Button */}
        <button
          id="btn-view-career-roadmap"
          onClick={onViewRoadmap}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#283593] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1F297E] active:scale-[0.98] w-full sm:w-auto"
        >
          <span>View Career Roadmap</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
