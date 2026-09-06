import React, { useState } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Github,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { ProjectAnalyticsData } from '../../../types/admin';

interface AdminProjectsViewProps {
  projectsData: ProjectAnalyticsData;
}

export const AdminProjectsView: React.FC<AdminProjectsViewProps> = ({ projectsData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProjects = projectsData.recentFeaturedProjects.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category.includes(selectedCategory);
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Projects & Repository Portfolio
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593] shadow-2xs">
              {projectsData.totalProjects} Total Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Track student open-source software, AI models, capstone repositories, and GitHub links.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Projects</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">{projectsData.totalProjects}</span>
          <span className="text-[10.5px] text-slate-400 block mt-1 font-medium">
            Avg {projectsData.avgProjectsPerStudent} per student
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Completed</span>
          <span className="text-2xl font-black text-emerald-600 tracking-tight">{projectsData.completed}</span>
          <span className="text-[10.5px] text-emerald-600 block mt-1 font-semibold">
            61.7% Finished
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">In Progress</span>
          <span className="text-2xl font-black text-[#283593] tracking-tight">{projectsData.inProgress}</span>
          <span className="text-[10.5px] text-[#283593] block mt-1 font-semibold">
            33.7% Active Build
          </span>
        </div>

        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Planned / Proposal</span>
          <span className="text-2xl font-black text-amber-600 tracking-tight">{projectsData.planned}</span>
          <span className="text-[10.5px] text-amber-600 block mt-1 font-semibold">
            4.5% Capstone Drafts
          </span>
        </div>
      </div>

      {/* Category Breakdown & Featured Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Category Distribution */}
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Projects by Domain
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Domain breakdown of student technical work.
          </p>

          <div className="space-y-3">
            {projectsData.categoryDistribution.map((cat) => (
              <div key={cat.category} className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-3 hover:border-[#283593] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{cat.category}</span>
                  <span className="font-bold text-slate-900">{cat.count} ({cat.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#283593] rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Featured Projects Directory */}
        <div className="lg:col-span-2 rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs space-y-4 transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Verified Student Repositories
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Direct portfolio audit with code links.
              </p>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, student, or stack..."
              className="rounded-xl border border-[#8F9CFE]/50 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-[#283593] focus:shadow-[0_0_10px_rgba(40,53,147,0.15)] transition-all"
            />
          </div>

          <div className="space-y-3">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-4 text-xs space-y-2 hover:border-[#283593] hover:shadow-[0_6px_16px_rgba(40,53,147,0.08)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{proj.title}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {proj.status} ({proj.progress}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>
                    Student: <strong className="text-slate-800">{proj.studentName}</strong> ({proj.studentProgram})
                  </span>
                  <span>{proj.dateAdded}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-white border border-[#8F9CFE]/30 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#283593] hover:underline"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>View Repository</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
