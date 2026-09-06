import React, { useState } from 'react';
import { X, Sparkles, Clock, Tag, CheckCircle2, Circle, CircleDot, Trash2, MessageSquare, ArrowRight } from 'lucide-react';
import { NextActionItem } from '../../types';

interface ActionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: NextActionItem | null;
  careerGoal?: string;
  onCompleteAction?: (actionId: string) => void;
  onUpdateStatus?: (actionId: string, status: 'pending' | 'in-progress' | 'completed') => void;
  onDeleteAction?: (actionId: string) => void;
  onConsultGPT?: (prompt: string) => void;
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({
  isOpen,
  onClose,
  action,
  careerGoal = 'Software Engineer',
  onCompleteAction,
  onUpdateStatus,
  onDeleteAction,
  onConsultGPT,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !action) return null;

  const currentStatus = action.status || 'pending';

  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (onUpdateStatus) {
      onUpdateStatus(action.id, newStatus);
    } else if (newStatus === 'completed' && onCompleteAction) {
      onCompleteAction(action.id);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteAction) return;
    try {
      setIsDeleting(true);
      await onDeleteAction(action.id);
      onClose();
    } catch (err) {
      console.warn('Delete action error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConsultAI = () => {
    if (onConsultGPT) {
      onConsultGPT(
        `I am working on my roadmap milestone: "${action.title}" (${action.category}, ${action.priority} Priority). My career goal is ${careerGoal}. Can you guide me step-by-step on how to successfully execute this action within ${action.estimatedTime}?`
      );
      onClose();
    }
  };

  const getMattersReason = () => {
    switch (action.category) {
      case 'Project':
        return `Building verifiable flagship projects directly validates your portfolio for ${careerGoal} technical recruiters and interview screens.`;
      case 'Skill':
        return `Closing critical skill gaps accelerates your readiness percentile and bridges academic coursework with industry requirements in ${careerGoal}.`;
      case 'Career':
        return `Taking targeted career actions directly expands your network, elevates your proof-of-work, and maximizes high-conversion internship opportunities.`;
      case 'Academic':
        return `Maintaining academic rigor in core prerequisite coursework solidifies foundational competencies essential for high-tier roles.`;
      case 'Research':
        return `Deep dive exploration and research publications establish rare intellectual authority and differentiate your technical profile.`;
      default:
        return `Completing this milestone directly aligns with your ${careerGoal} career track and advances your semester portfolio readiness.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#283593]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#283593]">
                CampusOS Action Step {action.number}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Action Milestone Overview
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Body */}
        <div className="space-y-4">
          {/* Main Info Box */}
          <div className="rounded-xl border border-slate-200/80 bg-[#FAFBFD] p-4">
            <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
              {action.title}
            </h4>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 font-medium">
                <Tag className="h-3 w-3 text-slate-400" />
                {action.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] px-2.5 py-1 text-[#283593] font-semibold">
                {action.priority} Priority
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 text-slate-600 rounded-md">
                <Clock className="h-3 w-3 text-slate-400" />
                {action.estimatedTime}
              </span>
            </div>
          </div>

          {/* Interactive Status Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Milestone Execution Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('pending')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  currentStatus === 'pending'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Circle className="h-3.5 w-3.5" />
                <span>To Do</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('in-progress')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  currentStatus === 'in-progress' || (currentStatus as string) === 'in_progress'
                    ? 'bg-[#283593] text-white border-[#283593] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CircleDot className="h-3.5 w-3.5" />
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  currentStatus === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed</span>
              </button>
            </div>
          </div>

          {/* AI Advisor Context */}
          <div className="rounded-xl bg-[#EEF2FF] border border-indigo-100/80 p-3.5 text-xs text-[#283593]">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Strategic Intelligence Context:
            </p>
            <p className="text-[12px] leading-relaxed text-indigo-900/90 font-normal">
              {getMattersReason()}
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {onConsultGPT ? (
              <button
                type="button"
                onClick={handleConsultAI}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#283593]" />
                <span>Consult Campus GPT</span>
              </button>
            ) : <div />}

            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              {onDeleteAction && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Delete Milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
