import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, Settings, GraduationCap, Shield } from 'lucide-react';
import { StudentUser } from '../../types';

interface HeaderProps {
  user: StudentUser;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenSettings?: () => void;
  onNavigateProfile?: () => void;
  onOpenMobileMenu: () => void;
  unreadCount?: number;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
  onStartOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenNotifications,
  onOpenSettings,
  onNavigateProfile,
  onOpenMobileMenu,
  unreadCount = 2,
  onSwitchToAdmin,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="app-header"
      className="flex h-[58px] sm:h-[62px] w-full items-center justify-between rounded-2xl border border-[#8F9CFE]/80 bg-white px-3.5 sm:px-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Left: Mobile Toggle & Desktop Workspace Info */}
      <div className="flex items-center gap-2.5 min-w-0 md:flex-1">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#8F9CFE]/60 bg-[#FAFBFD] text-slate-600 hover:bg-[#EEF2FF] hover:border-[#283593] hover:text-[#283593] active:scale-95 md:hidden shadow-2xs transition"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Laptop / Desktop Workspace Info (Left Aligned with Icon) */}
        <div className="hidden md:flex items-center gap-2.5 min-w-0">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-sm font-bold text-slate-900 leading-tight truncate">
              {user.name ? `${user.name} Workspace` : 'Student Workspace'}
            </span>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[340px] leading-tight mt-0.5">
              {user.degree || 'BS Artificial Intelligence'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Center Workspace Info (Centered only on small/mobile screens) */}
      <div className="flex md:hidden flex-col items-center justify-center text-center min-w-0 px-2 flex-1">
        <span className="text-xs sm:text-[13.5px] font-bold text-slate-900 leading-tight truncate">
          {user.name ? `${user.name} Workspace` : 'Student Workspace'}
        </span>
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[190px] leading-tight mt-0.5">
          {user.degree || 'BS Artificial Intelligence'}
        </p>
      </div>

      {/* Right: Notifications, Admin Switcher & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end">
        {/* Admin Portal Quick Switcher Button */}
        {onSwitchToAdmin && (
          <button
            id="header-switch-to-admin-btn"
            type="button"
            onClick={onSwitchToAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/90 text-xs font-bold text-[#283593] hover:bg-indigo-100 hover:border-indigo-300 transition active:scale-95 shadow-2xs cursor-pointer"
            title="Switch to Institutional Admin Portal"
          >
            <Shield className="h-3.5 w-3.5 text-[#283593]" />
            <span className="hidden sm:inline">Admin Portal</span>
          </button>
        )}

        {/* Notification Bell Button (Circular) */}
        <button
          id="header-notifications-btn"
          onClick={onOpenNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#8F9CFE]/60 bg-[#FAFBFD] text-slate-600 transition hover:bg-[#EEF2FF] hover:border-[#283593] hover:text-[#283593] active:scale-95 shadow-2xs"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#283593]" />
            </span>
          )}
        </button>

        {/* User Profile Circular Photo Button */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="header-user-avatar-btn"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8F9CFE]/80 p-0.5 transition-all duration-200 hover:border-[#283593] hover:shadow-[0_4px_12px_rgba(40,53,147,0.15)] active:scale-95 shadow-xs bg-white"
            title={`${user.name} - Account Menu`}
          >
            {user.avatar && !imageError ? (
              <img
                src={user.avatar}
                alt={user.name}
                onError={() => setImageError(true)}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#283593] text-white font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#8F9CFE]/80 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10.5px] text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1.5 text-[9.5px] font-semibold text-[#283593] bg-[#EEF2FF] px-1.5 py-0.5 rounded border border-[#C7D2FE]">
                  {user.degree}
                </span>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  id="header-menu-profile-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onNavigateProfile) {
                      onNavigateProfile();
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EEF2FF] hover:text-[#283593] rounded-xl transition text-left"
                >
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>Profile</span>
                </button>

                <button
                  id="header-menu-settings-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenSettings) {
                      onOpenSettings();
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EEF2FF] hover:text-[#283593] rounded-xl transition text-left"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-500" />
                  <span>Settings</span>
                </button>

                {onSwitchToAdmin && (
                  <button
                    id="header-menu-admin-btn"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchToAdmin();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-[#283593] bg-indigo-50/70 hover:bg-indigo-100 rounded-xl transition text-left cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5 text-[#283593]" />
                    <span>Admin Portal</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    id="header-menu-logout-btn"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
