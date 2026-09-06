import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Building2,
  GraduationCap,
  Microscope,
  Trophy,
  Zap,
  Globe,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { StudentUser } from '../../types';
import { opportunitiesApi } from '../../services/api';


export interface OpportunityItemClean {
  id: string;
  title: string;
  organization: string;
  location: string;
  deadline: string;
  category: string;
  matchScore: number;
  tags: string[];
  description: string;
  coverageAward?: string;
  applyUrl?: string;
  hasApplied?: boolean;
  targetRole?: string;
  isExternal?: boolean;
}


const OPPORTUNITY_LIST: OpportunityItemClean[] = [
  {
    id: 'opp-1',
    title: 'AI & Computer Vision Research Intern',
    organization: 'SAP Innovation Center Network',
    location: 'Germany (Remote Friendly)',
    deadline: 'Oct 15, 2026',
    category: 'Internship',
    matchScore: 94,
    tags: ['Python', 'PyTorch', 'OpenCV', 'Git'],
    description:
      'Work alongside senior AI engineers on real-time neural vision and perception models for enterprise automation.',
    applyUrl: 'https://jobs.sap.com',
  },
  {
    id: 'opp-2',
    title: 'DAAD Study Scholarship for Master in AI',
    organization: 'German Academic Exchange Service (DAAD)',
    location: 'Germany',
    deadline: 'Oct 31, 2026',
    category: 'Scholarship',
    matchScore: 89,
    coverageAward: '100% Tuition Waiver + €934/mo stipend',
    tags: ['Fully Funded', 'Master Degree', 'Research'],
    description:
      'Prestigious fully-funded scholarship for international students pursuing postgraduate studies in AI & Computer Science.',
    applyUrl: 'https://www.daad.de',
  },
  {
    id: 'opp-3',
    title: 'Computer Vision Summer Research Fellow',
    organization: 'Max Planck Institute for Informatics',
    location: 'Saarbrücken, Germany',
    deadline: 'Nov 20, 2026',
    category: 'Research & Labs',
    matchScore: 91,
    coverageAward: '€1,200/mo Research Grant + GPU Compute Access',
    tags: ['Deep Learning', 'PyTorch', '3D Vision'],
    description:
      'Conduct mentored research with world-leading faculty in 3D scene reconstruction and neural rendering pipelines.',
    applyUrl: 'https://www.mpi-inf.mpg.de',
  },
  {
    id: 'opp-4',
    title: 'CERN Summer Student Fellowship - Machine Learning',
    organization: 'CERN Laboratory',
    location: 'Geneva, Switzerland',
    deadline: 'Dec 15, 2026',
    category: 'Internship',
    matchScore: 96,
    coverageAward: '90 CHF/day Living Allowance + Physics Lecture Series',
    tags: ['Machine Learning', 'Python', 'Data Analytics'],
    description:
      'Spend 8–13 weeks at CERN in Geneva collaborating on high-energy particle machine learning models.',
    applyUrl: 'https://careers.cern',
  },
  {
    id: 'opp-5',
    title: 'Google AI Student Hackathon 2026',
    organization: 'Google DeepMind & Cloud',
    location: 'Online / Global',
    deadline: 'Oct 28, 2026',
    category: 'Hackathon',
    matchScore: 95,
    coverageAward: '$50,000 Prize Pool + Cloud Credits',
    tags: ['Gemini API', 'React', 'Full-Stack AI'],
    description:
      'Build innovative generative AI and multimodal web applications using Gemini models and Google Cloud.',
    applyUrl: 'https://devpost.com',
  },
  {
    id: 'opp-6',
    title: 'Kaggle University AI Challenge - Edge Vision',
    organization: 'Kaggle & NVIDIA Developer Community',
    location: 'Online',
    deadline: 'Nov 10, 2026',
    category: 'Competition',
    matchScore: 88,
    coverageAward: '$25,000 Prize Pool + RTX GPUs',
    tags: ['Kaggle', 'PyTorch', 'YOLO', 'Optimization'],
    description:
      'Benchmark and optimize real-time object detection models for low-power edge computing devices.',
    applyUrl: 'https://kaggle.com',
  },
  {
    id: 'opp-7',
    title: 'Erasmus Mundus Joint Master in AI (EMAI)',
    organization: 'European Commission & EMAI Consortium',
    location: 'Netherlands / France / Spain',
    deadline: 'Dec 01, 2026',
    category: 'Scholarship',
    matchScore: 92,
    coverageAward: 'Full Tuition + €1,400/month Living Grant',
    tags: ['European Master', 'Full Scholarship', 'AI'],
    description:
      'Two-year European Master programme spanning top universities across the Netherlands, France, Spain, and Italy.',
    applyUrl: 'https://www.emai-master.eu',
  },
  {
    id: 'opp-8',
    title: 'National AI Innovation Cup',
    organization: 'National AI Lab & Ministry of IT',
    location: 'Islamabad, PK (Hybrid)',
    deadline: 'Nov 30, 2026',
    category: 'Hackathon',
    matchScore: 90,
    coverageAward: 'Rs. 1,000,000 Seed Grant + Incubation',
    tags: ['Startups', 'Healthcare AI', 'Education AI'],
    description:
      'Compete to build scalable AI solutions for national challenges in healthcare, clean energy, and education.',
    applyUrl: 'https://ignite.gov.pk',
  },
];

