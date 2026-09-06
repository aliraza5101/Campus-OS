import React from 'react';
import { GraduationCap } from 'lucide-react';
import { StudentUser } from '../../types';

interface SemesterJourneyCardProps {
  user: StudentUser;
  onViewAcademic?: () => void;
}

export const SemesterJourneyCard: React.FC<SemesterJourneyCardProps> = ({
  user,
  onViewAcademic,
}) => {
  const creditsCompleted = Number(user.creditsCompleted) || 72;
  const totalCredits = Number(user.totalCredits) || 134;
  const semester = Number(user.semester) || 5;
  const totalSemesters = Number(user.totalSemesters) || 8;
  const completedSemesters = Number(user.completedSemesters) || 4;

  const academicProgressPct = Math.min(
    100,
    Math.max(0, Math.round((creditsCompleted / (totalCredits || 1)) * 100))
  );

  return (
    <div
      id="card-semester-journey"
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 min-h-[168px] shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <GraduationCap className="h-4 w-4 text-[#283593]" />
            <span>Your Semester Journey</span>
          </div>
          <span className="text-[11px] font-semibold text-[#283593] bg-[#EEF2FF] border border-[#C7D2FE]/60 px-2 py-0.5 rounded-full">
            Semester {semester} of {totalSemesters}
          </span>
        </div>

        {/* Main Heading & Subtitle */}
        <h3 className="text-[14.5px] font-bold text-slate-900 mt-2 leading-snug">
          Semester {semester} of {totalSemesters}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          You're building your foundation for an AI career.
        </p>
      </div>

      {/* Progress Indicators & Quick Stats */}
      <div className="mt-4 pt-1">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Overall Academic Progress</span>
          <span className="font-bold text-slate-900">{academicProgressPct}%</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-3">
          <div
            className="h-full rounded-full bg-[#283593] transition-all duration-500"
            style={{ width: `${academicProgressPct}%` }}
          />
        </div>

        {/* Bottom Micro Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2 text-[10.5px] sm:text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
          <span>Current: <strong className="text-slate-800">Sem {semester}</strong></span>
          <span>Completed: <strong className="text-slate-800">{completedSemesters} Sems</strong></span>
          <span>Credits: <strong className="text-slate-800">{creditsCompleted}/{totalCredits}</strong></span>
        </div>
      </div>
    </div>
  );
};
