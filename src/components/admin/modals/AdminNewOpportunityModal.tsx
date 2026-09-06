import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { OpportunityItem } from '../../../types/admin';

interface AdminNewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOpportunity: (opp: OpportunityItem) => void;
}

export const AdminNewOpportunityModal: React.FC<AdminNewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onAddOpportunity,
}) => {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState<'Research' | 'Internship' | 'Hackathon' | 'Competition' | 'Job' | 'Scholarship'>('Internship');
  const [location, setLocation] = useState('Islamabad / Hybrid');
  const [deadline, setDeadline] = useState('Nov 30, 2026');
  const [compensation, setCompensation] = useState('Competitive Stipend');
  const [matchRequirement, setMatchRequirement] = useState('Python, Sem 5+, GPA > 3.0');
  const [applyUrl, setApplyUrl] = useState('');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('All');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !organization) return;

    const newOpp: OpportunityItem = {
      id: `opp-0${Date.now().toString().slice(-3)}`,
      title,
      organization,
      type,
      location,
      deadline,
      status: 'Published',
      applicantsCount: 0,
      matchRequirement,
      featured: true,
      compensation,
      postedDate: 'Just now',
      applyUrl: applyUrl.trim() || undefined,
      description: description.trim() || `${type} opportunity offered by ${organization}.`,
      targetRole: targetRole || 'All',
      isExternal: Boolean(applyUrl.trim()),
    };

    onAddOpportunity(newOpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#283593]">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Post New Campus Opportunity
              </h3>
              <p className="text-[11px] text-slate-400">
                Internship, Scholarship, Lab Research, Hackathon, or Competition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Opportunity Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Computer Vision Research Fellowship"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Organization / Lab / Company
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. NUST AI Lab"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              >
                <option value="Internship">Internship</option>
                <option value="Research">Research Fellowship / Lab</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Competition">Competition / Challenge</option>
                <option value="Scholarship">Scholarship / Grant</option>
                <option value="Job">Junior Job / Placement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Islamabad / Hybrid"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Application Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Oct 15, 2026"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Compensation / Funding / Stipend
              </label>
              <input
                type="text"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="e.g. PKR 65,000 / mo or Full Tuition"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Role / Track
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              >
                <option value="All">All Majors & Tracks (Universal)</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Computer Vision">Computer Vision</option>
                <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              External Apply URL (Leave empty for on-campus internal review)
            </label>
            <input
              type="url"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              placeholder="https://company.com/careers/job-123"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Short Description & Tasks
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what the student will do and what skills they will gain..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Eligibility & Skill Requirements
            </label>
            <input
              type="text"
              value={matchRequirement}
              onChange={(e) => setMatchRequirement(e.target.value)}
              placeholder="e.g. PyTorch, Python, Sem 5+, GPA > 3.2"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E]"
            >
              Publish Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
