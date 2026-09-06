import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  Target,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  ExternalLink,
  Building2,
  Calendar,
  Compass,
  BrainCircuit,
  Loader2,
  ShieldAlert,
  ArrowUpRight,
  Award,
  Layers,
  FileText,
  Clock,
  Send,
} from 'lucide-react';
import { DirectoryStudent } from '../../../types/admin';
import { adminApi } from '../../../services/api';

interface AdminStudentDetailModalProps {
  student: DirectoryStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onResetOnboarding: (id: string) => void;
}

interface StudentDiagnosticReport {
  overallHealth?: 'Optimal' | 'Satisfactory' | 'Needs Attention' | 'Critical Risk' | string;
  healthScore?: number;
  executiveSummary?: string;
  academicRiskFactors?: string[];
  skillGaps?: string[];
  portfolioAssessment?: string;
  recommendedAdvisorActions?: string[];
  suggestedInterventionType?: string;
  generatedAt?: string;
  modelUsed?: string;

  overallAssessment?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  academicAnalysis?: {
    standing?: string;
    gpaTrend?: string;
    creditProgress?: string;
    academicStrengths?: string[];
    academicConcerns?: string[];
  };
  careerTrajectory?: {
    targetRole?: string;
    readinessScore?: number;
    marketFit?: string;
    missingCoreCompetencies?: string[];
    recommendedExperience?: string[];
  };
  portfolioAudit?: {
    projectQualityScore?: number;
    skillsDiversity?: string;
    certificationsValue?: string;
    suggestedCapstoneOrProjects?: string[];
  };
  advisorInterventionPlan?: Array<{
    priority?: 'Immediate' | 'Short-term' | 'Medium-term' | string;
    action?: string;
    rationale?: string;
  }>;
}

