import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react';
import { SkillProgressItem } from '../../types';

interface UpdateSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillProgressItem[];
  onAddSkill: (skill: SkillProgressItem) => void;
  onRemoveSkill: (skillId: string) => void;
}

export const UpdateSkillsModal: React.FC<UpdateSkillsModalProps> = ({
  isOpen,
  onClose,
  skills,
  onAddSkill,
  onRemoveSkill,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Core Programming');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [percentage, setPercentage] = useState(60);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddSkill({
      id: `sk-${Date.now()}`,
      name,
      category,
      level,
      percentage,
      verified: true,
    });

    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Manage Skills</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Skills List */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 mb-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAFBFD] p-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{skill.name}</span>
                <span className="text-[10.5px] text-slate-400">({skill.level} - {skill.percentage}%)</span>
              </div>
              <button
                onClick={() => onRemoveSkill(skill.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                title="Remove skill"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Skill Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-800">Add New Skill</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PyTorch"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              >
                <option>Core Programming</option>
                <option>AI & Data</option>
                <option>Specialization</option>
                <option>Engineering Tools</option>
                <option>Soft Skills</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Proficiency ({percentage}%)
              </label>
              <input
                type="range"
                min={20}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full mt-2 accent-[#283593]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Done
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1F297E]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
