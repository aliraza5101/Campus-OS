import React, { useState } from 'react';
import { X, Briefcase, Plus } from 'lucide-react';
import { ExperienceItem } from '../../types';

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (experience: ExperienceItem) => void;
}

export const AddExperienceModal: React.FC<AddExperienceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [employmentType, setEmploymentType] = useState('Internship');
  const [period, setPeriod] = useState('Jun 2024 - Aug 2024');
  const [location, setLocation] = useState('Remote');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) return;

    onAdd({
      id: `exp-${Date.now()}`,
      title,
      company,
      employmentType,
      period,
      location,
    });

    setTitle('');
    setCompany('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
              <Briefcase className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Add Experience</h3>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI / Machine Learning Research Intern"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#283593] focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Lab *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. National Center of AI (NCAI)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#283593] focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              >
                <option>Internship</option>
                <option>Part-time</option>
                <option>Research Assistant</option>
                <option>Fellowship</option>
                <option>Full-time</option>
                <option>Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Period
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. Summer 2024"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Islamabad, Pakistan (Hybrid)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
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
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Experience</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
