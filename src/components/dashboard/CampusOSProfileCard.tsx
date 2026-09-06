import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { ProfileChecklistItem } from '../../types';

interface CampusOSProfileCardProps {
  items: ProfileChecklistItem[];
  onActionClick: (actionKey?: string) => void;
}

export const CampusOSProfileCard: React.FC<CampusOSProfileCardProps> = ({
  items,
  onActionClick,
}) => {
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      id="card-complete-campusos-profile"
      className="relative overflow-hidden rounded-2xl bg-[#283593] border border-[#283593] p-5 text-white shadow-xs transition-all duration-300 hover:shadow-[0_12px_32px_rgba(40,53,147,0.25)] hover:border-[#8F9CFE]"
    >
      {/* Header with Title & Percentage */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-white">
          Complete Your CampusOS Profile
        </h3>
        <span className="text-sm font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Subheader summary */}
      <p className="text-xs text-white/90 mb-3">
        {completedCount} of {totalCount} completed — finish your profile:
      </p>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => {
          const isClickable = !item.completed;

          return (
            <div
              key={item.id}
              onClick={() => isClickable && onActionClick(item.actionKey)}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition border ${
                isClickable
                  ? 'cursor-pointer bg-white/15 border-white/25 text-white hover:bg-white/25 hover:border-white/40'
                  : 'bg-white/10 border-white/15 text-white/90'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.completed ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#283593]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-white/70" />
                )}
                <span className="font-medium text-white">
                  {item.title}
                </span>
              </div>

              {/* Action Chevron for uncompleted tasks */}
              {isClickable && (
                <ChevronRight className="h-4 w-4 text-white/80" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
