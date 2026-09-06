import React, { useRef, useEffect } from 'react';
import { Bell, X, Check, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { AdminNotificationBroadcast } from '../../../types/admin';

interface AdminNotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotificationBroadcast[];
  onNavigateToNotifications?: () => void;
}

export const AdminNotificationsFlyout: React.FC<AdminNotificationsFlyoutProps> = ({
  isOpen,
  onClose,
  notifications,
  onNavigateToNotifications,
}) => {
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={flyoutRef}
      className="absolute right-4 top-16 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#283593]" />
          <h3 className="text-xs font-bold text-slate-900">Admin Notification Center</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-xs"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {notifications.slice(0, 4).map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-3 text-xs space-y-1"
          >
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="font-bold text-[#283593] uppercase">{n.type}</span>
              <span>{n.sentAt}</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{n.title}</p>
            <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
          </div>
        ))}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-[11px] text-slate-400">Broadcasts & Advising Alerts</span>
        <button
          onClick={onClose}
          className="font-bold text-[#283593] hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
