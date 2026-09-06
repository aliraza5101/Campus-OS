import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Filter,
  Search,
  BookOpen,
} from 'lucide-react';
import { SkillAnalyticsData } from '../../../types/admin';

interface AdminSkillsViewProps {
  skillsData: SkillAnalyticsData;
}

export const AdminSkillsView: React.FC<AdminSkillsViewProps> = ({ skillsData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Programming', 'AI & Data', 'Web Dev', 'DevOps & Tools', 'Data'];

  const filteredSkills = skillsData.topSkills.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Institutional Skills & Competency Analytics
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593] shadow-2xs">
              {skillsData.topSkills.length} Core Tracked
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor verified competencies, student proficiency tiers, and industry skill gap alignment.
          </p>
        </div>
      </div>

      {/* Proficiency Distribution 4-card Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {skillsData.proficiencyDistribution.map((tier) => (
          <div
            key={tier.level}
            className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group"
          >
            <span className="text-xs text-slate-500 font-semibold block mb-1">{tier.level}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{tier.percentage}%</span>
              <span className="text-xs text-slate-400 font-medium">({tier.count} students)</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
              <div
                className="h-full bg-[#283593] rounded-full"
                style={{ width: `${tier.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Institutional Skill Gaps & Curriculum Recommendations */}
      <div className="rounded-2xl border border-rose-300 bg-white p-5 shadow-xs transition-all duration-300 hover:border-rose-500 hover:shadow-[0_12px_28px_rgba(244,63,94,0.1)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 shadow-2xs">
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Skill Gap Alert & Curriculum Recommendations
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Skills with high industry market demand but low student proficiency across current cohorts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-rose-50/40 text-slate-600 font-bold">
                <th className="py-3 px-3">Skill Deficit</th>
                <th className="py-3 px-3">Industry Demand</th>
                <th className="py-3 px-3">Current Student Rate</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Institutional Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillsData.institutionalSkillGaps.map((gap) => (
                <tr key={gap.skill} className="hover:bg-rose-50/20 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{gap.skill}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{gap.industryDemand}</td>
                  <td className="py-3 px-3 font-bold text-rose-600">{gap.studentProficiencyRate}%</td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        gap.gapSeverity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {gap.gapSeverity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{gap.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Tracked Skills Table */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs space-y-4 transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Student Skills & Verification Ratios
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Skills aggregate across {skillsData.topSkills.length} competencies.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill..."
              className="rounded-xl border border-[#8F9CFE]/50 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-[#283593] focus:shadow-[0_0_10px_rgba(40,53,147,0.15)] transition-all"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[#8F9CFE]/50 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none focus:border-[#283593] focus:bg-white transition-all font-medium text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                <th className="py-3 px-4">Skill</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Students Count</th>
                <th className="py-3 px-4">Verified %</th>
                <th className="py-3 px-4">Average Proficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkills.map((s) => (
                <tr key={s.name} className="hover:bg-[#FAFBFD] transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{s.category}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.studentCount} students</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{s.verifiedPercentage}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${s.verifiedPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                      {s.averageProficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
