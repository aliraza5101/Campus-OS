import React, { useState } from 'react';
import { X, Sparkles, Plus, Clock, Tag, Flag } from 'lucide-react';

interface AddRoadmapTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: string;
    actionType: string;
  }) => Promise<void> | void;
  semester?: number;
}

export const AddRoadmapTaskModal: React.FC<AddRoadmapTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  semester = 6,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Project' | 'Skill' | 'Career' | 'Academic' | 'Research'>('Project');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [estimatedTime, setEstimatedTime] = useState('2 weeks');
  const [actionType, setActionType] = useState('Build Project');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a milestone title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAdd({
        title: title.trim(),
        category,
        priority,
        estimatedTime,
        actionType,
      });
      setTitle('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add roadmap milestone');
    } finally {
      setIsSubmitting(false);
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
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Add Roadmap Milestone
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted for Semester {semester} career execution.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Milestone Action Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master CNN Architectures & Build Multi-Class Classifier"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#283593] focus:outline-hidden focus:ring-2 focus:ring-[#283593]/20 transition"
              required
            />
          </div>

          {/* 2-col Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#283593] focus:outline-hidden focus:ring-2 focus:ring-[#283593]/20 transition bg-white"
              >
                <option value="Project">Project Build</option>
                <option value="Skill">Skill Milestone</option>
                <option value="Career">Career & Internships</option>
                <option value="Academic">Academic Coursework</option>
                <option value="Research">Research & Papers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Flag className="h-3 w-3 text-slate-400" />
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#283593] focus:outline-hidden focus:ring-2 focus:ring-[#283593]/20 transition bg-white"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* 2-col Estimated Time & Action Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                Estimated Duration
              </label>
              <select
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#283593] focus:outline-hidden focus:ring-2 focus:ring-[#283593]/20 transition bg-white"
              >
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="3 weeks">3 weeks</option>
                <option value="4 weeks">4 weeks (1 month)</option>
                <option value="6 weeks">6 weeks</option>
                <option value="Semester-long">Semester-long</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Action Type
              </label>
              <input
                type="text"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                placeholder="e.g. Build Project, Certification"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#283593] focus:outline-hidden focus:ring-2 focus:ring-[#283593]/20 transition bg-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#283593] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add to Roadmap'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
