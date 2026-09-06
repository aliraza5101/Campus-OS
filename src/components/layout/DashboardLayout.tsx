import React, { ReactNode, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StudentUser } from '../../types';

interface DashboardLayoutProps {
  children: ReactNode;
  user: StudentUser;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onQuickAction?: (action: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  unreadCount?: number;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
  onStartOnboarding?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  activeTab,
  onSelectTab,
  onQuickAction,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onOpenSettings,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  unreadCount,
  onSwitchToAdmin,
  onLogout,
  onStartOnboarding,
}) => {
  const mainContentRef = useRef<HTMLElement>(null);

  // Automatically scroll main content to top when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F8] text-slate-800 font-sans antialiased">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onQuickAction={onQuickAction}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={onLogout}
        onStartOnboarding={onStartOnboarding}
        user={user}
      />

      {/* Main App Container */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header (Floating matched card) */}
        <div className="shrink-0 z-30 pt-3 pr-3 pl-3 md:pl-0 pb-2">
          <Header
            user={user}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onOpenNotifications={onOpenNotifications}
            onOpenSettings={onOpenSettings}
            onNavigateProfile={() => onSelectTab('profile')}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            unreadCount={unreadCount}
            onSwitchToAdmin={onSwitchToAdmin}
            onLogout={onLogout}
            onStartOnboarding={onStartOnboarding}
          />
        </div>

        {/* Dynamic Main Body Content with scrollbar starting strictly BELOW the navbar */}
        <main
          ref={mainContentRef}
          id="main-content-scroll"
          className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-0 md:pr-3 py-1 sm:py-2 focus:outline-none"
        >
          <div className="max-w-[1600px] w-full mx-auto pb-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

