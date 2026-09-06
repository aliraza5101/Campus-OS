import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  User,
  GraduationCap,
  Eye,
  Download,
  Printer,
} from 'lucide-react';
import { OpportunityApplicationItem } from '../../../types/admin';
import { downloadCSV, printInstitutionalPDF } from '../../../utils/exportUtils';
import { adminApi } from '../../../services/api';

interface AdminApplicationsViewProps {
  applications: OpportunityApplicationItem[];
}

export const AdminApplicationsView: React.FC<AdminApplicationsViewProps> = ({
  applications,
}) => {
  const [appsList, setAppsList] = useState<OpportunityApplicationItem[]>(applications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    adminApi
      .getApplications()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAppsList(res.data);
        }
      })
      .catch((err) => {
        console.warn('Fetch applications error:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };


  const handleExportCSV = () => {
    const headers = ['Applicant Name', 'Program', 'Applied Opportunity', 'Company', 'GPA', 'Readiness Score (%)', 'Applied Date', 'Status'];
    const rows = filteredApps.map((a) => [
      a.studentName,
      a.studentProgram,
      a.opportunityTitle,
      a.company,
      a.gpa.toFixed(2),
      a.readinessScore,
      a.appliedDate,
      a.status,
    ]);
    downloadCSV(`student_applications_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast(`Exported ${filteredApps.length} application records to CSV`);
  };

  const handleExportPDF = () => {
    const headers = ['Applicant', 'Program', 'Opportunity', 'Company', 'GPA', 'Readiness', 'Status'];
    const rows = filteredApps.map((a) => [
      a.studentName,
      a.studentProgram,
      a.opportunityTitle,
      a.company,
      `${a.gpa.toFixed(2)} CGPA`,
      `${a.readinessScore}%`,
      a.status,
    ]);
    printInstitutionalPDF({
      title: 'Student Opportunity Applications Audit',
      category: 'Hiring & Placement Intelligence',
      recordsCount: filteredApps.length,
      lastGenerated: new Date().toLocaleTimeString(),
      format: 'PDF / Print',
      description: 'Official summary of student applicants, academic standing, and shortlisting status across active campus opportunities.',
      dataHeaders: headers,
      dataRows: rows,
    });
    showToast(`Generated print-ready PDF for ${filteredApps.length} applications`);
  };

  const handleUpdateStatus = (id: string, status: 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected') => {
    setAppsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    adminApi.updateApplicationStatus(id, status).catch((err) => console.warn('Update app status error:', err));
    showToast(`Application status updated to ${status}`);
  };


  const filteredApps = appsList.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.opportunityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Opportunity Applications
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593] shadow-2xs">
              {appsList.length} Submissions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review candidate qualifications, GPA standing, and shortlist students for hiring partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1F297E] hover:shadow-[0_4px_14px_rgba(40,53,147,0.3)] transition active:scale-95 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-200" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant or opportunity..."
            className="w-full rounded-xl border border-[#8F9CFE]/50 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#283593] focus:shadow-[0_0_12px_rgba(40,53,147,0.15)] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                statusFilter === st
                  ? 'bg-[#283593] text-white shadow-[0_2px_8px_rgba(40,53,147,0.3)]'
                  : 'bg-slate-50 border border-[#8F9CFE]/40 text-slate-600 hover:bg-[#FAFBFD] hover:border-[#283593] hover:text-[#283593]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white shadow-xs overflow-hidden transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Applied Opportunity</th>
                <th className="py-3.5 px-4">GPA / Readiness</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Decisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-[#FAFBFD] transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{app.studentName}</span>
                    <span className="text-[10.5px] text-slate-400">{app.studentProgram}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{app.opportunityTitle}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{app.company}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{app.gpa.toFixed(2)} GPA</span>
                    <span className="text-slate-400 text-[10.5px]"> • {app.readinessScore}% Ready</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-medium">{app.appliedDate}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        app.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : app.status === 'Shortlisted'
                          ? 'bg-indigo-50 text-[#283593] border border-indigo-200/60'
                          : app.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                        className="rounded-lg border border-indigo-200/80 bg-indigo-50 px-2.5 py-1 text-[10.5px] font-bold text-[#283593] hover:bg-[#EEF2FF] hover:border-[#283593] hover:shadow-[0_2px_8px_rgba(40,53,147,0.2)] transition active:scale-95"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                        className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-600 hover:shadow-[0_2px_8px_rgba(16,185,129,0.2)] transition active:scale-95"
                      >
                        Accept
                      </button>
                    </div>
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
