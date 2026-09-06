import React from 'react';
import { ArrowUpRight, Activity, CheckCircle, PlusCircle, Edit3 } from 'lucide-react';
import { RecentActivityItem } from '../../types';

interface RecentActivityCardProps {
  activities: RecentActivityItem[];
  onViewAll: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  onViewAll,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5 text-[#283593]" />;
      case 'added':
        return <PlusCircle className="h-3.5 w-3.5 text-[#283593]" />;
      case 'updated':
        return <Edit3 className="h-3.5 w-3.5 text-[#6366F1]" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <div
      id="card-recent-activity"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Recent Activity
          </h3>
        </div>

        <button
          id="btn-view-recent-activity"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
        >
          <span>View</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5 mt-3.5">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#FAFBFD] p-3 text-xs shadow-2xs transition hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-xs">
                {getIcon(item.type)}
              </div>
              <div className="truncate">
                <span className="font-medium text-slate-500 mr-1.5">{item.title}</span>
                <span className="font-bold text-slate-900">{item.target}</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 shrink-0 ml-3">
              {item.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
