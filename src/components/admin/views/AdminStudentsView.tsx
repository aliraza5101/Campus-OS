import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DirectoryStudent } from '../../../types/admin';

interface AdminStudentsViewProps {
  students: DirectoryStudent[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectStudent: (student: DirectoryStudent) => void;
  onToggleStudentStatus: (id: string) => void;
  onResetStudentOnboarding: (id: string) => void;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({
  students,
  searchQuery,
  onSearchChange,
  onSelectStudent,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'gpa' | 'readiness' | 'semester'>('readiness');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const programs = ['All', 'BS Artificial Intelligence', 'BS Computer Science', 'BS Software Engineering', 'BS Data Science', 'BS Information Technology'];
  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
  const statuses = ['All', 'Active', 'Needs Attention', 'At Risk', 'Inactive'];

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesQuery =
          searchQuery === '' ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.careerGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.topSkills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
        const matchesSemester = selectedSemester === 'All' || s.semester.toString() === selectedSemester;
        const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

        return matchesQuery && matchesProgram && matchesSemester && matchesStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        if (sortBy === 'gpa') diff = a.cgpa - b.cgpa;
        if (sortBy === 'readiness') diff = a.readinessScore - b.readinessScore;
        if (sortBy === 'semester') diff = a.semester - b.semester;
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [students, searchQuery, selectedProgram, selectedSemester, selectedStatus, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Program', 'Semester', 'CGPA', 'Academic Standing', 'Career Goal', 'Readiness (%)', 'Status'];
    const rows = filteredStudents.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.program.replace(/"/g, '""')}"`,
      s.semester,
      s.cgpa.toFixed(2),
      `"${s.academicStanding.replace(/"/g, '""')}"`,
      `"${s.careerGoal.replace(/"/g, '""')}"`,
      s.readinessScore,
      `"${s.status.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filteredStudents.length} student records as CSV`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Directory
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593] shadow-2xs">
              {students.length} Students
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Search, filter, and track student academic progress, career readiness, and skills.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#8F9CFE]/60 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-[#FAFBFD] hover:border-[#283593] hover:text-[#283593] hover:shadow-[0_4px_14px_rgba(143,156,254,0.25)] transition-all duration-300 active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs space-y-3 transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <div className="flex items-center rounded-xl border border-[#8F9CFE]/50 bg-slate-50/70 px-3 py-1.5 focus-within:border-[#283593] focus-within:bg-white focus-within:shadow-[0_0_12px_rgba(40,53,147,0.15)] transition-all">
              <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by student name, email, career goal, or skill..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full rounded-xl border border-[#8F9CFE]/50 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#283593] focus:bg-white transition-all"
            >
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Programs' : p}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border border-[#8F9CFE]/50 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#283593] focus:bg-white transition-all"
            >
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Semesters' : `Semester ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-[#8F9CFE]/50 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#283593] focus:bg-white transition-all"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Sort by:</span>
            {(['readiness', 'gpa', 'semester', 'name'] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (sortBy === key) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(key);
                    setSortOrder('desc');
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  sortBy === key
                    ? 'bg-[#EEF2FF] text-[#283593] border border-indigo-200/60 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {key} {sortBy === key && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-slate-700">{filteredStudents.length}</strong> of {students.length} students
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white shadow-xs overflow-hidden transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Program & Semester</th>
                <th className="py-3.5 px-4">CGPA / Standing</th>
                <th className="py-3.5 px-4">Career Goal</th>
                <th className="py-3.5 px-4">Career Readiness</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Student Profile & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200/60 text-[#283593] font-bold text-xs">
                          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="font-bold text-slate-900 hover:text-[#283593] text-left transition truncate block"
                          >
                            {student.name}
                          </button>
                          <span className="text-[10.5px] text-slate-400 block truncate">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Program & Semester */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[160px]">
                        {student.program}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Semester {student.semester} ({student.creditsCompleted}/{student.totalCredits} cr)
                      </span>
                    </td>

                    {/* CGPA & Academic Standing */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-sm block ${
                          student.cgpa >= 3.5
                            ? 'text-emerald-600'
                            : student.cgpa >= 3.0
                            ? 'text-slate-800'
                            : 'text-rose-600'
                        }`}
                      >
                        {student.cgpa.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {student.academicStanding}
                      </span>
                    </td>

                    {/* Career Goal */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[150px]">
                        {student.careerGoal}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {student.skillsCount} skills • {student.projectsCount} projects
                        </span>
                      </div>
                    </td>

                    {/* Career Readiness */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs ${
                            student.readinessScore >= 80
                              ? 'text-emerald-600'
                              : student.readinessScore >= 50
                              ? 'text-[#283593]'
                              : 'text-rose-600'
                          }`}
                        >
                          {student.readinessScore}%
                        </span>
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${
                              student.readinessScore >= 80
                                ? 'bg-emerald-500'
                                : student.readinessScore >= 50
                                ? 'bg-[#283593]'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${student.readinessScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          student.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : student.status === 'Needs Attention'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : student.status === 'At Risk'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {student.status === 'Active' && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {student.status === 'At Risk' && <AlertTriangle className="h-2.5 w-2.5" />}
                        <span>{student.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200/70 px-3 py-1.5 text-xs font-bold text-[#283593] hover:bg-[#EEF2FF] hover:border-[#283593] hover:shadow-xs transition active:scale-95"
                          title="View Student Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
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
    </div>
  );
};
