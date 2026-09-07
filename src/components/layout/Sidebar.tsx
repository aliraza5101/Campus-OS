import React from 'react';
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  Target,
  Building2,
  Microscope,
  TrendingUp,
  Trophy,
  Activity,
  User,
  Settings,
  X,
  ArrowRight,
  LogOut,
  GitBranch,
  Linkedin,
  Bot,
  Shield,
} from 'lucide-react';
import { StudentUser } from '../../types';
import { CampusOSLogo } from '../common/CampusOSLogo';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onQuickAction?: (action: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  onStartOnboarding?: () => void;
  onSwitchToAdmin?: () => void;
  user?: StudentUser;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onQuickAction,
  isMobileOpen = false,
  onCloseMobile,
  onLogout,
  onStartOnboarding,
  onSwitchToAdmin,
  user,
}) => {
  const overviewNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const journeyNavItems = [
    { id: 'roadmap', label: 'My Roadmap', icon: Compass },
    { id: 'academic-progress', label: 'Academic Progress', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'experience', label: 'Experience', icon: Briefcase },
  ];

  const careerNavItems = [
    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
  ];

  const assistantNavItems = [
    { id: 'ai-mentor', label: 'Campus GPT', icon: Bot },
    { id: 'github-analyzer', label: 'GitHub Analyzer', icon: GitBranch, comingSoon: true },
    { id: 'linkedin-optimizer', label: 'LinkedIn Optimizer', icon: Linkedin, comingSoon: true },
  ];

  const manageNavItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavGroup = (
    title: string,
    items: { id: string; label: string; icon: React.ElementType; comingSoon?: boolean }[]
  ) => (
    <div>
      <p className="px-2.5 pb-1 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isComingSoon = item.comingSoon;

          return (
            <li key={item.id}>
              <button
                id={`nav-${item.id}`}
                onClick={() => {
                  if (!isComingSoon) {
                    handleItemClick(item.id);
                  }
                }}
                disabled={isComingSoon}
                className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all ${
                  isComingSoon
                    ? 'opacity-60 cursor-not-allowed text-slate-400 bg-transparent hover:bg-slate-50/50'
                    : isActive
                    ? 'border border-[#283593] text-[#283593] font-semibold bg-[#F8FAFF] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isComingSoon
                        ? 'text-slate-400'
                        : isActive
                        ? 'text-[#283593]'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {isComingSoon && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200/70">
                    Soon
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-3.5">
      <div className="flex flex-col">
        {/* CampusOS Brand Header */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => handleItemClick('dashboard')}
            className="w-full flex items-center gap-3 px-1 py-1 rounded-xl text-left bg-transparent hover:bg-transparent cursor-pointer select-none"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
              <CampusOSLogo className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight">
                CampusOS
              </span>
              <span className="text-[9.5px] font-semibold text-slate-400 tracking-wider uppercase leading-tight mt-0.5">
                AI Student OS
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
          {renderNavGroup('Overview', overviewNavItems)}
          {renderNavGroup('My Journey', journeyNavItems)}
          {renderNavGroup('Career', careerNavItems)}
          {renderNavGroup('Assistants', assistantNavItems)}
          {renderNavGroup('Manage', manageNavItems)}
        </nav>
      </div>

      {/* Bottom User / Session Section */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 shrink-0">
        {onSwitchToAdmin && (
          <button
            id="sidebar-admin-switch-btn"
            onClick={onSwitchToAdmin}
            className="flex items-center justify-between w-full rounded-xl bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 px-2.5 py-1.5 text-[11px] font-bold border border-indigo-200/80 transition active:scale-[0.98] cursor-pointer shadow-2xs"
            title="Switch to Institutional Admin Portal"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-600" />
              <span>Admin Portal</span>
            </span>
            <span className="text-[9.5px] font-semibold bg-white text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
              Staff
            </span>
          </button>
        )}
        {onLogout && (
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="flex items-center justify-between w-full rounded-xl bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200/60 transition active:scale-[0.98]"
            title="Log out of your CampusOS account"
          >
            <span className="flex items-center gap-1.5">
              <LogOut className="h-3 w-3" />
              <span>Log Out</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Exit</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="app-sidebar"
        className="hidden md:flex md:w-56 md:flex-col shrink-0 p-3 h-screen sticky top-0"
      >
        <div className="h-full w-full rounded-2xl border border-[#8F9CFE]/80 bg-white shadow-xs overflow-hidden flex flex-col transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            id="sidebar-backdrop"
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white p-2">
            <button
              id="sidebar-close-btn"
              onClick={onCloseMobile}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full overflow-y-auto">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
