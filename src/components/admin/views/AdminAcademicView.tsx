import React from 'react';
import { AcademicAnalyticsData } from '../../../types/admin';

interface AdminAcademicViewProps {
  academicData: AcademicAnalyticsData;
}

export const AdminAcademicView: React.FC<AdminAcademicViewProps> = ({ academicData }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Academic Performance
          </h2>
          <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
            Fall 2026 Active
          </span>
        </div>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Average CGPA</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {academicData.averageCgpa.toFixed(2)}
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Academic Progress</span>
          <span className="text-2xl font-black text-[#283593] tracking-tight">
            {academicData.averageProgress.toFixed(1)}%
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Students On Track</span>
          <span className="text-2xl font-black text-emerald-600 tracking-tight">
            {academicData.studentsOnTrack.toLocaleString()}
          </span>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4 shadow-xs transition-all duration-300 hover:border-amber-500 hover:shadow-[0_8px_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 group">
          <span className="text-xs text-amber-800 font-semibold block mb-1">Needs Attention</span>
          <span className="text-2xl font-black text-amber-900 tracking-tight">
            {academicData.studentsNeedingAttention}
          </span>
        </div>

        <div className="rounded-2xl border border-rose-300 bg-rose-50/40 p-4 shadow-xs transition-all duration-300 hover:border-rose-500 hover:shadow-[0_8px_20px_rgba(244,63,94,0.15)] hover:-translate-y-0.5 group">
          <span className="text-xs text-rose-800 font-semibold block mb-1">Students At Risk</span>
          <span className="text-2xl font-black text-rose-900 tracking-tight">
            {academicData.studentsAtRisk}
          </span>
        </div>
      </div>

      {/* Grid: Semester Cohorts & Department Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Progression Distribution */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Semester Cohort Distribution & GPA
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Total active students enrolled per semester with class average CGPA.
          </p>

          <div className="space-y-3">
            {academicData.semesterDistribution.map((sem) => (
              <div key={sem.semester} className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 hover:border-[#283593] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Semester {sem.semester}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">{sem.count} students</span>
                    <span className="font-bold text-emerald-600">{sem.avgGpa.toFixed(2)} GPA</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#283593] rounded-full"
                    style={{ width: `${(sem.count / 200) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Standing & Retention Rates */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Department Performance & Retention
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Academic standing across computing and AI degree offerings.
          </p>

          <div className="space-y-3.5">
            {academicData.departmentStats.map((dept) => (
              <div key={dept.department} className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3.5 hover:border-[#283593] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">{dept.department}</span>
                  <span className="font-bold text-emerald-600">{dept.avgGpa.toFixed(2)} Avg GPA</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span className="font-medium">{dept.studentsCount} Students Enrolled</span>
                  <span className="text-slate-700 font-semibold">{dept.retentionRate}% Retention Rate</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${dept.retentionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
