import React, { useState } from 'react';
import { X, Sparkles, Plus, CheckCircle2, Circle, ArrowRight, MessageSquare, ExternalLink, Code2 } from 'lucide-react';

export interface FocusPillar {
  number: string;
  title: string;
  tech: string;
  tag: string;
  icon?: any;
  description: string;
  keyCompetencies: string[];
  recommendedProject: {
    title: string;
    description: string;
    techStack: string[];
  };
  suggestedMilestone: {
    title: string;
    category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: string;
    actionType: string;
  };
}

interface FocusPillarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar: FocusPillar | null;
  semester?: number;
  careerGoal?: string;
  onAddMilestone?: (milestone: {
    title: string;
    category: 'Project' | 'Skill' | 'Career' | 'Academic' | 'Research';
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: string;
    actionType: string;
  }) => Promise<void> | void;
  onConsultGPT?: (prompt: string) => void;
}

export const FocusPillarModal: React.FC<FocusPillarModalProps> = ({
  isOpen,
  onClose,
  pillar,
  semester = 6,
  careerGoal = 'AI / ML Engineer',
  onAddMilestone,
  onConsultGPT,
}) => {
  const [checkedCompetencies, setCheckedCompetencies] = useState<Record<number, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen || !pillar) return null;

  const toggleCompetency = (index: number) => {
    setCheckedCompetencies((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddProjectToRoadmap = async () => {
    if (!onAddMilestone) return;
    try {
      setIsAdding(true);
      await onAddMilestone(pillar.suggestedMilestone);
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
      }, 3000);
    } catch (err) {
      console.warn('Add milestone error:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenGPT = () => {
    if (onConsultGPT) {
      onConsultGPT(
        `I am a Semester ${semester} student targeting ${careerGoal}. Can you provide a detailed technical roadmap, recommended learning resources, and implementation breakdown for: "${pillar.title}" (${pillar.tech})?`
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] border border-indigo-100 text-sm font-black text-[#283593]">
              {pillar.number}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold text-[#283593] uppercase tracking-wider">
                  {pillar.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">Semester {semester} Focus</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {pillar.title}
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

        {/* Content */}
        <div className="space-y-5">
          {/* Tech Stack Banner */}
          <div className="rounded-xl bg-[#FAFBFD] border border-slate-200/80 p-3.5 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">Core Tech & Methodologies:</span>
            <span className="text-[#283593] font-medium text-sm">{pillar.tech}</span>
          </div>

          {/* Detailed Overview */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Semester Objective & Strategic Context
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {pillar.description}
            </p>
          </div>

          {/* Key Competencies Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Key Competencies to Master
              </h4>
              <span className="text-[11px] text-slate-400">
                {Object.values(checkedCompetencies).filter(Boolean).length} of {pillar.keyCompetencies.length} checked
              </span>
            </div>

            <div className="space-y-2">
              {pillar.keyCompetencies.map((comp, idx) => {
                const isChecked = Boolean(checkedCompetencies[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCompetency(idx)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                    )}
                    <span className={`text-xs ${isChecked ? 'line-through text-emerald-700 font-medium' : 'font-normal'}`}>
                      {comp}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Flagship Project */}
          <div className="rounded-xl border border-indigo-100 bg-[#EEF2FF]/40 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Code2 className="h-4 w-4 text-[#283593]" />
              <h4 className="text-xs font-bold text-[#283593] uppercase tracking-wider">
                Recommended Flagship Build
              </h4>
            </div>
            <h5 className="text-sm font-bold text-slate-900">
              {pillar.recommendedProject.title}
            </h5>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {pillar.recommendedProject.description}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {pillar.recommendedProject.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[11px] font-semibold text-[#283593]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {onConsultGPT && (
              <button
                type="button"
                onClick={handleOpenGPT}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#283593]" />
                <span>Consult Campus GPT</span>
              </button>
            )}

            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Close
              </button>

              {onAddMilestone && (
                <button
                  type="button"
                  onClick={handleAddProjectToRoadmap}
                  disabled={isAdding}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition shadow-xs cursor-pointer ${
                    addedSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#283593] hover:bg-[#1F297E]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Added to Roadmap!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>{isAdding ? 'Adding...' : 'Add Project to Next Steps'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
