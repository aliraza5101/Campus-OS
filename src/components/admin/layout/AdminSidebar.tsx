import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  FileSpreadsheet,
  FileCheck2,
  Shield,
  User,
  X,
  LogOut,
} from 'lucide-react';
import { CampusOSLogo } from '../../common/CampusOSLogo';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToStudent?: () => void;
  onLogout?: () => void;
  studentsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'blue' | 'red' | 'gray' | 'amber' | 'white';
  comingSoon?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onSwitchToStudent,
  onLogout,
  studentsCount,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'student',
      label: 'Students',
      icon: <GraduationCap className="h-4 w-4" />,
      badge: studentsCount !== undefined ? studentsCount.toLocaleString() : undefined,
      badgeVariant: 'gray',
    },
    {
      id: 'analytics',
      label: 'Platform Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: 'profile',
      label: 'Admin Profile',
      icon: <Shield className="h-4 w-4" />,
      badge: 'Tier 1',
      badgeVariant: 'blue',
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: <FileCheck2 className="h-4 w-4" />,
      badge: 'Live',
      badgeVariant: 'amber',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      badge: 'PDF/XLS',
      badgeVariant: 'gray',
    },
  ];

  const isItemActive = (itemId: string) => {
    const clean = activeTab.replace(/^admin-/, '').toLowerCase();
    if (itemId === 'dashboard') return clean === 'dashboard';
    if (itemId === 'student') return clean === 'student' || clean === 'students' || clean === 'users';
    if (itemId === 'profile') return clean === 'profile' || clean === 'credentials';
    if (itemId === 'analytics') {
      return (
        clean === 'analytics' ||
        clean === 'platform-analytics' ||
        clean === 'academic' ||
        clean === 'skills' ||
        clean === 'projects' ||
        clean === 'experience' ||
        clean === 'roadmaps' ||
        clean === 'career'
      );
    }
    if (itemId === 'applications') {
      return clean === 'applications' || clean === 'application' || clean === 'opportunity-applications';
    }
    if (itemId === 'reports') {
      return clean === 'reports' || clean === 'report' || clean === 'application-reports';
    }
    return false;
  };

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3.5 select-none">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="mb-4">
          <div className="w-full flex items-center justify-between px-1 py-1 rounded-xl text-left bg-transparent select-none min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <CampusOSLogo className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight shrink-0">
                    CampusOS
                  </span>
                </div>
                <span className="text-[9.5px] font-semibold text-slate-400 tracking-wider uppercase leading-tight mt-0.5 truncate">
                  Control Center
                </span>
              </div>
            </div>

            {/* Close for mobile drawer */}
            <button
              onClick={onClose}
              className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5">
          <div className="px-2.5 pb-1 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>

          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = isItemActive(item.id);
              const isComingSoon = item.comingSoon;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    if (!isComingSoon) {
                      handleItemClick(item.id);
                    }
                  }}
                  disabled={isComingSoon}
                  className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all duration-200 ${
                    isComingSoon
                      ? 'cursor-not-allowed text-slate-400 bg-slate-50/50 border border-transparent select-none'
                      : isActive
                      ? 'border border-[#283593] text-[#283593] font-semibold bg-[#F8FAFF] shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`transition-colors ${
                        isComingSoon
                          ? 'text-slate-300'
                          : isActive
                          ? 'text-[#283593]'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {isComingSoon ? (
                    <span className="rounded-full bg-slate-100/80 px-2 py-0.5 text-[9px] font-medium text-slate-400 border border-slate-200/60 shrink-0">
                      Soon
                    </span>
                  ) : item.badge ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-bold leading-none shrink-0 ${
                        item.badgeVariant === 'white'
                          ? 'bg-white/20 text-white border border-white/30 select-none shadow-none tracking-wider'
                          : item.badgeVariant === 'amber'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                          : item.badgeVariant === 'blue'
                          ? 'bg-[#283593] text-white'
                          : item.badgeVariant === 'red'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Institution Info & Logout Footer */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 shrink-0">
        {onLogout && (
          <button
            id="btn-admin-logout"
            onClick={onLogout}
            className="flex items-center justify-between w-full rounded-xl bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200/60 transition active:scale-[0.98]"
            title="Log out of Admin Portal"
          >
            <span className="flex items-center gap-1.5">
              <LogOut className="h-3 w-3 text-rose-600" />
              <span>Log Out</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Exit</span>
          </button>
        )}

        <div className="rounded-xl bg-slate-50/80 border border-slate-100/80 p-2 text-center">
          <p className="text-[10px] font-bold text-slate-700 truncate">
            National Univ. of Sciences & Tech
          </p>
          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
            Admin Portal • Fall Term 2026
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        id="admin-desktop-sidebar"
        className="hidden md:flex md:w-56 md:flex-col shrink-0 p-3 h-screen sticky top-0"
      >
        <div className="h-full w-full rounded-2xl border border-[#8F9CFE]/80 bg-white shadow-xs overflow-hidden flex flex-col transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white p-2 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-full overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
