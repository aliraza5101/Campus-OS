import React, { useState, useRef, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminUser } from '../../../types/admin';

interface AdminLayoutProps {
  admin: AdminUser;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSwitchToStudent?: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  studentsCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  admin,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onSwitchToStudent,
  onOpenNotifications,
  onOpenHelp,
  onOpenSettings,
  onOpenProfile,
  onLogout,
  unreadNotificationsCount = 3,
  studentsCount,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Automatically scroll main content to top when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F8] text-slate-800 font-sans antialiased selection:bg-[#283593] selection:text-white">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onSwitchToStudent={onSwitchToStudent}
        onLogout={onLogout}
        studentsCount={studentsCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Admin Header (Floating matched card) */}
        <div className="shrink-0 z-30 pt-3 pr-3 pl-3 md:pl-0 pb-2">
          <AdminHeader
            admin={admin}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onOpenNotifications={onOpenNotifications}
            onOpenHelp={onOpenHelp}
            onOpenSettings={onOpenSettings}
            onOpenProfile={onOpenProfile}
            onSwitchToStudent={onSwitchToStudent}
            onNavigateTab={onSelectTab}
            onLogout={onLogout}
            unreadCount={unreadNotificationsCount}
          />
        </div>

        {/* Dynamic Admin View Container with scrollbar starting strictly BELOW the navbar */}
        <main
          ref={mainContentRef}
          id="admin-main-content-scroll"
          className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-0 md:pr-3 py-1 sm:py-2 focus:outline-none"
        >
          <div className="max-w-[1600px] w-full mx-auto pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

