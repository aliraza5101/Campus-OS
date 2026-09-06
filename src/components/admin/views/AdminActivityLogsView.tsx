import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
} from 'lucide-react';
import { ActivityLogItem } from '../../../types/admin';

interface AdminActivityLogsViewProps {
  activityLogs: ActivityLogItem[];
}

export const AdminActivityLogsView: React.FC<AdminActivityLogsViewProps> = ({
  activityLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Opportunities', 'Academic Data', 'Announcements', 'User Management', 'Security', 'System'];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Audit & Activity Logs
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
              Real-time Audit
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident audit trail of administrative modifications, role upgrades, broadcasts, and system operations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, action, or target entity..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#283593]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Event Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold font-sans">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                    {log.actor}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#283593] font-semibold font-sans">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-sans">
                    {log.target}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
