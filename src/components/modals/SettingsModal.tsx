import React, { useState } from 'react';
import { X, Settings, User, RotateCcw, LogOut, Sparkles } from 'lucide-react';
import { StudentUser } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StudentUser;
  onUpdateUser: (updated: Partial<StudentUser>) => void;
  onStartOnboarding?: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onStartOnboarding,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [degree, setDegree] = useState(user.degree);
  const [careerGoal, setCareerGoal] = useState(user.careerGoal);
  const [university, setUniversity] = useState(user.university);
  const [email, setEmail] = useState(user.email);
  const [location, setLocation] = useState(user.location || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, degree, careerGoal, university, email, location });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">CampusOS Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Degree / Program
            </label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Career Goal
            </label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              University
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              />
            </div>
          </div>

          {/* Session & Onboarding Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Session & Onboarding
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {onStartOnboarding && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartOnboarding();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-bold text-[#283593] hover:bg-blue-100 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart Onboarding</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#283593] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98]"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
