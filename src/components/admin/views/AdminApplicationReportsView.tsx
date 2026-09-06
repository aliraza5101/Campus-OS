import React from 'react';
import {
  FileSpreadsheet,
  FileCheck2,
  CalendarDays,
  FileText,
  Clock,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const AdminApplicationReportsView: React.FC = () => {
  const upcomingReports = [
    {
      title: 'Opportunity Application Pipeline Reports',
      description: 'End-to-end tracking of student submissions for corporate internships, research programs, and competitive scholarships.',
      icon: <Layers className="h-5 w-5 text-[#283593]" />,
      badge: 'Career Pipeline',
    },
    {
      title: 'Cohort Longitudinal Progression Analytics',
      description: 'Term-over-term milestone completion, degree progress velocity, and onboarding completion statistics by major.',
      icon: <GraduationCap className="h-5 w-5 text-[#283593]" />,
      badge: 'Academic Cohorts',
    },
    {
      title: 'Accreditation & Compliance Data Packages',
      description: 'Standardized institutional assessment data formatted for ABET, regional university charters, and department audits.',
      icon: <FileCheck2 className="h-5 w-5 text-[#283593]" />,
      badge: 'Accreditation',
    },
    {
      title: 'Automated Scheduled Digest & Exports',
      description: 'Recurring automated generation and secure email delivery of department-level summary spreadsheets in CSV and XLSX.',
      icon: <CalendarDays className="h-5 w-5 text-[#283593]" />,
      badge: 'Automation',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#283593]">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Application Reports
            </h2>
            <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Coming Soon
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student application audits, review pipelines, and accreditation compliance reporting.
          </p>
        </div>
      </div>

      {/* Prominent Coming Soon Showcase Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-[#283593]">
            <FileSpreadsheet className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-bold text-amber-800">
              <Clock className="h-3.5 w-3.5" />
              <span>In Active Development</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Application Reports Engine Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We are currently engineering the comprehensive application reporting suite, allowing administrators to audit student admissions, track opportunity applications, and generate verified regulatory compliance summaries.
            </p>
          </div>
        </div>

        {/* Scheduled Modules Preview */}
        <div className="mt-8 pt-8 border-t border-slate-100 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#283593]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Planned Reporting Modules in Development
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingReports.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4 space-y-2 hover:border-[#8F9CFE]/60 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {item.title}
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-10">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
