import React from 'react';
import {
  Briefcase,
  Building,
  Star,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';
import { ExperienceAnalyticsData } from '../../../types/admin';

interface AdminExperienceViewProps {
  experienceData: ExperienceAnalyticsData;
}

export const AdminExperienceView: React.FC<AdminExperienceViewProps> = ({ experienceData }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Experience & Internship Analytics
            </h2>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
              {experienceData.studentsWithExperienceRate}% Experience Rate
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Industry internships, research fellowships, freelance projects, and top hiring partner engagement.
          </p>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Experiences Recorded</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">{experienceData.totalExperiences}</span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">
            Across {experienceData.categoryCounts.internships} internships & {experienceData.categoryCounts.research} research posts
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Students with Verified Experience</span>
          <span className="text-2xl font-black text-emerald-600 tracking-tight">{experienceData.studentsWithExperienceRate}%</span>
          <span className="text-[10.5px] text-emerald-600 block mt-1 font-semibold">
            {experienceData.studentsWithExperienceRate}% of enrolled student body
          </span>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4 shadow-xs transition-all duration-300 hover:border-amber-500 hover:shadow-[0_8px_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 group">
          <span className="text-xs text-amber-800 font-semibold block mb-1">Students Needing First Internship</span>
          <span className="text-2xl font-black text-amber-900 tracking-tight">{experienceData.studentsWithoutExperienceCount}</span>
          <span className="text-[10.5px] text-amber-700 block mt-1 font-semibold">
            Target for Fall Career Fair
          </span>
        </div>
      </div>

      {/* Categories Grid & Top Hiring Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Experience Type Breakdown */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Experience Category Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Total count of experiential learning entries.
          </p>

          <div className="space-y-3">
            {[
              { label: 'Industry Internships', count: experienceData.categoryCounts.internships, color: '#283593' },
              { label: 'Academic & Lab Research', count: experienceData.categoryCounts.research, color: '#10B981' },
              { label: 'Freelance & Contract Work', count: experienceData.categoryCounts.freelance, color: '#F59E0B' },
              { label: 'Campus Leadership & Societies', count: experienceData.categoryCounts.leadership, color: '#8B5CF6' },
              { label: 'Hackathons & Competitions', count: experienceData.categoryCounts.hackathons, color: '#EC4899' },
              { label: 'Volunteer & Community Service', count: experienceData.categoryCounts.volunteer, color: '#06B6D4' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 hover:border-[#283593] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.count / 400) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top Hiring Partners */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Top Hiring & Placement Partners
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Organizations actively employing CampusOS student interns and graduates.
          </p>

          <div className="space-y-3">
            {experienceData.topHiringPartners.map((partner) => (
              <div
                key={partner.company}
                className="flex items-center justify-between rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 text-xs hover:border-[#283593] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#283593] font-bold border border-indigo-100">
                    {partner.company[0]}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{partner.company}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{partner.industry}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    {partner.activeStudentsCount} Students
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-600 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{partner.rating} / 5.0</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
