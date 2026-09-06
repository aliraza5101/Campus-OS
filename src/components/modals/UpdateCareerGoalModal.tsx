import React, { useState } from 'react';
import { X, Target, Check } from 'lucide-react';

interface UpdateCareerGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: string;
  onUpdate: (goal: string) => void;
}

export const UpdateCareerGoalModal: React.FC<UpdateCareerGoalModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onUpdate,
}) => {
  const [selectedGoal, setSelectedGoal] = useState(currentGoal);
  const [customGoal, setCustomGoal] = useState('');

  if (!isOpen) return null;

  const popularGoals = [
    'AI / Machine Learning Engineer',
    'Computer Vision Specialist',
    'NLP & LLM Engineer',
    'Data Scientist',
    'AI Research Scientist',
    'Full-Stack AI Software Engineer',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGoal = customGoal.trim() || selectedGoal;
    if (finalGoal) {
      onUpdate(finalGoal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Update Career Goal</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Target Role
            </label>
            <div className="space-y-1.5">
              {popularGoals.map((goal) => {
                const isSelected = selectedGoal === goal && !customGoal;

                return (
                  <div
                    key={goal}
                    onClick={() => {
                      setSelectedGoal(goal);
                      setCustomGoal('');
                    }}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border border-[#283593] bg-[#EEF2FF] text-[#283593] font-bold'
                        : 'border border-slate-100 bg-[#FAFBFD] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#283593]" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Custom Career Goal
            </label>
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="e.g. Autonomous Systems Researcher"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#283593] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#283593] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98]"
            >
              Update Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