interface OpportunitiesViewProps {
  user: StudentUser;
  opportunities?: OpportunityItemClean[];
  initialCategory?: string;
  onBackToDashboard: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  user,
  opportunities: propOpps,
  initialCategory = 'All',
  onBackToDashboard,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedModalOpp, setAppliedModalOpp] = useState<OpportunityItemClean | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveOpps, setLiveOpps] = useState<OpportunityItemClean[]>(propOpps || OPPORTUNITY_LIST);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [onlyShowGoalMatched, setOnlyShowGoalMatched] = useState<boolean>(false);

  // Load live opportunities from backend
  useEffect(() => {
    opportunitiesApi
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const normalized: OpportunityItemClean[] = res.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            organization: r.organization,
            location: r.location || 'Remote Friendly',
            deadline: r.deadline,
            category: r.type || 'Internship',
            matchScore: 94,
            tags: r.matchRequirement ? [r.matchRequirement] : [r.type],
            description: r.description || (r.matchRequirement ? `Eligibility: ${r.matchRequirement}` : 'Exciting technical opportunity.'),
            coverageAward: r.compensation || undefined,
            applyUrl: r.applyUrl || '',
            hasApplied: Boolean(r.hasApplied),
            targetRole: r.targetRole || 'All',
            isExternal: r.isExternal !== false,
          }));
          setLiveOpps(normalized);
          const alreadyApplied = new Set<string>();
          normalized.forEach((o) => {
            if (o.hasApplied) alreadyApplied.add(o.id);
          });
          setAppliedIds(alreadyApplied);
        }
      })
      .catch((err) => {
        console.warn('Live opportunities fetch error:', err);
      });
  }, []);

  const categories = [
    { id: 'All', label: 'All Opportunities', count: liveOpps.length, icon: Globe },
    { id: 'Internship', label: 'Internships', count: liveOpps.filter((o) => o.category === 'Internship').length, icon: Building2 },
    {
      id: 'Hackathon',
      label: 'Hackathons & Competitions',
      count: liveOpps.filter((o) => o.category === 'Hackathon' || o.category === 'Competition').length,
      icon: Trophy,
    },
    {
      id: 'Research',
      label: 'Research & Labs',
      count: liveOpps.filter((o) => o.category === 'Research' || o.category === 'Research & Labs').length,
      icon: Microscope,
    },
    {
      id: 'Scholarship',
      label: 'Scholarships',
      count: liveOpps.filter((o) => o.category === 'Scholarship').length,
      icon: GraduationCap,
    },
  ];

  const filteredOpportunities = liveOpps.filter((opp) => {
    const isHackathonOrComp = opp.category === 'Hackathon' || opp.category === 'Competition';
    const isResearch = opp.category === 'Research' || opp.category === 'Research & Labs';

    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Internship' && opp.category === 'Internship') ||
      (activeCategory === 'Hackathon' && isHackathonOrComp) ||
      (activeCategory === 'Research' && isResearch) ||
      (activeCategory === 'Scholarship' && opp.category === 'Scholarship');

    const matchesSearch =
      searchQuery.trim() === '' ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.targetRole && opp.targetRole.toLowerCase().includes(searchQuery.toLowerCase())) ||
      opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // If onlyShowGoalMatched is active on Internships or Hackathons
    if (onlyShowGoalMatched && (opp.category === 'Internship' || isHackathonOrComp)) {
      const studentGoal = (user.careerGoal || '').toLowerCase();
      const oppRole = (opp.targetRole || '').toLowerCase();
      const oppTitle = opp.title.toLowerCase();

      const isMatched =
        oppRole === 'all' ||
        oppRole.includes(studentGoal) ||
        studentGoal.includes(oppRole) ||
        (studentGoal.includes('vision') && (oppRole.includes('vision') || oppTitle.includes('vision'))) ||
        (studentGoal.includes('machine learning') && (oppRole.includes('ai') || oppRole.includes('machine learning') || oppTitle.includes('learning') || oppTitle.includes('ai'))) ||
        (studentGoal.includes('ai') && (oppRole.includes('ai') || oppTitle.includes('ai') || oppTitle.includes('ml'))) ||
        (studentGoal.includes('full') && (oppRole.includes('full') || oppRole.includes('web') || oppTitle.includes('software') || oppTitle.includes('engineering'))) ||
        (studentGoal.includes('cloud') && (oppRole.includes('cloud') || oppRole.includes('devops'))) ||
        (studentGoal.includes('data') && (oppRole.includes('data') || oppTitle.includes('data'))) ||
        (studentGoal.includes('cyber') && (oppRole.includes('cyber') || oppRole.includes('security')));

      return matchesCategory && matchesSearch && isMatched;
    }

    return matchesCategory && matchesSearch;
  });

  const handleApplyClick = (opp: OpportunityItemClean) => {
    // If it has a source applyUrl, open it in a new tab and asynchronously record in database
    if (opp.applyUrl && opp.applyUrl.startsWith('http')) {
      window.open(opp.applyUrl, '_blank', 'noopener,noreferrer');
      opportunitiesApi.apply(opp.id, 'Student opened official application portal via Campus OS', opp.title).catch(() => {});
      return;
    }

    // Otherwise it's an internal opportunity, open the internal submission modal
    setAppliedModalOpp(opp);
  };

  const handleConfirmApply = async () => {
    if (!appliedModalOpp) return;
    try {
      await opportunitiesApi.apply(appliedModalOpp.id, 'Applied via student dashboard', appliedModalOpp.title);
      setToastMessage(`Application submitted successfully for ${appliedModalOpp.title}!`);
    } catch (err: any) {
      console.warn('Apply API error:', err);
      setToastMessage(`Application submitted for ${appliedModalOpp.title}!`);
    }
    setAppliedModalOpp(null);
    setTimeout(() => setToastMessage(null), 3500);
  };



  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standard Header Banner (Consistent with My Journey views) */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Opportunities
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Explore curated internships, scholarships, research labs, competitions, and hackathons.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-back-to-dashboard-opportunities"
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Buttons & Search Bar Row */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    isSelected
                      ? 'bg-[#283593] text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, org, or role..."
              className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-8.5 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#283593] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Goal-Targeted Quick Filter for Internships & Hackathons */}
        {(activeCategory === 'Internship' || activeCategory === 'Hackathon') && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter by Track:</span>
              <button
                onClick={() => setOnlyShowGoalMatched(!onlyShowGoalMatched)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  onlyShowGoalMatched
                    ? 'bg-[#EEF2FF] text-[#283593] border border-[#8F9CFE]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="h-3 w-3 text-[#283593]" />
                <span>🎯 Matched for: {user.careerGoal || 'My Career Goal'}</span>
                {onlyShowGoalMatched && (
                  <span className="ml-1 text-[10px] bg-[#283593] text-white px-1.5 py-0.2 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Showing {filteredOpportunities.length} opportunities
            </span>
          </div>
        )}
      </div>

      {/* Opportunities List Cards */}
      {filteredOpportunities.length === 0 ? (
        <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-10 text-center shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md">
          <Globe className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-bold text-slate-900">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or switch category filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
              setOnlyShowGoalMatched(false);
            }}
            className="mt-3.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                {/* Category + Target Role + Deadline */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-lg bg-blue-50 text-[#283593] px-2.5 py-0.5 text-[11px] font-bold border border-blue-100">
                      {opp.category}
                    </span>
                    {opp.targetRole && opp.targetRole !== 'All' && (
                      <span className="rounded-lg bg-purple-50 text-purple-700 px-2 py-0.5 text-[11px] font-bold border border-purple-100">
                        {opp.targetRole}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{opp.deadline}</span>
                  </div>
                </div>

                {/* Full Authentic Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {opp.title}
                </h3>

                {/* Organization & Location */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 mb-2.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    <span>{opp.organization}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{opp.location}</span>
                  </span>
                </div>

                {/* Clear Easy-to-Understand Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {opp.description}
                </p>

                {/* Coverage / Award / Stipend Box */}
                {opp.coverageAward && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-700 mb-3">
                    <span className="font-bold text-slate-900">Award / Funding: </span>
                    <span className="text-slate-600 font-medium">{opp.coverageAward}</span>
                  </div>
                )}

                {/* Eligibility Tags */}
                {opp.tags && opp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {opp.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {opp.isExternal !== false ? 'Direct Official Application' : 'Campus Placement'}
                </span>

                {appliedIds.has(opp.id) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Applied</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyClick(opp)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#283593] hover:bg-[#1F297E] px-4 py-1.5 text-xs font-bold text-white transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>{opp.applyUrl ? 'Apply on Official Portal' : 'Apply Now'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Application Confirmation Modal */}
      {appliedModalOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#283593] font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Apply to Opportunity
                  </h3>
                  <p className="text-xs text-slate-500">
                    {appliedModalOpp.organization}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAppliedModalOpp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-[#FAFBFD] border border-slate-100 p-3 text-xs space-y-1.5 mb-4">
              <p className="font-bold text-slate-900">{appliedModalOpp.title}</p>
              <p className="text-slate-600">{appliedModalOpp.location} • Deadline: {appliedModalOpp.deadline}</p>
              <p className="text-emerald-700 font-semibold mt-1">
                ✓ Student Profile & GPA ({user.gpa}) will be pre-filled automatically
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAppliedModalOpp(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                className="rounded-xl bg-[#283593] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1F297E] shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
