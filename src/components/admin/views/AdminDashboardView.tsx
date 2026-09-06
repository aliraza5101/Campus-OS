import React from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  FolderGit2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  PlatformTopStats,
  DirectoryStudent,
  ActivityLogItem,
} from '../../../types/admin';

interface AdminDashboardViewProps {
  adminName?: string;
  stats: PlatformTopStats;
  students: DirectoryStudent[];
  activityLogs: ActivityLogItem[];
  onNavigateTab: (tab: string) => void;
  onSelectStudent: (student: DirectoryStudent) => void;
  onOpenNewAnnouncement: () => void;
  onOpenNewOpportunity: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminName = 'Dr. Sarah Malik',
  stats,
  students,
  activityLogs,
  onNavigateTab,
  onSelectStudent,
  onOpenNewAnnouncement,
  onOpenNewOpportunity,
}) => {
  const atRiskStudents = students.filter(
    (s) => s.status === 'Needs Attention' || s.status === 'At Risk'
  );

  const totalStudents = stats.totalStudents ?? students.length ?? 0;
  const totalAdmins = stats.totalAdmins ?? 1;
  const totalUsers = totalStudents + totalAdmins;
  const activeStudents = stats.activeStudents ?? totalStudents;
  const inactiveStudents = Math.max(0, totalStudents - activeStudents);
  const activeRate = stats.activeRate ?? (totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 100);
  const onboardingRate = stats.onboardingCompletedRate ?? 100;
  const onboardingCompletedCount = Math.round((onboardingRate / 100) * totalStudents);
  const avgProjectsPerStudent = totalStudents > 0 ? (stats.totalProjects / totalStudents).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="font-extrabold text-[#283593]">{adminName}</span> 👋
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Platform Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor your student ecosystem, intelligence services, and institutional activity.
          </p>
        </div>

        {/* Quick Admin CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewOpportunity}
            className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] hover:shadow-[0_4px_16px_rgba(40,53,147,0.35)] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Top 6 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-[#283593] group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(40,53,147,0.25)] transition-all duration-300">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalStudents.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[10.5px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats.studentsGrowth}% active</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Students</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-300">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.activeStudents.toLocaleString()}
          </p>
          <p className="text-[10.5px] text-slate-400 font-medium mt-1">
            {stats.activeRate}% engagement rate
          </p>
        </div>

        {/* New Students */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">New Students</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.25)] transition-all duration-300">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.newStudentsThisMonth}
          </p>
          <p className="text-[10.5px] text-slate-400 font-medium mt-1">
            Joined this month
          </p>
        </div>

        {/* Onboarding Completed */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Onboarding</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(20,184,166,0.25)] transition-all duration-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.onboardingCompletedRate}%
          </p>
          <p className="text-[10.5px] text-teal-600 font-semibold mt-1">
            Passport activated
          </p>
        </div>

        {/* Students At Risk */}
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-xs transition-all duration-300 hover:border-rose-400 hover:shadow-[0_12px_28px_rgba(244,63,94,0.15)] hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-rose-800">Students At Risk</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] transition-all duration-300">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-900 tracking-tight">
            {stats.studentsAtRisk}
          </p>
          <p className="text-[10.5px] text-rose-600 font-semibold mt-1">
            Needs advisor follow-up
          </p>
        </div>

        {/* Active Opportunities */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Opportunities</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all duration-300">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.activeOpportunities}
          </p>
          <p className="text-[10.5px] text-purple-600 font-semibold mt-1">
            Internships & Research
          </p>
        </div>
      </div>

      {/* Main Grid: User Analytics & Institutional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: User Analytics & At-Risk Alert Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Overview Box */}
          <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  User Overview & Engagement
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Breakdown across platform roles, activity, and onboarding milestones.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('student')}
                className="text-xs font-bold text-[#283593] hover:underline flex items-center gap-1 transition"
              >
                <span>Manage Students</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Quick Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593] hover:shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Total Users</span>
                <span className="text-lg font-bold text-slate-900">{totalUsers}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{totalStudents} Std + {totalAdmins} Adm</span>
              </div>
              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593] hover:shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Active Users</span>
                <span className="text-lg font-bold text-slate-900">{activeStudents}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">{activeRate}% Active rate</span>
              </div>
              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593] hover:shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Inactive Users</span>
                <span className="text-lg font-bold text-slate-900">{inactiveStudents}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{inactiveStudents === 0 ? 'All Active' : `${inactiveStudents} Dormant`}</span>
              </div>
              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593] hover:shadow-2xs">
                <span className="text-[11px] text-slate-400 block font-medium">Onboarding Rate</span>
                <span className="text-lg font-bold text-slate-900">{onboardingRate}%</span>
                <span className="text-[10px] text-teal-600 font-semibold block mt-0.5">{onboardingCompletedCount} Completed</span>
              </div>
            </div>

            {/* Visual Ratio Bars */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Active vs Inactive Students</span>
                  <span className="text-slate-900">{activeRate}% Active ({activeStudents} / {totalStudents})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-[#283593]" style={{ width: `${activeRate}%` }} />
                  <div className="h-full bg-slate-300" style={{ width: `${100 - activeRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Student Onboarding Passport Completion</span>
                  <span className="text-slate-900">{onboardingRate}% Completed ({onboardingCompletedCount} / {totalStudents})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-teal-500" style={{ width: `${onboardingRate}%` }} />
                  <div className="h-full bg-slate-300" style={{ width: `${100 - onboardingRate}%` }} />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-teal-500" /> Completed ({onboardingRate}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-300" /> Remaining ({100 - onboardingRate}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* At-Risk Students Action Table */}
          <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 shadow-2xs">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Students Requiring Immediate Attention
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Low GPA, incomplete onboarding, or lagging career milestones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('student')}
                className="text-xs font-bold text-[#283593] hover:underline"
              >
                View All Directory
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10.5px] tracking-wider">
                    <th className="pb-2.5">Student</th>
                    <th className="pb-2.5">Program</th>
                    <th className="pb-2.5">Semester</th>
                    <th className="pb-2.5">CGPA</th>
                    <th className="pb-2.5">Readiness</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atRiskStudents.slice(0, 4).map((student) => (
                    <tr key={student.id} className="hover:bg-[#FAFBFD] transition">
                      <td className="py-3 font-bold text-slate-900">
                        {student.name}
                        <span className="block text-[10.5px] font-normal text-slate-400">
                          {student.email}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {student.program}
                      </td>
                      <td className="py-3 text-slate-600 font-semibold">
                        Sem {student.semester}
                      </td>
                      <td className="py-3 font-bold text-rose-600">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">
                            {student.readinessScore}%
                          </span>
                          <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${student.readinessScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            student.status === 'At Risk'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="rounded-lg bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 text-[11px] font-bold text-[#283593] hover:bg-[#EEF2FF] hover:border-[#283593] hover:shadow-[0_2px_8px_rgba(40,53,147,0.2)] transition active:scale-95"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Institutional Highlights & Activity Feed */}
        <div className="space-y-6">
          {/* Institutional Health Card */}
          <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Institutional Academic & Career Health
            </h3>

            <div className="space-y-3.5">
              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Campus Average CGPA</span>
                  <span className="font-bold text-slate-900">{stats.averageGpa.toFixed(2)} / 4.00</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(stats.averageGpa / 4.0) * 100}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Avg Career Readiness</span>
                  <span className="font-bold text-[#283593]">{stats.averageReadiness.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#283593]" style={{ width: `${stats.averageReadiness}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 transition hover:border-[#283593]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Total Verified Projects</span>
                  <span className="font-bold text-purple-600">{stats.totalProjects} Projects</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  Avg {avgProjectsPerStudent} technical projects per enrolled student.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => onNavigateTab('analytics')}
                className="font-bold text-[#283593] hover:underline"
              >
                Academic Analytics →
              </button>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="font-bold text-[#283593] hover:underline"
              >
                Career Analytics →
              </button>
            </div>
          </div>

          {/* Recent System Activity Logs */}
          <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Recent System Activity
              </h3>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 text-xs transition hover:border-[#283593]"
                >
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700">{log.actor}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="font-bold text-slate-900 leading-snug">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {log.target}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
