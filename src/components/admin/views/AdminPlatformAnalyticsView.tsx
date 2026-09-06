import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  Compass,
  Target,
} from 'lucide-react';
import {
  AcademicAnalyticsData,
  SkillAnalyticsData,
  ProjectAnalyticsData,
  ExperienceAnalyticsData,
  CareerAnalyticsData,
  RoadmapAnalyticsData,
} from '../../../types/admin';
import { AdminAcademicView } from './AdminAcademicView';
import { AdminSkillsView } from './AdminSkillsView';
import { AdminProjectsView } from './AdminProjectsView';
import { AdminExperienceView } from './AdminExperienceView';
import { AdminCareerView } from './AdminCareerView';
import { AdminRoadmapsView } from './AdminRoadmapsView';

interface AdminPlatformAnalyticsViewProps {
  academicData: AcademicAnalyticsData;
  skillsData?: SkillAnalyticsData;
  projectsData?: ProjectAnalyticsData;
  experienceData?: ExperienceAnalyticsData;
  careerData?: CareerAnalyticsData;
  roadmapData?: RoadmapAnalyticsData;
}

export const AdminPlatformAnalyticsView: React.FC<AdminPlatformAnalyticsViewProps> = ({
  academicData,
  skillsData,
  projectsData,
  experienceData,
  careerData,
  roadmapData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'academic' | 'skills' | 'projects' | 'experience' | 'career' | 'roadmap'>('academic');

  const tabs = [
    { id: 'academic', label: 'Academic Performance', icon: GraduationCap },
    { id: 'skills', label: 'Skills Mastery', icon: Sparkles },
    { id: 'projects', label: 'Verified Projects', icon: FolderGit2 },
    { id: 'experience', label: 'Roles & Experience', icon: Briefcase },
    { id: 'career', label: 'Career Readiness', icon: Target },
    { id: 'roadmap', label: 'Roadmap Tracking', icon: Compass },
  ];

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-[#8F9CFE]/80 rounded-2xl shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#283593] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Analytics View */}
      {activeSubTab === 'academic' && <AdminAcademicView academicData={academicData} />}
      {activeSubTab === 'skills' && skillsData && <AdminSkillsView skillsData={skillsData} />}
      {activeSubTab === 'projects' && projectsData && <AdminProjectsView projectsData={projectsData} />}
      {activeSubTab === 'experience' && experienceData && <AdminExperienceView experienceData={experienceData} />}
      {activeSubTab === 'career' && careerData && <AdminCareerView careerData={careerData} />}
      {activeSubTab === 'roadmap' && roadmapData && <AdminRoadmapsView roadmapData={roadmapData} />}
    </div>
  );
};


