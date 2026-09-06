import React from 'react';
import { Sparkles, ArrowRight, Clock, Tag, ArrowUpRight } from 'lucide-react';
import { NextActionItem } from '../../types';

interface NextStepsCardProps {
  actions: NextActionItem[];
  onActionClick: (action: NextActionItem) => void;
  onViewAll?: () => void;
  onRecalibrate?: () => Promise<void> | void;
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({
  actions,
  onActionClick,
  onViewAll,
  onRecalibrate,
}) => {
  const [isRecalibrating, setIsRecalibrating] = React.useState(false);

  const handleRecalibrate = async () => {
    if (!onRecalibrate || isRecalibrating) return;
    try {
      setIsRecalibrating(true);
      await onRecalibrate();
    } finally {
      setIsRecalibrating(false);
    }
  };

  return (
    <div
      id="card-next-steps"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Your Next Steps
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized recommendations tailored to your degree, GPA & career goal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRecalibrate && (
            <button
              onClick={handleRecalibrate}
              disabled={isRecalibrating}
              title="Recalibrate next steps using AI based on your latest profile"
              className="inline-flex items-center gap-1 rounded-lg bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#283593] hover:bg-[#E0E7FF] transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`h-3 w-3 ${isRecalibrating ? 'animate-spin' : ''}`} />
              <span>{isRecalibrating ? 'Analyzing...' : 'AI Recalibrate'}</span>
            </button>
          )}

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition cursor-pointer"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Recommendation Items */}
      <div className="space-y-3 mt-4">
        {actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center bg-slate-50/60">
            <Sparkles className="h-6 w-6 text-[#283593] mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">All current milestones completed</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Explore your career roadmap or chat with AI Mentor to plan next milestones.</p>
          </div>
        ) : (
          actions.map((action) => {
            const isHighPriority = action.priority === 'High';

            return (
              <div
                key={action.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 shadow-2xs transition hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs"
              >
                {/* Number and Content */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#283593] shadow-xs group-hover:border-[#8F9CFE] group-hover:bg-[#EEF2FF] transition">
                    {action.number}
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {action.title}
                    </h4>

                    {/* Metadata Chips: Category, Priority, Estimated Time */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {action.category}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
                          isHighPriority
                            ? 'bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE]'
                            : 'bg-[#FAF5FF] text-[#6B21A8] border border-[#DDD6FE]'
                        }`}
                      >
                        {action.priority} Priority
                      </span>

                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        {action.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={() => onActionClick(action)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start sm:self-center rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition group-hover:border-[#283593] group-hover:bg-[#283593] group-hover:text-white cursor-pointer"
                >
                  <span>View Action</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
