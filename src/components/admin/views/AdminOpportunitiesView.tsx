import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Building,
  Users,
  Award,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  Save,
} from 'lucide-react';
import { OpportunityItem } from '../../../types/admin';
import { opportunitiesApi } from '../../../services/api';

interface AdminOpportunitiesViewProps {
  opportunities: OpportunityItem[];
  onOpenNewOpportunity: () => void;
}

export const AdminOpportunitiesView: React.FC<AdminOpportunitiesViewProps> = ({
  opportunities,
  onOpenNewOpportunity,
}) => {
  const [oppList, setOppList] = useState<OpportunityItem[]>(opportunities);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingOpp, setEditingOpp] = useState<OpportunityItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (opportunities && opportunities.length > 0) {
      setOppList(opportunities);
    }
  }, [opportunities]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const types = ['All', 'Research', 'Internship', 'Hackathon', 'Job', 'Scholarship'];

  const filteredOpps = oppList.filter((opp) => {
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    setOppList((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );

    try {
      await opportunitiesApi.update(id, { status: nextStatus });
      showToast(`Opportunity set to ${nextStatus}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status on server');
    }
  };

  const handleDeleteOpp = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setOppList((prev) => prev.filter((o) => o.id !== id));
    try {
      await opportunitiesApi.delete(id);
      showToast('Opportunity deleted successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete opportunity');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;

    setIsSavingEdit(true);
    try {
      await opportunitiesApi.update(editingOpp.id, {
        title: editingOpp.title,
        organization: editingOpp.organization,
        type: editingOpp.type,
        location: editingOpp.location,
        deadline: editingOpp.deadline,
        status: editingOpp.status,
        compensation: editingOpp.compensation,
      });

      setOppList((prev) =>
        prev.map((o) => (o.id === editingOpp.id ? editingOpp : o))
      );
      setEditingOpp(null);
      showToast('Opportunity updated successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save changes');
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
              Campus Opportunities & Placements
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
              {oppList.length} Listed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Post, curate, and broadcast internships, lab research seats, hackathons, and company roles.
          </p>
        </div>

        <button
          onClick={onOpenNewOpportunity}
          className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Post Opportunity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, organization, or location..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-[#283593] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-[#FAFBFD] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Applicants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {filteredOpps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No opportunities match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOpps.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{opp.title}</div>
                      <div className="text-[11px] font-normal text-slate-500">{opp.organization}</div>
                      {opp.compensation && (
                        <span className="inline-block mt-0.5 text-[10px] text-emerald-600 font-semibold">
                          {opp.compensation}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {opp.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{opp.location}</td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">{opp.deadline}</td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#283593]">{opp.applicantsCount || 0}</span>
                      <span className="text-slate-400 text-[10.5px]"> applied</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(opp.id, opp.status)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition cursor-pointer ${
                          opp.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {opp.status}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingOpp(opp)}
                          className="rounded-lg bg-indigo-50 border border-indigo-200/60 p-1.5 text-xs font-bold text-[#283593] hover:bg-[#EEF2FF] transition cursor-pointer"
                          title="Edit opportunity"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpp(opp.id, opp.title)}
                          className="rounded-lg bg-rose-50 border border-rose-200/60 p-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Delete opportunity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Opportunity Modal */}
      {editingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Opportunity</h3>
              <button
                onClick={() => setEditingOpp(null)}
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
                  value={editingOpp.title}
                  onChange={(e) => setEditingOpp({ ...editingOpp, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization</label>
                  <input
                    type="text"
                    required
                    value={editingOpp.organization}
                    onChange={(e) => setEditingOpp({ ...editingOpp, organization: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={editingOpp.type}
                    onChange={(e) => setEditingOpp({ ...editingOpp, type: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Research">Research</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Job">Job</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingOpp.location}
                    onChange={(e) => setEditingOpp({ ...editingOpp, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="text"
                    value={editingOpp.deadline}
                    onChange={(e) => setEditingOpp({ ...editingOpp, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compensation</label>
                  <input
                    type="text"
                    value={editingOpp.compensation || ''}
                    onChange={(e) => setEditingOpp({ ...editingOpp, compensation: e.target.value })}
                    placeholder="e.g. Paid Stipend (PKR 45k/mo)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingOpp.status}
                    onChange={(e) => setEditingOpp({ ...editingOpp, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#283593]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOpp(null)}
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
