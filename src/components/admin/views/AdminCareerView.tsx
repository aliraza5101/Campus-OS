import React from 'react';
import {
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  PieChart,
  BarChart,
} from 'lucide-react';
import { CareerAnalyticsData } from '../../../types/admin';

interface AdminCareerViewProps {
  careerData: CareerAnalyticsData;
}

export const AdminCareerView: React.FC<AdminCareerViewProps> = ({ careerData }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Career Aspirations & Readiness
            </h2>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
              {careerData.institutionalReadinessAverages.overall}% Campus Avg
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Institutional breakdown of target career paths and 5-pillar employability benchmark.
          </p>
        </div>
      </div>

      {/* 5-Pillar Institutional Radar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Overall Readiness</span>
          <span className="text-2xl font-black text-[#283593] tracking-tight">
            {careerData.institutionalReadinessAverages.overall}%
          </span>
          <span className="text-[10.5px] text-emerald-600 block mt-1 font-semibold">
            +4.2% vs last term
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Pillar: Skills</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {careerData.institutionalReadinessAverages.skills}%
          </span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">Technical Stack</span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Pillar: Projects</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {careerData.institutionalReadinessAverages.projects}%
          </span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">Verified GitHub</span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Pillar: Experience</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {careerData.institutionalReadinessAverages.experience}%
          </span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">Internships</span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Pillar: Profile</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {careerData.institutionalReadinessAverages.profile}%
          </span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">Passport Bio</span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Pillar: Network</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {careerData.institutionalReadinessAverages.networking}%
          </span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">Mentors & Events</span>
        </div>
      </div>

      {/* Grid: Career Goals & Readiness Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Target Career Goal Distribution */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Career Goal Aspirations Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Declared student career target roles across all degrees.
          </p>

          <div className="space-y-3.5">
            {careerData.goalDistribution.map((goal) => (
              <div key={goal.role} className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 hover:border-[#283593] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{goal.role}</span>
                  <span className="font-bold text-slate-900">{goal.count} students ({goal.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${goal.percentage}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Readiness Tiers */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Institutional Employability Readiness Tiers
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Cohort segmentation by multi-dimensional readiness score.
          </p>

          <div className="space-y-4">
            {careerData.readinessTiers.map((tier) => (
              <div key={tier.tier} className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-4 hover:border-[#283593] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">{tier.tier}</span>
                  <span className="font-bold text-slate-900">{tier.count} Students ({tier.percentage}%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${tier.percentage}%`,
                      backgroundColor: tier.color,
                    }}
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
