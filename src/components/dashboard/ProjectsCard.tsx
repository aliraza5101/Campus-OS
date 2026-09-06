import React from 'react';
import { ArrowUpRight, FolderGit2, Plus, Code, CheckCircle2, Clock } from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectsCardProps {
  projects: ProjectItem[];
  onViewAll: () => void;
  onAddProject: () => void;
}

export const ProjectsCard: React.FC<ProjectsCardProps> = ({
  projects,
  onViewAll,
  onAddProject,
}) => {
  return (
    <div
      id="card-projects"
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs min-h-[220px] transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
              <FolderGit2 className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Projects
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-project-cta"
              onClick={onAddProject}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#283593] hover:text-[#1F297E] transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Project</span>
            </button>
            <button
              id="btn-view-projects"
              onClick={onViewAll}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition ml-2"
            >
              <span>View</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 mb-4">
          Build proof of what you can do.
        </p>

        {/* Projects List */}
        <div className="space-y-3">
          {projects.map((proj) => {
            const isCompleted = proj.status === 'Completed';

            return (
              <div
                key={proj.id}
                className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 shadow-2xs transition hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {proj.title}
                      {isCompleted && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#283593]" />
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {proj.category}
                    </span>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${
                      isCompleted
                        ? 'bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE]/60'
                        : 'bg-[#FAF5FF] text-[#6B21A8] border border-[#DDD6FE]/60'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className={`h-full rounded-full ${
                        isCompleted ? 'bg-[#283593]' : 'bg-[#6366F1]'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] font-bold text-slate-600">
                    {proj.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
