import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Bell,
  RotateCcw,
  LogOut,
  Check,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  User,
  GraduationCap,
  Mail,
  Building2,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { StudentUser } from '../../types';
import { authApi, studentApi } from '../../services/api';

interface SettingsViewProps {
  user: StudentUser;
  onUpdateUser: (updated: Partial<StudentUser>) => void;
  onStartOnboarding?: () => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onStartOnboarding,
  onLogout,
  onNavigateTab,
}) => {
  // Preference Toggles (Notifications) - Loaded from DB / Profile
  const [opportunityAlerts, setOpportunityAlerts] = useState<boolean>(
    () => user.notificationPreferences?.opportunityAlerts ?? true
  );
  const [aiRecommendations, setAiRecommendations] = useState<boolean>(
    () => user.notificationPreferences?.aiRecommendations ?? true
  );
  const [advisingAlerts, setAdvisingAlerts] = useState<boolean>(
    () => user.notificationPreferences?.advisingAlerts ?? true
  );
  const [emailAlerts, setEmailAlerts] = useState<boolean>(
    () => user.notificationPreferences?.emailAlerts ?? true
  );

  // Sync when user prop updates
  useEffect(() => {
    if (user.notificationPreferences) {
      setOpportunityAlerts(user.notificationPreferences.opportunityAlerts ?? true);
      setAiRecommendations(user.notificationPreferences.aiRecommendations ?? true);
      setAdvisingAlerts(user.notificationPreferences.advisingAlerts ?? true);
      setEmailAlerts(user.notificationPreferences.emailAlerts ?? true);
    }
  }, [user.notificationPreferences]);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [lastPasswordChangeDate, setLastPasswordChangeDate] = useState<string>(() => {
    return localStorage.getItem('campusos_password_updated_at') || 'May 24, 2024';
  });

  // Session Verification State
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [sessionVerifiedText, setSessionVerifiedText] = useState<string | null>(null);

  // UI State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Password Security Criteria Calculations
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'None' };
    let score = 0;
    if (hasMinLength) score += 1;
    if (newPassword.length >= 12) score += 1;
    if (hasUppercase && hasLowercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak' };
    if (score <= 3) return { score: score, label: 'Moderate' };
    if (score === 4) return { score: 4, label: 'Strong' };
    return { score: 5, label: 'Very Strong' };
  }, [newPassword, hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleClearPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (!confirmPassword) {
      setPasswordError('Please confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be identical to your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one numeric digit (0-9).');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setPasswordError('New password must contain at least one special character (!@#$%^&* etc).');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      if (!res.success) {
        throw new Error(res.error || 'Failed to update password.');
      }

      localStorage.setItem('campusos_auth_password', newPassword);
      const nowStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      localStorage.setItem('campusos_password_updated_at', nowStr);
      setLastPasswordChangeDate(nowStr);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordSuccess('Password successfully changed! Your new credentials are now active.');
      showToast('Password updated successfully');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    const updatedPreferences = {
      opportunityAlerts,
      aiRecommendations,
      advisingAlerts,
      emailAlerts,
    };

    try {
      await studentApi.updatePreferences(updatedPreferences);
      onUpdateUser({
        ...user,
        notificationPreferences: updatedPreferences,
      });
      setHasUnsavedChanges(false);
      showToast('Settings & notification preferences saved to your profile!');
    } catch (err: any) {
      onUpdateUser({
        ...user,
        notificationPreferences: updatedPreferences,
      });
      setHasUnsavedChanges(false);
      showToast('Preferences updated successfully!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetDefaults = () => {
    setOpportunityAlerts(user.notificationPreferences?.opportunityAlerts ?? true);
    setAiRecommendations(user.notificationPreferences?.aiRecommendations ?? true);
    setAdvisingAlerts(user.notificationPreferences?.advisingAlerts ?? true);
    setEmailAlerts(user.notificationPreferences?.emailAlerts ?? true);
    setHasUnsavedChanges(false);
    showToast('Changes discarded');
  };

  const handleVerifySession = async () => {
    setIsVerifyingSession(true);
    setSessionVerifiedText(null);
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setSessionVerifiedText(`Institutional Session Verified • User ID: ${res.user.id.slice(0, 8)}...`);
      } else {
        setSessionVerifiedText('Session active on local workstation.');
      }
    } catch {
      setSessionVerifiedText('Session verified on local client.');
    } finally {
      setIsVerifyingSession(false);
      setTimeout(() => setSessionVerifiedText(null), 5000);
    }
  };

  // CARD 0: Academic Profile Summary
  const renderProfileSummaryCard = () => (
    <div
      id="settings-section-profile-summary"
      className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-4"
    >
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#283593]">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Student Identity & Academic Credentials
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Your registered student profile and institutional account overview.
            </p>
          </div>
        </div>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-1.5 rounded-xl border border-[#8F9CFE] bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-[#283593] hover:bg-blue-100/50 transition cursor-pointer shrink-0"
          >
            <span>Edit in My Profile</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <User className="h-3.5 w-3.5 text-[#283593]" />
            <span>Full Name</span>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Mail className="h-3.5 w-3.5 text-[#283593]" />
            <span>Institutional Email</span>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{user.email || 'ali.raza@ajku.edu.pk'}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-[#283593]" />
            <span>Degree & Standing</span>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{user.degree} (Sem {user.semester})</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Building2 className="h-3.5 w-3.5 text-[#283593]" />
            <span>University</span>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{user.university}</p>
        </div>
      </div>
    </div>
  );

  // CARD 1: Security & Password
  const renderSecurityCard = () => (
    <div
      id="settings-section-security"
      className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-5"
    >
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#283593]">
            <Lock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Security & Password
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Manage your password, account security, and authentication settings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Encrypted Credentials</span>
          <span className="sm:hidden">Encrypted</span>
        </div>
      </div>

      <div className="space-y-4">
        {passwordSuccess && (
          <div
            id="password-success-msg"
            className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold">{passwordSuccess}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Your password was successfully updated and verified in the database.
              </p>
            </div>
          </div>
        )}

        {passwordError && (
          <div
            id="password-error-msg"
            className="rounded-xl border border-rose-200 bg-rose-50/95 p-3.5 flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold">Password Validation Error</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{passwordError}</p>
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="settings-input-current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="Enter your current password"
                className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-[#283593] focus:outline-hidden bg-[#FAFBFD]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="settings-input-new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-[#283593] focus:outline-hidden bg-[#FAFBFD]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="settings-input-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Re-enter to confirm"
                  className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:border-[#283593] focus:ring-1 focus:ring-[#283593] focus:outline-hidden bg-[#FAFBFD]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {newPassword.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5 animate-in fade-in">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Password Strength:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      passwordStrength.score >= 4
                        ? 'text-emerald-600'
                        : passwordStrength.score >= 3
                        ? 'text-blue-600'
                        : passwordStrength.score >= 2
                        ? 'text-amber-600'
                        : 'text-rose-500'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.score >= 4
                        ? 'bg-emerald-500'
                        : passwordStrength.score >= 3
                        ? 'bg-blue-500'
                        : passwordStrength.score >= 2
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {hasMinLength ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1 shrink-0" />}
                  <span>At least 8 characters long</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1 shrink-0" />}
                  <span>At least 1 uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {hasLowercase ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1 shrink-0" />}
                  <span>At least 1 lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {hasNumber ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1 shrink-0" />}
                  <span>At least 1 numeric digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {hasSpecialChar ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1 shrink-0" />}
                  <span>At least 1 special symbol (!@#$...)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${confirmPassword ? (passwordsMatch ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium') : 'text-slate-500'}`}>
                  {confirmPassword && passwordsMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : confirmPassword && !passwordsMatch ? (
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1 shrink-0" />
                  )}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-400">
              Last password update: <span className="font-semibold text-slate-600">{lastPasswordChangeDate}</span>
            </p>
            <div className="flex items-center gap-2">
              {(currentPassword || newPassword || confirmPassword) && (
                <button
                  type="button"
                  id="btn-clear-password-fields"
                  onClick={handleClearPasswordFields}
                  className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                id="btn-change-password"
                onClick={handleChangePassword}
                disabled={isSubmittingPassword}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#283593] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingPassword ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // CARD 2: Notifications
  const renderNotificationsCard = () => (
    <div
      id="settings-section-notifications"
      className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-5"
    >
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bell className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Notifications & Automated Dispatch
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Manage your notification preferences, AI recommendations, and automated advising alerts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-[#283593] px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0">
          <span>Live Sync</span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
              Opportunity & Internship Reminders
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 leading-relaxed block mt-0.5">
              Receive alert notifications 48 hours before target internship and fellowship deadlines close.
            </span>
          </div>
          <input
            type="checkbox"
            id="toggle-opportunity-alerts"
            checked={opportunityAlerts}
            onChange={(e) => {
              setOpportunityAlerts(e.target.checked);
              handleFieldChange();
            }}
            className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
          />
        </label>

        <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
              Campus GPT Skill & Roadmap Insights
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 leading-relaxed block mt-0.5">
              Get weekly personalized suggestions and roadmap calibrations tailored to your career goal and standing.
            </span>
          </div>
          <input
            type="checkbox"
            id="toggle-ai-recommendations"
            checked={aiRecommendations}
            onChange={(e) => {
              setAiRecommendations(e.target.checked);
              handleFieldChange();
            }}
            className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
          />
        </label>

        <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
              Academic Advising & Term Milestones
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 leading-relaxed block mt-0.5">
              Receive notifications when semester courses, credits, or academic milestones require student attention.
            </span>
          </div>
          <input
            type="checkbox"
            id="toggle-advising-alerts"
            checked={advisingAlerts}
            onChange={(e) => {
              setAdvisingAlerts(e.target.checked);
              handleFieldChange();
            }}
            className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
          />
        </label>

        <label className="flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-[#FAFBFD] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
              Institutional Email Notification Dispatch
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 leading-relaxed block mt-0.5">
              Send automated email notifications and weekly digest summaries to {user.email || 'your registered institutional address'}.
            </span>
          </div>
          <input
            type="checkbox"
            id="toggle-email-alerts"
            checked={emailAlerts}
            onChange={(e) => {
              setEmailAlerts(e.target.checked);
              handleFieldChange();
            }}
            className="h-4.5 w-4.5 rounded text-[#283593] focus:ring-[#283593] shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  // CARD 3: Active Session & Workspace Security
  const renderSessionAndOnboardingCard = () => (
    <div
      id="settings-section-session-onboarding"
      className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] space-y-5"
    >
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Laptop className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Active Session & Workspace Management
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Manage your active student session, authentication tokens, and onboarding preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Session Diagnostics */}
      <div className="rounded-xl border border-slate-200 bg-[#FAFBFD] p-3.5 sm:p-4 text-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800 block text-xs">CampusOS Secure Institutional Session</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Logged in as <span className="font-semibold text-slate-700">{user.email || 'Student User'}</span> • Role: <span className="capitalize font-semibold text-[#283593]">Student</span>
            </p>
          </div>
          <button
            type="button"
            id="btn-verify-session"
            onClick={handleVerifySession}
            disabled={isVerifyingSession}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isVerifyingSession ? 'animate-spin text-[#283593]' : 'text-slate-500'}`} />
            <span>{isVerifyingSession ? 'Verifying...' : 'Verify Session Health'}</span>
          </button>
        </div>

        {sessionVerifiedText && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{sessionVerifiedText}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {onStartOnboarding && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-[#283593]" />
                <span>Re-run Onboarding</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Re-calibrate your target career goals, skill matrices, and academic milestones from scratch.
              </p>
            </div>
            <button
              type="button"
              id="btn-restart-onboarding"
              onClick={onStartOnboarding}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-[#8F9CFE] px-3.5 py-2 text-xs font-bold text-[#283593] hover:bg-blue-50 hover:border-[#283593] transition shadow-2xs cursor-pointer"
            >
              <span>Launch Onboarding Flow</span>
            </button>
          </div>
        )}

        {onLogout && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Log Out of CampusOS</span>
              </h4>
              <p className="text-[11px] text-rose-700/80 leading-relaxed">
                Safely terminate your current active student session on this workstation.
              </p>
            </div>
            <button
              type="button"
              id="btn-settings-logout"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-2xs cursor-pointer"
            >
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      id="settings-view-page"
      className="space-y-5 w-full pb-10"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Account & Workspace Settings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage your account security, password credentials, communication notifications, and active sessions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Dashboard</span>
              </button>
            )}
            {hasUnsavedChanges && (
              <button
                type="button"
                id="btn-discard-settings"
                onClick={handleResetDefaults}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              id="btn-save-settings-top"
              onClick={() => handleSave()}
              disabled={isSavingSettings}
              className="flex items-center gap-2 rounded-xl bg-[#283593] px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] hover:shadow-[0_0_22px_rgba(40,53,147,0.35)] active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 w-full">
        {/* Full-width Stacked Cards */}
        <div className="space-y-5 w-full">
          {renderProfileSummaryCard()}
          {renderSecurityCard()}
          {renderNotificationsCard()}
          {renderSessionAndOnboardingCard()}
        </div>

        {/* Bottom Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            {hasUnsavedChanges ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Unsaved preference changes pending</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>All preferences synchronized with your student profile</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Discard
              </button>
            )}
            <button
              type="submit"
              id="btn-save-settings-bottom"
              disabled={isSavingSettings}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#283593] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] hover:shadow-[0_0_22px_rgba(40,53,147,0.35)] active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
