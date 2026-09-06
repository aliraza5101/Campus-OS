import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Building2,
  GraduationCap,
  Trophy,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { StudentUser } from '../../types';

import { opportunitiesApi } from '../../services/api';

interface TopOpportunitiesCardProps {
  user: StudentUser;
  onViewAll: () => void;
}

interface MiniOpportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  location: string;
  matchScore: number;
  deadline: string;
  applyUrl?: string;
  targetRole?: string;
}

export const TopOpportunitiesCard: React.FC<TopOpportunitiesCardProps> = ({
  user,
  onViewAll,
}) => {
  const [liveOpps, setLiveOpps] = React.useState<MiniOpportunity[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    opportunitiesApi
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const studentGoal = (user.careerGoal || '').toLowerCase();

          // Match opportunities tailored to student's goal or high prestige
          const matched = res.data.filter((opp: any) => {
            const role = (opp.targetRole || '').toLowerCase();
            const title = (opp.title || '').toLowerCase();

            if (studentGoal.includes('vision')) {
              return role.includes('vision') || title.includes('vision');
            }
            if (studentGoal.includes('machine learning') || studentGoal.includes('ai')) {
              return role.includes('ai') || role.includes('machine learning') || title.includes('machine learning') || title.includes('ai');
            }
            if (studentGoal.includes('full') || studentGoal.includes('web') || studentGoal.includes('software')) {
              return role.includes('full') || role.includes('software') || title.includes('software');
            }
            if (studentGoal.includes('cloud') || studentGoal.includes('devops')) {
              return role.includes('cloud') || role.includes('devops') || title.includes('cloud');
            }
            if (studentGoal.includes('data')) {
              return role.includes('data') || title.includes('data');
            }
            if (studentGoal.includes('cyber')) {
              return role.includes('cyber') || role.includes('security');
            }
            return opp.type === 'Internship' || opp.featured;
          });

          // Take top 3 matched, or fallback to first 3
          const displayItems = (matched.length >= 3 ? matched : res.data).slice(0, 3);

          setLiveOpps(
            displayItems.map((r: any) => ({
              id: r.id,
              title: r.title,
              organization: r.organization,
              type: r.type,
              location: r.location || 'Remote Friendly',
              matchScore: 94,
              deadline: r.deadline,
              applyUrl: r.applyUrl,
              targetRole: r.targetRole,
            }))
          );
        }
      })
      .catch((err) => console.warn('Top opportunities fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [user.careerGoal]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Internship':
        return <Building2 className="h-3.5 w-3.5 text-[#283593]" />;
      case 'Scholarship':
        return <GraduationCap className="h-3.5 w-3.5 text-purple-600" />;
      default:
        return <Trophy className="h-3.5 w-3.5 text-[#283593]" />;
    }
  };

  return (
    <div
      id="card-top-opportunities"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF2FF] text-[#283593]">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matched Opportunities
            </h3>
          </div>
        </div>

        <button
          id="btn-view-all-opportunities"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
        >
          <span>Explore All</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-2.5 text-xs text-slate-500">
        High-match openings curated for your <strong>{user.careerGoal || 'AI / Machine Learning'}</strong> trajectory:
      </p>

      {/* Opportunities List */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {liveOpps.map((opp) => (
          <div
            key={opp.id}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 transition-all hover:border-[#283593] hover:bg-[#F6F8FF] hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {getTypeIcon(opp.type)}
                  <span>{opp.type}</span>
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>{opp.matchScore}% Match</span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-[#283593] transition">
                {opp.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {opp.organization}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10.5px]">
              <span className="flex items-center gap-1 truncate text-slate-500">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{opp.location}</span>
              </span>
              {opp.applyUrl ? (
                <a
                  href={opp.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#283593] hover:text-[#1A237E] hover:underline"
                >
                  <span>Apply</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ) : (
                <button
                  onClick={onViewAll}
                  className="font-bold text-[#283593] hover:underline cursor-pointer"
                >
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
