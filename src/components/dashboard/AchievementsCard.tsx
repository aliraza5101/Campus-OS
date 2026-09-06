import React from 'react';
import { ArrowUpRight, Trophy, Target, Code, Microscope, Award, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { AchievementItem } from '../../types';

interface AchievementsCardProps {
  achievements: AchievementItem[];
  onViewAll: () => void;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  achievements,
  onViewAll,
}) => {
  const earnedCount = achievements.filter((a) => a.status === 'Completed').length;
  const lockedCount = achievements.length - earnedCount;

  const renderIcon = (iconName: string, isCompleted: boolean) => {
    const iconClass = `h-4 w-4 ${isCompleted ? 'text-[#283593]' : 'text-slate-400'}`;

    switch (iconName) {
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'Code':
        return <Code className={iconClass} />;
      case 'Microscope':
        return <Microscope className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  return (
    <div
      id="card-achievements"
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Achievements
            </h3>
          </div>

          <button
            id="btn-view-achievements"
            onClick={onViewAll}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
          >
            <span>View</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Counter Subheader */}
        <p className="text-xs text-slate-500 my-3">
          <strong className="text-slate-800">{earnedCount} earned</strong> • {lockedCount} locked
        </p>

        {/* Achievements List */}
        <div className="space-y-2.5">
          {achievements.slice(0, 4).map((ach) => {
            const isCompleted = ach.status === 'Completed';

            return (
              <div
                key={ach.id}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs shadow-2xs transition ${
                  isCompleted
                    ? 'border-slate-200 bg-[#FAFBFD] hover:border-[#283593] hover:bg-[#F6F8FF]'
                    : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isCompleted ? 'bg-[#EEF2FF]' : 'bg-slate-100'
                    }`}
                  >
                    {renderIcon(ach.iconName, isCompleted)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{ach.title}</p>
                    <p className="text-[10.5px] text-slate-400 truncate">{ach.description}</p>
                  </div>
                </div>

                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-[#283593] shrink-0 ml-2" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-300 shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Button CTA */}
      <div className="mt-4 pt-2">
        <button
          id="btn-see-all-achievements"
          onClick={onViewAll}
          className="w-full rounded-full bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          View Achievements
        </button>
      </div>
    </div>
  );
};
