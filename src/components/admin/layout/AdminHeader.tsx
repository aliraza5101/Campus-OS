import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Shield,
  Laptop,
  User,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { AdminUser } from '../../../types/admin';

interface AdminHeaderProps {
  admin: AdminUser;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onSwitchToStudent?: () => void;
  onNavigateTab: (tab: string) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onOpenHelp,
  onOpenSettings,
  onOpenProfile,
  onSwitchToStudent,
  onNavigateTab,
  onLogout,
  unreadCount = 3,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header
      id="admin-header"
      className="flex h-[58px] sm:h-[62px] w-full items-center justify-between rounded-2xl border border-[#8F9CFE]/80 bg-white px-3.5 sm:px-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      {/* Left: Greeting & Mobile menu toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          id="admin-mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#8F9CFE]/60 bg-[#FAFBFD] text-slate-600 hover:bg-[#EEF2FF] hover:border-[#283593] hover:text-[#283593] active:scale-95 md:hidden shadow-2xs transition"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Laptop Icon Badge */}
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-[#283593] text-white shadow-xs ring-1 ring-[#8F9CFE]/30">
          <Laptop className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold leading-tight text-slate-900 tracking-tight truncate">
              {getGreeting()}, Admin
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
              <Shield className="h-2.5 w-2.5" />
              <span>Control Center</span>
            </span>
          </div>
          <p className="hidden xs:block text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            Here's what's happening across CampusOS.
          </p>
        </div>
      </div>

      {/* Right: Search, Status, Notifications, Help, Profile Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Search Bar */}
        <div className="relative">
          <div
            className={`flex items-center rounded-xl border transition-all duration-300 ${
              isSearchFocused
                ? 'border-[#283593] bg-white ring-2 ring-[#283593]/20 shadow-[0_0_12px_rgba(40,53,147,0.15)]'
                : 'border-[#8F9CFE]/60 bg-[#FAFBFD] hover:bg-white hover:border-[#283593]'
            }`}
          >
            <div className="pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 text-slate-400">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <input
              id="admin-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search students, roadmaps..."
              className="w-24 xs:w-36 sm:w-48 md:w-56 py-1.5 pr-2 sm:pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Notifications Button */}
        <button
          id="admin-notifications-btn"
          onClick={onOpenNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#8F9CFE]/60 bg-[#FAFBFD] text-slate-600 transition hover:bg-[#EEF2FF] hover:border-[#283593] hover:text-[#283593] active:scale-95 shadow-2xs hover:shadow-[0_0_12px_rgba(143,156,254,0.4)]"
          aria-label="View admin notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#283593]" />
            </span>
          )}
        </button>

        {/* Help Button */}
        <button
          id="admin-help-btn"
          onClick={onOpenHelp}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[#8F9CFE]/60 bg-[#FAFBFD] text-slate-600 transition hover:bg-[#EEF2FF] hover:border-[#283593] hover:text-[#283593] active:scale-95 shadow-2xs hover:shadow-[0_0_12px_rgba(143,156,254,0.4)]"
          aria-label="Admin Help & Documentation"
          title="Admin Guide & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="admin-profile-btn"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-[#8F9CFE]/60 bg-white p-1 pr-3 hover:border-[#283593] hover:shadow-[0_0_12px_rgba(40,53,147,0.15)] transition active:scale-95 shadow-2xs"
          >
            {admin.avatar ? (
              <img
                src={admin.avatar}
                alt={admin.name}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-[#8F9CFE]/50"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-[#283593] text-white font-bold text-xs shadow-xs ring-2 ring-[#8F9CFE]/50">
                {admin.name
                  ? admin.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AD'}
              </div>
            )}
            <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
              {admin.name.split(' ')[0]}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#8F9CFE]/80 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  if (onOpenProfile) onOpenProfile();
                }}
                className="p-2.5 border-b border-slate-100 mb-1 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition flex items-center gap-3"
              >
                {admin.avatar ? (
                  <img
                    src={admin.avatar}
                    alt={admin.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-200 shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-[#283593] text-white font-bold text-sm shadow-xs shrink-0">
                    {admin.name
                      ? admin.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'AD'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">{admin.name}</p>
                    <span className="text-[9px] font-bold text-[#283593] uppercase">Profile ↗</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{admin.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                      {admin.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {onOpenProfile && (
                  <button
                    id="admin-header-profile-btn"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-[#283593] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-[#283593]" />
                      <span>Profile & Credentials</span>
                    </span>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                      Required
                    </span>
                  </button>
                )}

                <button
                  id="admin-header-logout-btn"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
