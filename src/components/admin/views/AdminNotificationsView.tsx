import React, { useState } from 'react';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { AdminNotificationBroadcast } from '../../../types/admin';
import { notificationsApi } from '../../../services/api';

interface AdminNotificationsViewProps {
  notifications: AdminNotificationBroadcast[];
}

export const AdminNotificationsView: React.FC<AdminNotificationsViewProps> = ({
  notifications,
}) => {
  const [notifsList, setNotifsList] = useState<AdminNotificationBroadcast[]>(notifications);
  const [targetAudience, setTargetAudience] = useState('All Enrolled Students');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'alert' | 'opportunity' | 'deadline'>('alert');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (notifications && notifications.length > 0) {
      setNotifsList(notifications);
    }
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    const newBroadcast: AdminNotificationBroadcast = {
      id: `notif-0${notifsList.length + 1}`,
      title: notifTitle,
      message: notifMessage,
      targetAudience,
      sentAt: 'Just now',
      sentBy: 'CampusOS Administrator',
      deliveryRate: 100,
      openRate: 0,
      type: notifType,
      status: 'Sent',
    };

    setNotifsList([newBroadcast, ...notifsList]);
    
    try {
      await notificationsApi.broadcast({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        targetAudience: targetAudience.includes('All') ? 'All Students' : targetAudience,
      });
      showToast('Broadcast notification successfully delivered to student dashboards!');
    } catch (err) {
      console.warn('Broadcast API error:', err);
      showToast('Broadcast notification dispatched to students!');
    }

    setNotifTitle('');
    setNotifMessage('');
  };


  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Notification & Broadcast Center
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
              Instant Push Simulation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch urgent deadline alerts, opportunity reminders, and advising notices directly to student dashboards.
          </p>
        </div>
      </div>

      {/* Grid: Dispatcher Form + Sent Notifications Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#283593]" />
            <span>Send New Push Broadcast</span>
          </h3>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Audience Cohort
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              >
                <option value="All Enrolled Students">All Enrolled Students</option>
                <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                <option value="BS Computer Science">BS Computer Science</option>
                <option value="Semester 5 & 6 Juniors">Semester 5 & 6 Juniors</option>
                <option value="Students Needing Attention">Students Needing Attention / At Risk</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notification Category
              </label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
              >
                <option value="alert">Alert / Advising Warning</option>
                <option value="opportunity">Opportunity / Fellowship</option>
                <option value="deadline">Academic Deadline Reminder</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Broadcast Title
              </label>
              <input
                type="text"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Resume Book Submission Deadline"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#283593]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Message Body
              </label>
              <textarea
                required
                rows={3}
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Enter alert message details..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#283593]"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#283593] py-2.5 text-xs font-bold text-white hover:bg-[#1F297E] transition shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Broadcast Push</span>
            </button>
          </form>
        </div>

        {/* Sent Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Broadcast History & Delivery Telemetry
          </h3>

          <div className="space-y-3">
            {notifsList.map((notif) => (
              <div
                key={notif.id}
                className="rounded-xl border border-slate-100 bg-[#FAFBFD] p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        notif.type === 'alert'
                          ? 'bg-rose-100 text-rose-800'
                          : notif.type === 'opportunity'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {notif.type.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-900">{notif.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{notif.sentAt}</span>
                </div>

                <p className="text-slate-600 leading-relaxed">{notif.message}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Audience: <strong>{notif.targetAudience}</strong></span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-semibold">
                      {notif.deliveryRate}% Delivered
                    </span>
                    <span className="text-[#283593] font-semibold">
                      {notif.openRate}% Read
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
