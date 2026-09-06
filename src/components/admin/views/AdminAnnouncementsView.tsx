import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Radio,
  Tag,
  Trash2,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { AnnouncementItem } from '../../../types/admin';
import { announcementsApi } from '../../../services/api';

interface AdminAnnouncementsViewProps {
  announcements: AnnouncementItem[];
  onOpenNewAnnouncement: () => void;
}

export const AdminAnnouncementsView: React.FC<AdminAnnouncementsViewProps> = ({
  announcements,
  onOpenNewAnnouncement,
}) => {
  const [annList, setAnnList] = useState<AnnouncementItem[]>(announcements);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      setAnnList(announcements);
    }
  }, [announcements]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    setAnnList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );

    try {
      await announcementsApi.update(id, { status: nextStatus });
      showToast(`Announcement set to ${nextStatus}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status on server');
    }
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete announcement "${title}"?`)) return;

    setAnnList((prev) => prev.filter((a) => a.id !== id));
    try {
      await announcementsApi.delete(id);
      showToast('Announcement deleted successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete announcement');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;

    setIsSavingEdit(true);
    try {
      await announcementsApi.update(editingAnn.id, {
        title: editingAnn.title,
        content: editingAnn.content,
        category: editingAnn.category,
        priority: editingAnn.priority,
        targetAudience: editingAnn.targetAudience,
        status: editingAnn.status,
      });

      setAnnList((prev) =>
        prev.map((a) => (a.id === editingAnn.id ? editingAnn : a))
      );
      setEditingAnn(null);
      showToast('Announcement updated successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update announcement');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Campus News & Announcements
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
              {annList.length} Announcements
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Broadcast official university updates, career fair registrations, and capstone deadlines.
          </p>
        </div>

        <button
          onClick={onOpenNewAnnouncement}
          className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List Cards */}
      <div className="space-y-4">
        {annList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No campus announcements created yet. Click "New Announcement" to publish one.
          </div>
        ) : (
          annList.map((ann) => (
            <div
              key={ann.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 hover:border-[#8F9CFE]/80 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      ann.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ann.priority} Priority
                  </span>
                  <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                    {ann.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Target: <strong>{ann.targetAudience}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    <Eye className="h-3 w-3 inline mr-1" />
                    {ann.viewCount || 0} views
                  </span>
                  <button
                    onClick={() => handleToggleStatus(ann.id, ann.status)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer transition ${
                      ann.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="Click to toggle status"
                  >
                    {ann.status}
                  </button>
                  <button
                    onClick={() => setEditingAnn(ann)}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#283593] hover:bg-indigo-50 transition cursor-pointer"
                    title="Edit announcement"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {ann.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Author: <strong>{ann.author}</strong></span>
                <span>Published: {ann.publishedDate}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Announcement Modal */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Announcement</h3>
              <button
                onClick={() => setEditingAnn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingAnn.title}
                  onChange={(e) => setEditingAnn({ ...editingAnn, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingAnn.category}
                    onChange={(e) => setEditingAnn({ ...editingAnn, category: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Career">Career</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingAnn.priority}
                    onChange={(e) => setEditingAnn({ ...editingAnn, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={editingAnn.targetAudience}
                    onChange={(e) => setEditingAnn({ ...editingAnn, targetAudience: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="Semester 5 & 6">Semester 5 & 6</option>
                    <option value="Graduating Seniors">Graduating Seniors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingAnn.status}
                    onChange={(e) => setEditingAnn({ ...editingAnn, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={editingAnn.content}
                  onChange={(e) => setEditingAnn({ ...editingAnn, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E] transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
