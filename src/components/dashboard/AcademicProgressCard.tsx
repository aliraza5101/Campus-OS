import React from 'react';
import { ArrowUpRight, GraduationCap, CheckCircle2, CircleDot, Circle } from 'lucide-react';
import { StudentUser, SemesterDetail } from '../../types';

interface AcademicProgressCardProps {
  user: StudentUser;
  semesters: SemesterDetail[];
  onViewAll: () => void;
}

export const AcademicProgressCard: React.FC<AcademicProgressCardProps> = ({
  user,
  semesters,
  onViewAll,
}) => {
  return (
    <div
      id="card-academic-progress"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Academic Progress
          </h3>
        </div>
        <button
          id="btn-view-academic-progress"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
        >
          <span>View</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 4 Key Academic Metric Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 my-4">
        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-2.5 sm:p-3 text-center sm:text-left shadow-2xs hover:border-[#283593] hover:bg-[#F6F8FF] transition">
          <span className="text-[10.5px] sm:text-[11px] text-slate-400 block mb-0.5">Current GPA</span>
          <span className="text-sm sm:text-base font-bold text-slate-900">{(typeof user.gpa === 'number' ? user.gpa : Number(user.gpa) || 3.82).toFixed(2)}</span>
          <span className="text-[9.5px] sm:text-[10px] text-[#283593] block mt-0.5 font-medium">Top 15% in class</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-2.5 sm:p-3 text-center sm:text-left shadow-2xs hover:border-[#283593] hover:bg-[#F6F8FF] transition">
          <span className="text-[10.5px] sm:text-[11px] text-slate-400 block mb-0.5">Semester</span>
          <span className="text-sm sm:text-base font-bold text-slate-900">{user.semester || 5} <span className="text-[11px] sm:text-xs text-slate-400 font-normal">/ {user.totalSemesters || 8}</span></span>
          <span className="text-[9.5px] sm:text-[10px] text-slate-500 block mt-0.5 font-medium">Junior Year</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-2.5 sm:p-3 text-center sm:text-left shadow-2xs hover:border-[#283593] hover:bg-[#F6F8FF] transition">
          <span className="text-[10.5px] sm:text-[11px] text-slate-400 block mb-0.5">Credits Completed</span>
          <span className="text-sm sm:text-base font-bold text-slate-900">{user.creditsCompleted || 72} <span className="text-[11px] sm:text-xs text-slate-400 font-normal">/ {user.totalCredits || 134}</span></span>
          <span className="text-[9.5px] sm:text-[10px] text-[#283593] block mt-0.5 font-medium">59% of degree</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-2.5 sm:p-3 text-center sm:text-left shadow-2xs hover:border-[#283593] hover:bg-[#F6F8FF] transition">
          <span className="text-[10.5px] sm:text-[11px] text-slate-400 block mb-0.5">Academic Standing</span>
          <span className="text-sm sm:text-base font-bold text-slate-900">{user.academicStanding || "Dean's List"}</span>
          <span className="text-[9.5px] sm:text-[10px] text-[#283593] block mt-0.5 font-medium">Clear standing</span>
        </div>
      </div>

      {/* Semester Progress Step Timeline */}
      <div className="pt-2">
        <p className="text-xs font-medium text-slate-600 mb-2.5">
          Degree Roadmap Timeline
        </p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 sm:gap-2">
          {semesters.map((sem) => {
            const isCompleted = sem.status === 'completed';
            const isCurrent = sem.status === 'current';

            return (
              <div
                key={sem.semester}
                className={`flex flex-col items-center justify-between rounded-xl p-2 sm:p-2.5 text-center transition border shadow-2xs ${
                  isCurrent
                    ? 'border-[#283593] bg-[#EEF2FF] shadow-xs'
                    : isCompleted
                    ? 'border-slate-200 bg-white hover:border-[#283593]/60'
                    : 'border-slate-200 bg-slate-50/70 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#283593]" />
                  )}
                  {isCurrent && (
                    <CircleDot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#283593] animate-pulse" />
                  )}
                  {!isCompleted && !isCurrent && (
                    <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300" />
                  )}
                </div>

                <span
                  className={`text-[10px] sm:text-[11px] font-bold ${
                    isCurrent
                      ? 'text-[#283593]'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  Sem {sem.semester}
                </span>

                <span
                  className={`text-[8.5px] sm:text-[9.5px] mt-0.5 ${
                    isCurrent
                      ? 'font-bold text-[#283593]'
                      : isCompleted
                      ? 'text-[#283593] font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? 'Done' : isCurrent ? 'Current' : 'Upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
