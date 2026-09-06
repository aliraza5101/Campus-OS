import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  CircleDot,
  Circle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Clock,
  Check,
  Printer,
} from 'lucide-react';
import { StudentUser, SemesterDetail } from '../../types';
import { printInstitutionalPDF } from '../../utils/exportUtils';

interface AcademicProgressViewProps {
  user: StudentUser;
  semesters: SemesterDetail[];
  onBackToDashboard: () => void;
}

export const AcademicProgressView: React.FC<AcademicProgressViewProps> = ({
  user,
  semesters = [],
  onBackToDashboard,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Dynamically calculate Degree Completion Progress
  const targetProgress = Math.min(
    100,
    Math.max(
      0,
      user.totalCredits > 0
        ? Math.round(((user.creditsCompleted || 0) / user.totalCredits) * 100)
        : user.totalSemesters > 0
        ? Math.round(((user.completedSemesters || 0) / user.totalSemesters) * 100)
        : 60
    )
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(targetProgress);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetProgress]);

  // SVG Circular Ring calculations for Degree Completion
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Derive dynamic journey status statistics
  const completedCount = semesters.filter((s) => s.status === 'completed').length;
  const currentSemester = semesters.find((s) => s.status === 'current')?.semester || user.semester || 5;
  const upcomingCount = semesters.filter((s) => s.status === 'upcoming').length;

  const handlePrintTranscript = () => {
    const headers = ['Semester', 'Status', 'Term SGPA', 'Courses Completed', 'Status Overview'];
    const rows: (string | number)[][] = semesters.map((sem) => [
      `Semester ${sem.semester}`,
      sem.status === 'completed' ? 'Completed' : sem.status === 'current' ? 'Active / In Progress' : 'Upcoming',
      sem.gpa ? `${sem.gpa.toFixed(2)} SGPA` : 'N/A',
      sem.coursesCount ? `${sem.coursesCount} Courses` : '5 Courses',
      sem.status === 'completed' ? 'Credits Verified' : sem.status === 'current' ? 'Registered Term' : 'Planned Curriculum',
    ]);

    printInstitutionalPDF({
      title: `${user.name} - Academic Transcript Report`,
      category: `Degree: ${user.degree}`,
      recordsCount: semesters.length,
      lastGenerated: new Date().toLocaleTimeString(),
      format: 'PDF / Transcript',
      description: `University: ${user.university || 'NUCES'} | Current Semester: ${user.semester || 5} | Cumulative GPA: ${(Number(user.gpa) || 3.82).toFixed(2)} | Academic Standing: ${user.academicStanding || "Dean's List"}`,
      dataHeaders: headers,
      dataRows: rows,
    });
  };

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
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Academic Progress
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Curriculum roadmap, semester transcripts, credit milestones, and academic standing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintTranscript}
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] hover:bg-[#1F297E] text-white px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-200" />
              <span>Export Transcript (PDF)</span>
            </button>
            <button
              id="btn-back-to-dashboard-academic"
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards: 4 Academic Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Cumulative GPA */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="group rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs sm:text-[13px] font-medium text-slate-500">
                Cumulative GPA
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <Check className="h-3 w-3" />
                <span>Good Standing</span>
              </span>
            </div>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {(Number(user.gpa) || 3.82).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Academic Standing</span>
            <span className="font-semibold text-[#283593]">Top 15% in class</span>
          </div>
        </motion.div>

        {/* Metric 2: Current Semester */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="group rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs sm:text-[13px] font-medium text-slate-500">
                Current Semester
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-[#283593]">
                {(user.semester || 1) <= 2 ? 'Freshman Year' : (user.semester || 1) <= 4 ? 'Sophomore Year' : (user.semester || 1) <= 6 ? 'Junior Year' : 'Senior Year'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {user.semester}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {user.totalSemesters}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Progress Status</span>
            <span className="font-semibold text-slate-700">Semester {user.semester || 1} in progress</span>
          </div>
        </motion.div>

        {/* Metric 3: Earned Credits */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="group rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs sm:text-[13px] font-medium text-slate-500">
                Earned Credits
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {Math.max(0, (user.totalCredits || 130) - (user.creditsCompleted || 0))} remaining
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {user.creditsCompleted}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {user.totalCredits}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Milestone</span>
            <span className="font-semibold text-[#283593]">Degree Credit Track</span>
          </div>
        </motion.div>

        {/* Metric 4: Degree Completion (Animated Progress Ring) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="group rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5 flex items-center justify-between"
        >
          <div className="min-w-0 pr-2">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 block mb-1">
              Degree Completion
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#283593] tracking-tight leading-none">
                {targetProgress}%
              </span>
            </div>
            <p className="text-[12px] text-slate-500 font-medium mt-2">
              On graduation track
            </p>
          </div>

          {/* SVG Circular Ring Indicator */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 96 96">
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                className="text-[#283593]"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800">
              {targetProgress}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. Academic Journey Progression Rail (Point 18) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Academic Journey Timeline
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
              Visual progression across all 8 undergraduate semesters.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FAFBFD] border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Check className="h-3 w-3" /> {completedCount} Completed
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[#283593] font-semibold">
              Semester {currentSemester} Current
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">
              {upcomingCount} Upcoming
            </span>
          </div>
        </div>

        {/* Responsive Progression Rail */}
        <div className="overflow-x-auto pb-1 pt-2">
          <div className="min-w-[620px] flex items-center justify-between relative px-2">
            {/* Connecting Track Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${(completedCount / (semesters.length - 1)) * 100}%` }}
              />
            </div>

            {/* Semester Milestone Dots */}
            {semesters.map((sem) => {
              const isCompleted = sem.status === 'completed';
              const isCurrent = sem.status === 'current';
              const isUpcoming = sem.status === 'upcoming';

              return (
                <div
                  key={sem.semester}
                  className="relative z-10 flex flex-col items-center group cursor-default"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 border-2 ${
                      isCurrent
                        ? 'bg-[#283593] border-white text-white shadow-md shadow-indigo-900/30 ring-3 ring-[#283593]/25 scale-110'
                        : isCompleted
                        ? 'bg-emerald-600 border-white text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    ) : isCurrent ? (
                      <span className="text-xs font-extrabold">S{sem.semester}</span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        {sem.semester}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs block leading-tight ${
                        isCurrent
                          ? 'font-bold text-[#283593]'
                          : isCompleted
                          ? 'font-semibold text-slate-800'
                          : 'font-medium text-slate-400'
                      }`}
                    >
                      Sem {sem.semester}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-medium block">
                      {isCompleted && sem.gpa ? `GPA ${sem.gpa.toFixed(2)}` : isCurrent ? 'Active' : 'Planned'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 4. Semester Breakdown Detailed List */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.24 }}
        className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Semester Breakdown
            </h2>
            <p className="text-[13px] text-slate-500 font-normal mt-0.5">
              Curriculum progression and academic transcripts across all 8 terms.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto">
            BS Artificial Intelligence • 132 Credit Hours
          </span>
        </div>

        {/* Semester Cards List */}
        <div className="space-y-2.5">
          {semesters.map((sem, index) => {
            const isCompleted = sem.status === 'completed';
            const isCurrent = sem.status === 'current';
            const isUpcoming = sem.status === 'upcoming';

            return (
              <motion.div
                key={sem.semester}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.03 * index }}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  isCurrent
                    ? 'border border-[#283593]/60 bg-[#F6F8FF] shadow-xs shadow-indigo-950/5'
                    : isCompleted
                    ? 'border border-slate-200/80 bg-white shadow-2xs hover:border-[#283593]/40 hover:shadow-xs'
                    : 'border border-slate-200/60 bg-[#FAFBFD] shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Left Side: Tag + Semester Title & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Semester Tag */}
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-[#283593] text-white shadow-2xs'
                        : isCompleted
                        ? 'bg-slate-100 border border-slate-200 text-[#283593] group-hover:bg-[#EEF2FF]'
                        : 'bg-slate-100 border border-slate-200 text-slate-400'
                    }`}
                  >
                    S{sem.semester}
                  </span>

                  {/* Title & Metadata */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[15px] font-semibold leading-snug ${
                          isCurrent ? 'text-[#283593]' : 'text-slate-900'
                        }`}
                      >
                        Semester {sem.semester}
                      </h3>
                      {isCurrent && (
                        <span className="hidden sm:inline-flex items-center rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold text-[#283593]">
                          Active Term
                        </span>
                      )}
                    </div>

                    {/* Metadata line with Scannable GPA */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                      {isCompleted && (
                        <>
                          <span className="font-medium text-emerald-700">
                            Completed
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            GPA{' '}
                            <strong className="text-slate-900 font-bold text-[13px]">
                              {sem.gpa?.toFixed(2)}
                            </strong>
                          </span>
                          {sem.coursesCount && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">
                                {sem.coursesCount} Courses
                              </span>
                            </>
                          )}
                        </>
                      )}

                      {isCurrent && (
                        <>
                          <span className="font-medium text-[#283593]">
                            In Progress (Active)
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            Current Target GPA{' '}
                            <strong className="text-[#283593] font-bold text-[13px]">
                              {(Number(user.gpa) || 3.82).toFixed(2)}
                            </strong>
                          </span>
                          {sem.coursesCount && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 font-medium">
                                {sem.coursesCount} Enrolled Courses
                              </span>
                            </>
                          )}
                        </>
                      )}

                      {isUpcoming && (
                        <>
                          <span className="font-medium text-slate-400">
                            Upcoming Term
                          </span>
                          {sem.coursesCount && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">
                                {sem.coursesCount} Planned Courses
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Consistent Status Badges (Point 9) */}
                <div className="self-start sm:self-center shrink-0">
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1 text-[11.5px] font-semibold text-emerald-700">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      <span>COMPLETED</span>
                    </span>
                  )}

                  {isCurrent && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#283593] px-3 py-1 text-[11.5px] font-semibold text-white shadow-2xs shadow-indigo-950/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      <span>CURRENT</span>
                    </span>
                  )}

                  {isUpcoming && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-3 py-1 text-[11.5px] font-medium text-slate-500">
                      <Circle className="h-2.5 w-2.5 text-slate-400" />
                      <span>UPCOMING</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