export const AdminStudentDetailModal: React.FC<AdminStudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onToggleStatus,
  onResetOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'skills' | 'projects' | 'career' | 'ai-diagnostic'>('overview');
  const [advisorNote, setAdvisorNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([]);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Student Detail Data from Backend
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // AI Diagnostic State
  const [diagnostic, setDiagnostic] = useState<StudentDiagnosticReport | null>(null);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);

  // Fetch full student profile when modal opens or student changes
  useEffect(() => {
    if (!isOpen || !student?.id) {
      setDetailData(null);
      setDiagnostic(null);
      return;
    }

    setLoadingDetail(true);
    adminApi
      .getStudentById(student.id)
      .then((res) => {
        if (res.success && res.data) {
          setDetailData(res.data);
          // Parse advisor notes if available
          if (res.data.advisor_notes) {
            try {
              const parsed = JSON.parse(res.data.advisor_notes);
              if (Array.isArray(parsed)) {
                setNotesList(parsed);
              } else {
                setNotesList([String(res.data.advisor_notes)]);
              }
            } catch {
              setNotesList([String(res.data.advisor_notes)]);
            }
          } else {
            setNotesList([
              'Student profile registered and verified on CampusOS.',
            ]);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load student detail from DB:', err);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorNote.trim()) return;

    const updatedNotes = [advisorNote.trim(), ...notesList];
    setNotesList(updatedNotes);
    setAdvisorNote('');
    setIsSavingNote(true);

    try {
      await adminApi.updateStudent(student.id, {
        advisorNotes: JSON.stringify(updatedNotes),
      });
      showToast('Advisor note saved to database');
    } catch (err: any) {
      console.warn('Failed to persist advisor note:', err);
      showToast('Note recorded locally');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleRunAiDiagnostic = async () => {
    setLoadingDiagnostic(true);
    try {
      const res = await adminApi.getStudentDiagnostic(student.id);
      if (res.success && res.data) {
        setDiagnostic(res.data);
        showToast('AI Academic & Career Diagnostic completed');
      } else {
        showToast(res.error || 'Failed to generate diagnostic');
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating AI diagnostic');
    } finally {
      setLoadingDiagnostic(false);
    }
  };

  // Resolve projects & skills from live DB or student summary
  const studentProjects: any[] = detailData?.projects || [];
  const studentSkills: any[] = detailData?.skills || [];
  const studentExperiences: any[] = detailData?.experiences || [];
  const studentApplications: any[] = detailData?.applications || [];
  const studentCerts: any[] = detailData?.certifications || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-lg animate-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#283593] text-white font-black text-base shadow-xs">
              {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {student.name}
                </h2>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    student.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : student.status === 'At Risk'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {student.program} • Semester {student.semester} • {student.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onToggleStatus(student.id);
                showToast(`Updated account status for ${student.name}`);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              {student.status === 'Inactive' ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Activate</span>
                </>
              ) : (
                <>
                  <UserX className="h-3.5 w-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Deactivate</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 overflow-x-auto text-xs font-bold text-slate-500 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Academic Overview
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-1 border-b-2 transition cursor-pointer ${
              activeTab === 'academic'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Academic Progress
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-1 border-b-2 transition cursor-pointer ${
              activeTab === 'skills'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Skills ({studentSkills.length > 0 ? studentSkills.length : student.skillsCount})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-1 border-b-2 transition cursor-pointer ${
              activeTab === 'projects'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Projects ({studentProjects.length > 0 ? studentProjects.length : student.projectsCount})
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`py-3 px-1 border-b-2 transition cursor-pointer ${
              activeTab === 'career'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Career Readiness ({student.readinessScore}%)
          </button>
          <button
            onClick={() => {
              setActiveTab('ai-diagnostic');
              if (!diagnostic && !loadingDiagnostic) {
                handleRunAiDiagnostic();
              }
            }}
            className={`py-3 px-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai-diagnostic'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent text-indigo-600 hover:text-indigo-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Diagnostic</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingDetail && (
            <div className="flex items-center justify-center py-4 text-xs text-slate-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#283593]" />
              <span>Syncing student portfolio with PostgreSQL...</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-3">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Cumulative GPA</span>
                  <span className="text-xl font-bold text-slate-900">{student.cgpa.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                    {student.academicStanding}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-3">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Degree Progress</span>
                  <span className="text-xl font-bold text-slate-900">
                    {Math.round((student.creditsCompleted / student.totalCredits) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {student.creditsCompleted}/{student.totalCredits} Credits
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-3">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Career Readiness</span>
                  <span className="text-xl font-bold text-[#283593]">{student.readinessScore}%</span>
                  <span className="text-[10px] text-[#283593] block mt-0.5 font-medium truncate">
                    {student.careerGoal}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-3">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Current Status</span>
                  <span className="text-xl font-bold text-teal-700">{student.status}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {student.academicStanding}
                  </span>
                </div>
              </div>

              {/* AI Diagnostic Card (Live & Interactive) */}
              {!diagnostic ? (
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-slate-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-[#283593] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          AI Academic & Career Diagnostic Engine
                        </h4>
                        <span className="rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                          Multi-Model AI
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                        Evaluate transcript health, skill gaps, capstone trajectory, and institutional risk factors for {student.name}.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loadingDiagnostic}
                    onClick={handleRunAiDiagnostic}
                    className="shrink-0 flex items-center gap-2 rounded-xl bg-[#283593] text-white px-4 py-2.5 text-xs font-bold hover:bg-[#1F297E] transition shadow-xs cursor-pointer disabled:opacity-75"
                  >
                    {loadingDiagnostic ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="h-4 w-4" />
                        <span>Run Live Diagnostic</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-[#FAFBFD] to-white p-4 sm:p-5 space-y-3.5 shadow-xs animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-[#283593] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            AI Academic & Career Diagnostic Engine
                          </h4>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 ${
                              diagnostic.overallHealth === 'Critical Risk' || diagnostic.riskLevel === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : diagnostic.overallHealth === 'Needs Attention' || diagnostic.riskLevel === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {(diagnostic.overallHealth === 'Critical Risk' || diagnostic.riskLevel === 'HIGH') ? (
                              <AlertTriangle className="h-2.5 w-2.5" />
                            ) : (
                              <CheckCircle2 className="h-2.5 w-2.5" />
                            )}
                            {diagnostic.overallHealth || 'Optimal'} Standing
                          </span>
                          <span className="rounded-md bg-indigo-50 border border-indigo-200/60 text-[#283593] px-2 py-0.5 text-[10px] font-bold">
                            Health Score: {diagnostic.healthScore || 85}/100
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">
                          Evaluated via {diagnostic.modelUsed || 'Groq Qwen 3.8 27B'} • Real-Time Institutional Audit
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={loadingDiagnostic}
                        onClick={handleRunAiDiagnostic}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
                        title="Re-run Diagnostic with AI"
                      >
                        {loadingDiagnostic ? (
                          <Loader2 className="h-3 w-3 animate-spin text-[#283593]" />
                        ) : (
                          <BrainCircuit className="h-3 w-3 text-[#283593]" />
                        )}
                        <span>{loadingDiagnostic ? 'Evaluating...' : 'Re-run'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ai-diagnostic')}
                        className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1F297E] transition shadow-xs cursor-pointer"
                      >
                        <span>View Full Report</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <div className="rounded-xl bg-indigo-50/40 border border-indigo-100/70 p-3 text-xs text-slate-700 leading-relaxed font-normal">
                    {diagnostic.executiveSummary || diagnostic.overallAssessment}
                  </div>

                  {/* Quick Takeaway Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-2.5">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Suggested Intervention
                      </span>
                      <span className="font-bold text-[#283593] truncate block">
                        {diagnostic.suggestedInterventionType || diagnostic.advisorInterventionPlan?.[0]?.action || 'Academic Mentorship'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-2.5">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Key Skill Gap to Target
                      </span>
                      <span className="font-semibold text-amber-800 truncate block">
                        {diagnostic.skillGaps?.[0] || diagnostic.careerTrajectory?.missingCoreCompetencies?.[0] || 'Domain Deployment'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-2.5">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Risk Factor Status
                      </span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {diagnostic.academicRiskFactors?.[0] || 'No critical deficiencies detected'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Career Goal & Skills Highlights */}
              <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Verified Technical Competencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(studentSkills.length > 0
                    ? studentSkills.map((s) => s.name)
                    : student.topSkills
                  ).map((skillName: string) => (
                    <span
                      key={skillName}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 text-[#283593]" />
                      <span>{skillName}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Advisor Notes Section with Postgres persistence */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-[#283593]" />
                    <span>Advisor & Faculty Advising Log</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Saved to PostgreSQL
                  </span>
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={advisorNote}
                    onChange={(e) => setAdvisorNote(e.target.value)}
                    placeholder="Add an advising note, academic intervention, or action item..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#283593]"
                  />
                  <button
                    type="submit"
                    disabled={isSavingNote || !advisorNote.trim()}
                    className="rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1F297E] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3 w-3" />}
                    <span>Add Note</span>
                  </button>
                </form>

                <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto">
                  {notesList.map((note, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100 flex items-start justify-between gap-2"
                    >
                      <span>{note}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        #{notesList.length - idx}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC PROGRESS */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4">
                <h4 className="text-xs font-bold text-slate-900 mb-3">
                  Semester Progression & Standing
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                    const isCompleted = sem < student.semester;
                    const isCurrent = sem === student.semester;
                    return (
                      <div
                        key={sem}
                        className={`p-2.5 rounded-xl border text-xs ${
                          isCurrent
                            ? 'border-[#283593] bg-[#EEF2FF] font-bold text-[#283593]'
                            : isCompleted
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-100 bg-white text-slate-400'
                        }`}
                      >
                        <p className="font-bold">Sem {sem}</p>
                        <p className="text-[10px] mt-0.5">
                          {isCompleted ? 'Passed' : isCurrent ? 'Active' : 'Upcoming'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4 text-xs space-y-2">
                <p><strong>University:</strong> {student.university}</p>
                <p><strong>Degree / Major:</strong> {student.program}</p>
                <p><strong>Academic Standing:</strong> {student.academicStanding}</p>
                <p><strong>Cumulative GPA:</strong> {student.cgpa.toFixed(2)}</p>
                <p><strong>Total Completed Credits:</strong> {student.creditsCompleted} / {student.totalCredits}</p>
                <p><strong>Account ID:</strong> <span className="font-mono text-slate-600">{student.id}</span></p>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Verified skill proficiencies recorded in student portfolio.
              </p>
              {studentSkills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {studentSkills.map((skill: any) => (
                    <div
                      key={skill.id || skill.name}
                      className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-[#FAFBFD] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#283593]" />
                          <span className="font-bold text-slate-900">{skill.name}</span>
                        </div>
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                          {skill.percentage || 70}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#283593] h-full rounded-full"
                          style={{ width: `${skill.percentage || 70}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {student.topSkills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAFBFD] p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#283593]" />
                        <span className="font-bold text-slate-900">{skill}</span>
                      </div>
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROJECTS (REAL DATA) */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Student portfolio technical projects recorded in CampusOS.
              </p>

              {studentProjects.length > 0 ? (
                <div className="space-y-3">
                  {studentProjects.map((proj: any) => {
                    const techStack: string[] = Array.isArray(proj.tech_stack)
                      ? proj.tech_stack
                      : typeof proj.tech_stack === 'string'
                      ? proj.tech_stack.split(',').map((t: string) => t.trim())
                      : [];

                    return (
                      <div
                        key={proj.id || proj.title}
                        className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4 text-xs space-y-2 hover:border-[#283593]/40 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">
                            {proj.title}
                          </span>
                          <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            {proj.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {proj.description || 'No description provided.'}
                        </p>
                        {techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {techStack.map((tech: string, i: number) => (
                              <span
                                key={i}
                                className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {(proj.repo_link || proj.demo_link) && (
                          <div className="flex items-center gap-3 pt-1 text-[11px]">
                            {proj.repo_link && (
                              <a
                                href={proj.repo_link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[#283593] hover:underline font-semibold"
                              >
                                <span>Code Repository</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                            {proj.demo_link && (
                              <a
                                href={proj.demo_link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-teal-700 hover:underline font-semibold"
                              >
                                <span>Live Demo</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                  <FolderGit2 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">No Projects Submitted Yet</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    This student has not yet added projects to their portfolio. Projects added by the student will automatically appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CAREER & APPLICATIONS */}
          {activeTab === 'career' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Target Role</span>
                  <span className="text-xs font-bold text-[#283593]">{student.careerGoal}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Overall Readiness</span>
                  <span className="font-bold text-slate-900">{student.readinessScore}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#283593]" style={{ width: `${student.readinessScore}%` }} />
                </div>
              </div>

              {/* Student Real Applications */}
              <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#283593]" />
                  <span>Job & Internship Applications ({studentApplications.length})</span>
                </h4>

                {studentApplications.length > 0 ? (
                  <div className="space-y-2">
                    {studentApplications.map((app: any) => (
                      <div
                        key={app.id}
                        className="rounded-xl bg-white border border-slate-200 p-3 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{app.opportunity_title}</p>
                          <p className="text-[11px] text-slate-500">{app.company}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              app.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-indigo-50 text-[#283593]'
                            }`}
                          >
                            {app.status}
                          </span>
                          {app.applied_date && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(app.applied_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No active job applications submitted yet by this student.
                  </p>
                )}
              </div>

              {/* Student Experiences */}
              {studentExperiences.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Work & Internship Experience ({studentExperiences.length})
                  </h4>
                  <div className="space-y-2">
                    {studentExperiences.map((exp: any) => (
                      <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-3 text-xs">
                        <p className="font-bold text-slate-900">{exp.role}</p>
                        <p className="text-slate-600">{exp.company} • {exp.duration || 'Past'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI ACADEMIC & CAREER DIAGNOSTIC */}
          {activeTab === 'ai-diagnostic' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#283593] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        AI Academic & Career Diagnostic Report
                      </h3>
                      {diagnostic?.modelUsed && (
                        <span className="rounded-md bg-indigo-50 border border-indigo-200/60 text-[#283593] px-2 py-0.5 text-[10px] font-bold">
                          {diagnostic.modelUsed}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Multi-model institutional audit synthesized for Deans, Department Heads, and Academic Advisors.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loadingDiagnostic}
                  onClick={handleRunAiDiagnostic}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E] transition disabled:opacity-60 cursor-pointer shadow-xs shrink-0"
                >
                  {loadingDiagnostic ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Synthesizing AI Evaluation...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-3.5 w-3.5" />
                      <span>{diagnostic ? 'Re-run Live Diagnostic' : 'Run Live Diagnostic'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* State 1: Loading */}
              {loadingDiagnostic && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-10 text-center space-y-3 animate-in fade-in">
                  <Loader2 className="h-9 w-9 animate-spin text-[#283593] mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Running CampusOS Multi-Model Diagnostic Engine...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Analyzing transcript GPA ({student.cgpa.toFixed(2)}), term progress (Semester {student.semester}), verified technical competencies, and project portfolio for {student.name}.
                  </p>
                </div>
              )}

              {/* State 2: Idle / Not yet generated */}
              {!diagnostic && !loadingDiagnostic && (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-white p-10 text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-[#283593] flex items-center justify-center mx-auto shadow-xs">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      No Live Diagnostic Generated for {student.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Click below to trigger a live AI assessment of academic standing, career trajectory, core technical competency gaps, and an advisor intervention plan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAiDiagnostic}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#283593] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1F297E] transition shadow-xs cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Student Diagnostic</span>
                  </button>
                </div>
              )}

              {/* State 3: Diagnostic Result Display */}
              {diagnostic && !loadingDiagnostic && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Assessment & Risk Banner */}
                  <div className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Executive Dean's Summary & Institutional Health
                        </span>
                        <span className="rounded-md bg-indigo-50 border border-indigo-200/60 text-[#283593] px-2 py-0.5 text-[10px] font-bold">
                          Health Score: {diagnostic.healthScore || 85}/100
                        </span>
                      </div>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto ${
                          diagnostic.overallHealth === 'Critical Risk' || diagnostic.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : diagnostic.overallHealth === 'Needs Attention' || diagnostic.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {(diagnostic.overallHealth === 'Critical Risk' || diagnostic.riskLevel === 'HIGH') ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Status: {diagnostic.overallHealth || diagnostic.riskLevel || 'Optimal'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white border border-slate-200/80 rounded-xl p-3">
                      {diagnostic.executiveSummary || diagnostic.overallAssessment}
                    </p>

                    {diagnostic.suggestedInterventionType && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                        <span className="font-bold text-slate-800">Suggested Action Pathway:</span>
                        <span className="rounded-md bg-indigo-50 text-[#283593] font-bold px-2 py-0.5 border border-indigo-200/60">
                          {diagnostic.suggestedInterventionType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Academic Analysis Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-[#283593]" />
                        <span>Academic Audit & Standing</span>
                      </h4>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p>
                          <strong>Standing:</strong> {diagnostic.academicAnalysis?.standing || student.academicStanding}
                        </p>
                        <p>
                          <strong>Progress:</strong> {diagnostic.academicAnalysis?.creditProgress || `${student.creditsCompleted}/${student.totalCredits} Credits Completed`}
                        </p>
                        <p>
                          <strong>CGPA Benchmark:</strong> {student.cgpa.toFixed(2)} / 4.00
                        </p>
                      </div>

                      {diagnostic.academicAnalysis?.academicStrengths && diagnostic.academicAnalysis.academicStrengths.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                            Academic Strengths:
                          </span>
                          <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                            {diagnostic.academicAnalysis.academicStrengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {((diagnostic.academicRiskFactors && diagnostic.academicRiskFactors.length > 0) ||
                        (diagnostic.academicAnalysis?.academicConcerns && diagnostic.academicAnalysis.academicConcerns.length > 0)) && (
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-rose-700 block mb-1">
                            Risk Factors & Deficiencies to Monitor:
                          </span>
                          <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
                            {(diagnostic.academicRiskFactors || diagnostic.academicAnalysis?.academicConcerns || []).map((c, i) => (
                              <li key={i} className="leading-snug">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Career Trajectory & Market Fit */}
                    <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-[#283593]" />
                        <span>Career Target & Skill Gap Analysis</span>
                      </h4>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p>
                          <strong>Target Role:</strong> {diagnostic.careerTrajectory?.targetRole || student.careerGoal}
                        </p>
                        <p>
                          <strong>Industry Fit:</strong> {diagnostic.careerTrajectory?.marketFit || 'High Market Demand'}
                        </p>
                      </div>

                      {((diagnostic.skillGaps && diagnostic.skillGaps.length > 0) ||
                        (diagnostic.careerTrajectory?.missingCoreCompetencies && diagnostic.careerTrajectory.missingCoreCompetencies.length > 0)) && (
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-amber-700 block mb-1.5">
                            Identified Competency & Tool Gaps:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(diagnostic.skillGaps || diagnostic.careerTrajectory?.missingCoreCompetencies || []).map((m, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {diagnostic.careerTrajectory?.recommendedExperience && diagnostic.careerTrajectory.recommendedExperience.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-700 block mb-1">
                            Recommended Experience Tracks:
                          </span>
                          <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                            {diagnostic.careerTrajectory.recommendedExperience.map((re, i) => (
                              <li key={i}>{re}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Portfolio & Capstone Suggestions */}
                  <div className="rounded-xl border border-slate-200 p-4 bg-[#FAFBFD] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FolderGit2 className="h-4 w-4 text-[#283593]" />
                        <span>Portfolio Quality & Capstone Audit</span>
                      </h4>
                      <span className="rounded-md bg-indigo-50 border border-indigo-200 text-[#283593] px-2 py-0.5 text-[10px] font-bold">
                        Quality Score: {diagnostic.portfolioAudit?.projectQualityScore || diagnostic.healthScore || 80}/100
                      </span>
                    </div>

                    {diagnostic.portfolioAssessment && (
                      <p className="text-[11px] text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-100">
                        "{diagnostic.portfolioAssessment}"
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>
                        <strong>Skills Diversity:</strong> {diagnostic.portfolioAudit?.skillsDiversity || `${studentSkills.length} competencies registered`}
                      </div>
                      <div>
                        <strong>Certifications:</strong> {diagnostic.portfolioAudit?.certificationsValue || `${studentCerts.length} verified credential(s)`}
                      </div>
                    </div>

                    {diagnostic.portfolioAudit?.suggestedCapstoneOrProjects && diagnostic.portfolioAudit.suggestedCapstoneOrProjects.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-800 block mb-1.5">
                          Suggested Capstone & Flagship Project Ideas:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {diagnostic.portfolioAudit.suggestedCapstoneOrProjects.map((p, i) => (
                            <div
                              key={i}
                              className="rounded-lg bg-white border border-slate-200 p-2.5 text-xs text-slate-700 flex items-start gap-2"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-[#283593] shrink-0 mt-0.5" />
                              <span className="leading-snug">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advisor Intervention Plan */}
                  {((diagnostic.advisorInterventionPlan && diagnostic.advisorInterventionPlan.length > 0) ||
                    (diagnostic.recommendedAdvisorActions && diagnostic.recommendedAdvisorActions.length > 0)) && (
                    <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-[#283593]" />
                        <span>Actionable Advisor Intervention Plan</span>
                      </h4>

                      <div className="space-y-2">
                        {(diagnostic.advisorInterventionPlan || (diagnostic.recommendedAdvisorActions || []).map((action, idx) => ({
                          priority: (idx === 0 ? 'Immediate' : idx === 1 ? 'Short-term' : 'Medium-term') as any,
                          action,
                          rationale: diagnostic.suggestedInterventionType || 'Institutional academic enhancement'
                        }))).map((plan, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-3 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900">{plan.action}</span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                  plan.priority === 'Immediate'
                                    ? 'bg-rose-100 text-rose-800'
                                    : plan.priority === 'Short-term'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-indigo-50 text-[#283593]'
                                }`}
                              >
                                {plan.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{plan.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-[#FAFBFD] text-xs">
          <span className="text-slate-400">
            Student ID: <strong>{student.id}</strong> • Last active {student.lastActive}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
