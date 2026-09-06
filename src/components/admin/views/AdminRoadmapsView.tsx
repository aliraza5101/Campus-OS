import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Edit2,
  FileCheck2,
} from 'lucide-react';
import { RoadmapAnalyticsData } from '../../../types/admin';

interface AdminRoadmapsViewProps {
  roadmapData: RoadmapAnalyticsData;
}

export const AdminRoadmapsView: React.FC<AdminRoadmapsViewProps> = ({ roadmapData }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Institutional Career Roadmaps & Tracks
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593] shadow-2xs">
              {roadmapData.roadmapTemplates.length} Active Curricula
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Standardized semester-by-semester milestones for high-demand engineering and AI roles.
          </p>
        </div>

        <button
          onClick={() => showToast('Opened Create Roadmap Track modal (Simulated)')}
          className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] hover:shadow-[0_4px_16px_rgba(40,53,147,0.25)] transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Roadmap Track</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Enrolled in Roadmaps</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">{roadmapData.activeRoadmaps}</span>
          <span className="text-[10.5px] text-emerald-600 block mt-1 font-semibold">
            78.5% of student body
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Completed Tracks</span>
          <span className="text-2xl font-black text-emerald-600 tracking-tight">{roadmapData.completedRoadmaps}</span>
          <span className="text-[10.5px] text-emerald-600 block mt-1 font-semibold">
            Senior graduates
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Avg Completion Rate</span>
          <span className="text-2xl font-black text-[#283593] tracking-tight">{roadmapData.avgCompletionRate}%</span>
          <span className="text-[10.5px] text-[#283593] block mt-1 font-semibold">
            Across active tracks
          </span>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4 shadow-xs transition-all duration-300 hover:border-amber-500 hover:shadow-[0_8px_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 group">
          <span className="text-xs text-amber-800 font-semibold block mb-1">Without Roadmap</span>
          <span className="text-2xl font-black text-amber-900 tracking-tight">{roadmapData.studentsWithoutRoadmaps}</span>
          <span className="text-[10.5px] text-amber-700 block mt-1 font-semibold">
            Freshman onboarding
          </span>
        </div>
      </div>

      {/* Roadmap Templates Table */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white shadow-xs overflow-hidden transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Standardized University Roadmap Tracks
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Curated milestone paths assigned to enrolled students.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                <th className="py-3.5 px-4">Track Title</th>
                <th className="py-3.5 px-4">Target Career Role</th>
                <th className="py-3.5 px-4">Milestones</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
                <th className="py-3.5 px-4">Average Progress</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roadmapData.roadmapTemplates.map((rd) => (
                <tr key={rd.id} className="hover:bg-[#FAFBFD] transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{rd.title}</td>
                  <td className="py-3.5 px-4 text-[#283593] font-semibold">{rd.targetRole}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{rd.totalMilestones} Steps</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{rd.enrolledStudents} students</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{rd.avgProgress}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#283593] rounded-full"
                          style={{ width: `${rd.avgProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        rd.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rd.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => showToast(`Opening editor for ${rd.title} (Demo)`)}
                      className="rounded-lg bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 text-[11px] font-bold text-[#283593] hover:bg-[#283593] hover:text-white transition-all cursor-pointer"
                    >
                      Review Track
                    </button>
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
