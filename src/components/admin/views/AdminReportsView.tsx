import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ReportItem } from '../../../types/admin';
import { downloadCSV, printInstitutionalPDF } from '../../../utils/exportUtils';

interface AdminReportsViewProps {
  reports: ReportItem[];
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getReportData = (report: ReportItem) => {
    let headers: string[] = ['Metric', 'Category', 'Value', 'Status', 'Notes'];
    let rows: (string | number)[][] = [
      ['Sample Metric 1', report.category, '94%', 'Verified', 'Meets accreditation benchmark'],
      ['Sample Metric 2', report.category, '88.5%', 'Active', 'Ongoing evaluation'],
      ['Sample Metric 3', report.category, '1,240', 'Completed', 'Audited by Department Head'],
    ];

    if (report.id === 'accreditation-2026') {
      headers = ['Department', 'Students Analyzed', 'Avg CGPA', 'Readiness Score', 'Accreditation Status'];
      rows = [
        ['BS Artificial Intelligence', 240, '3.42', '84%', 'Compliant (Level A)'],
        ['BS Computer Science', 310, '3.28', '79%', 'Compliant (Level A)'],
        ['BS Software Engineering', 280, '3.35', '81%', 'Compliant (Level A)'],
        ['BS Data Science', 190, '3.31', '82%', 'Compliant (Level A)'],
        ['BS Information Technology', 220, '3.18', '75%', 'Compliant (Level B)'],
      ];
    } else if (report.id === 'skills-gap-q2') {
      headers = ['Skill Cluster', 'Enrolled Students', 'Industry Standard', 'Current Mastery', 'Skill Gap'];
      rows = [
        ['Machine Learning & LLMs', 320, '85%', '72%', '13% Gap (Focus Needed)'],
        ['Full-Stack Web Development', 410, '80%', '84%', 'Surpasses Benchmark'],
        ['Data Science & Analytics', 290, '78%', '76%', '2% Gap (Optimal)'],
        ['Cloud & DevOps', 210, '75%', '61%', '14% Gap (High Priority)'],
        ['Cybersecurity Fundamentals', 180, '70%', '68%', '2% Gap (Optimal)'],
      ];
    } else if (report.id === 'placement-2026') {
      headers = ['Hiring Partner', 'Applications', 'Shortlisted', 'Interviews', 'Hired / Placed'];
      rows = [
        ['MindVista AI', 45, 18, 12, 6],
        ['Aixeron Systems', 38, 14, 9, 5],
        ['VisionRD Labs', 29, 11, 7, 4],
        ['CodeKonix Tech', 52, 22, 16, 9],
        ['Cassandra Research', 21, 8, 5, 3],
      ];
    } else if (report.id === 'academic-standing-sp26') {
      headers = ['Degree Program', 'Total Enrolled', 'Honors (GPA >= 3.5)', 'Good Standing (GPA >= 2.5)', 'At Risk (GPA < 2.5)'];
      rows = [
        ['BS Artificial Intelligence', 240, 78, 148, 14],
        ['BS Computer Science', 310, 82, 204, 24],
        ['BS Software Engineering', 280, 79, 185, 16],
        ['BS Data Science', 190, 52, 128, 10],
        ['BS Information Technology', 220, 41, 158, 21],
      ];
    } else if (report.id === 'project-portfolio-audit') {
      headers = ['Department', 'Total Repositories', 'Verified Projects', 'Pending Review', 'AI Verified %'];
      rows = [
        ['BS Artificial Intelligence', 480, 412, 68, '85.8%'],
        ['BS Computer Science', 620, 510, 110, '82.2%'],
        ['BS Software Engineering', 540, 478, 62, '88.5%'],
        ['BS Data Science', 310, 265, 45, '85.4%'],
        ['BS Information Technology', 290, 224, 66, '77.2%'],
      ];
    } else if (report.id === 'ai-mentor-utilization') {
      headers = ['Metric Category', 'Queries Handled', 'Active Sessions', 'Resolution Rate', 'Avg Response Time'];
      rows = [
        ['Academic & Course Concepts', '14,250', '3,410', '94.2%', '1.2 sec'],
        ['Career & Resume Advice', '8,920', '2,180', '91.8%', '1.4 sec'],
        ['Code Debugging & Projects', '11,400', '2,950', '89.5%', '1.8 sec'],
        ['Opportunity Matching', '6,380', '1,620', '96.1%', '0.9 sec'],
      ];
    }

    return { headers, rows };
  };

  const handleDownload = (report: ReportItem) => {
    const { headers, rows } = getReportData(report);

    if (report.format === 'PDF') {
      printInstitutionalPDF({
        title: report.title,
        category: report.category,
        recordsCount: report.recordsCount,
        lastGenerated: report.lastGenerated,
        format: report.format,
        description: report.description,
        dataHeaders: headers,
        dataRows: rows,
      });
      showToast(`Opened printable PDF window for "${report.title}"`);
    } else {
      const filename = `${report.id}_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCSV(filename, headers, rows);
      showToast(`Exported ${report.title} (${rows.length} rows) as CSV/Excel file`);
    }
  };

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
              Institutional Reports & Analytics Center
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593] shadow-2xs">
              {reports.length} Pre-built Exports
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Generate, preview, and export high-resolution institutional intelligence reports for department heads and accreditation boards.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="flex flex-col justify-between rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:-translate-y-0.5 hover:bg-white/95 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                  {rep.category}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {rep.format}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#283593] transition">
                {rep.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {rep.description}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10.5px] text-slate-400 font-medium">
                {rep.recordsCount} records • {rep.lastGenerated}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedReport(rep)}
                  className="rounded-lg border border-[#8F9CFE]/50 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#FAFBFD] hover:border-[#283593] hover:text-[#283593] transition-all active:scale-95"
                  title="Preview Report"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleDownload(rep)}
                  className="flex items-center gap-1 rounded-lg bg-[#283593] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1F297E] hover:shadow-[0_4px_14px_rgba(40,53,147,0.35)] transition-all active:scale-95 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#8F9CFE]/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                  {selectedReport.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {selectedReport.description}
            </p>

            <div className="rounded-xl border border-[#8F9CFE]/40 bg-[#FAFBFD] p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Analyzed Records:</span>
                <span className="font-bold text-slate-900">{selectedReport.recordsCount} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Output Format:</span>
                <span className="font-bold text-slate-900">{selectedReport.format} Document</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp Generated:</span>
                <span className="font-bold text-slate-900">{selectedReport.lastGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accreditation Ready:</span>
                <span className="font-bold text-emerald-600">Verified & Compliant</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-xl border border-[#8F9CFE]/60 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedReport);
                  setSelectedReport(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E] hover:shadow-[0_4px_14px_rgba(40,53,147,0.35)] transition-all active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export {selectedReport.format}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
