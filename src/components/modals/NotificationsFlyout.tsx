import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Sparkles,
  Trophy,
  Target,
  Building2,
  CheckCircle2,
  Inbox,
  Code,
  Award,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationsFlyout: React.FC<NotificationsFlyoutProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case 'roadmap':
        return <Target className="h-4 w-4 text-emerald-500" />;
      case 'opportunity':
        return <Building2 className="h-4 w-4 text-[#283593]" />;
      case 'profile':
        return <Code className="h-4 w-4 text-[#4F46E5]" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div
      id="notifications-flyout"
      className="fixed sm:absolute top-16 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] max-w-sm sm:w-[400px] rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Live Activity Alerts</h4>
            <p className="text-[10.5px] text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-[11px] font-bold text-[#283593] hover:text-blue-800 transition cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2.5">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No Notifications Yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
              When you add skills, projects, certifications, or complete milestones, updates appear here in real time.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkAsRead && n.unread && onMarkAsRead(n.id)}
              className={`relative rounded-xl p-3 text-xs transition border cursor-pointer ${
                n.unread
                  ? 'bg-blue-50/70 border-blue-200/90 shadow-2xs hover:bg-blue-50'
                  : 'bg-[#FAFBFD] border-slate-200/70 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 shadow-2xs mt-0.5">
                  {getIconForType(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`font-bold truncate ${n.unread ? 'text-[#283593]' : 'text-slate-900'}`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                </div>
                {n.unread && (
                  <span className="h-2 w-2 rounded-full bg-[#283593] shrink-0 mt-1" title="Unread" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
