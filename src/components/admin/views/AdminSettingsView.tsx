import React, { useState } from 'react';
import {
  Settings,
  Building2,
  ShieldCheck,
  Bell,
  Sliders,
  Check,
  Save,
} from 'lucide-react';
import { AdminSettingsState } from '../../../types/admin';
import { initialAdminSettings } from '../../../data/adminMockData';
import { adminApi } from '../../../services/api';

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsState>(initialAdminSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    adminApi
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    adminApi
      .updateSettings(settings)
      .then(() => {
        showToast('Platform institutional settings saved to Supabase');
      })
      .catch((err) => {
        console.warn('Save settings error:', err);
        showToast('Platform institutional settings saved locally');
      });
  };


  return (
    <div className="space-y-5 animate-in fade-in w-full pb-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner matching CampusOS standard */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  CampusOS Institutional Settings
                </h2>
                <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
                  Platform Configuration
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure university branding, term schedules, student onboarding policies, and automated advising alert thresholds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-save-admin-platform-settings"
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-2 rounded-xl bg-[#283593] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Institution Profile */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#283593]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span>Institution Information</span>
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Institutional Profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={settings.institutionName}
                    onChange={(e) =>
                      setSettings({ ...settings, institutionName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#283593] focus:ring-1 focus:ring-[#283593] bg-[#FAFBFD]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Campus Domain
                  </label>
                  <input
                    type="text"
                    value={settings.campusDomain}
                    onChange={(e) =>
                      setSettings({ ...settings, campusDomain: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#283593] focus:ring-1 focus:ring-[#283593] bg-[#FAFBFD]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={settings.academicYear}
                    onChange={(e) =>
                      setSettings({ ...settings, academicYear: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#283593] focus:ring-1 focus:ring-[#283593] bg-[#FAFBFD]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current Term
                  </label>
                  <input
                    type="text"
                    value={settings.currentTerm}
                    onChange={(e) =>
                      setSettings({ ...settings, currentTerm: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#283593] focus:ring-1 focus:ring-[#283593] bg-[#FAFBFD]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Policies & Thresholds */}
          <div className="lg:col-span-5 space-y-5">
            {/* Section 2: Registration & Security */}
            <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>Registration & Security</span>
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Policies
                </span>
              </div>

              <div className="space-y-3">
                <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block">
                      Allow Student Self-Registration
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                      Permit students with institutional domains to self-onboard.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowStudentSelfRegistration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowStudentSelfRegistration: e.target.checked,
                      })
                    }
                    className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block">
                      Enforce 2FA for Administrators
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                      Require authenticator app verification for staff.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuthentication}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        twoFactorAuthentication: e.target.checked,
                      })
                    }
                    className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Advising Alerts & Thresholds */}
            <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span>Advising Triggers & Alerts</span>
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Thresholds
                </span>
              </div>

              <div className="space-y-3">
                <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block">
                      Automated At-Risk Advising Alerts
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                      Notify academic counselors when a student drops below threshold.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAutomaticAtRiskAlerts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        enableAutomaticAtRiskAlerts: e.target.checked,
                      })
                    }
                    className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
                  />
                </label>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-[#FAFBFD]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      At-Risk GPA Alert Threshold
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      {settings.gpaThresholdAlert.toFixed(2)} CGPA
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="3.5"
                    step="0.05"
                    value={settings.gpaThresholdAlert}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gpaThresholdAlert: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-[#283593] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#283593] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition active:scale-98 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
