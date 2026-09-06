import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { AnnouncementItem } from '../../../types/admin';

interface AdminNewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnnouncement: (ann: AnnouncementItem) => void;
}

export const AdminNewAnnouncementModal: React.FC<AdminNewAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onAddAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<
    'BS Computer Science' | 'BS Artificial Intelligence' | 'All Students' | 'Semester 5 & 6' | 'Graduating Seniors'
  >('All Students');
  const [category, setCategory] = useState<'Career' | 'Academic' | 'System' | 'Hackathon'>('Career');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newAnn: AnnouncementItem = {
      id: `ann-0${Date.now().toString().slice(-3)}`,
      title,
      content,
      targetAudience,
      category,
      priority,
      status: 'Published',
      author: 'CampusOS Administrator',
      publishedDate: 'Just now',
      viewCount: 0,
    };

    onAddAnnouncement(newAnn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#283593]">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Publish Campus Announcement
              </h3>
              <p className="text-[11px] text-slate-400">
                Broadcast Official Updates & Advisories
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
              Announcement Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fall 2026 Career Fair Registration"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              >
                <option value="Career">Career & Placement</option>
                <option value="Academic">Academic & Milestones</option>
                <option value="Hackathon">Hackathons & Events</option>
                <option value="System">System Advisory</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593] bg-[#FAFBFD]"
            >
              <option value="All Students">All Students</option>
              <option value="BS Computer Science">BS Computer Science</option>
              <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
              <option value="Semester 5 & 6">Semester 5 & 6</option>
              <option value="Graduating Seniors">Graduating Seniors</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Announcement Message Body
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter official announcement details..."
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
              Publish Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
