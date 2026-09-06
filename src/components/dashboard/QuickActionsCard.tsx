import React from 'react';
import { Plus, Sparkles, Briefcase, FolderGit2, Target } from 'lucide-react';

interface QuickActionsCardProps {
  onAddProject: () => void;
  onAddExperience: () => void;
  onUpdateSkills: () => void;
  onUpdateCareerGoal: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onAddProject,
  onAddExperience,
  onUpdateSkills,
  onUpdateCareerGoal,
}) => {
  const actions = [
    {
      id: 'add-project',
      label: 'Add Project',
      icon: FolderGit2,
      onClick: onAddProject,
    },
    {
      id: 'add-experience',
      label: 'Add Experience',
      icon: Briefcase,
      onClick: onAddExperience,
    },
    {
      id: 'update-skills',
      label: 'Update Skills',
      icon: Sparkles,
      onClick: onUpdateSkills,
    },
    {
      id: 'update-career-goal',
      label: 'Update Career Goal',
      icon: Target,
      onClick: onUpdateCareerGoal,
    },
  ];

  return (
    <div
      id="card-quick-actions"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Header */}
      <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100/80">
        Quick Actions
      </h3>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-3.5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#FAFBFD] p-3 text-left shadow-2xs transition hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs group cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#283593] shadow-xs group-hover:bg-[#283593] group-hover:text-white transition">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
