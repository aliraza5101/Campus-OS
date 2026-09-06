import React, { useState } from 'react';
import {
  User,
  Camera,
  Upload,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Building2,
  Save,
  Check,
  KeyRound,
  FileKey,
  Lock,
  Loader2,
} from 'lucide-react';
import { AdminUser } from '../../../types/admin';
import { adminApi } from '../../../services/api';

interface AdminProfileViewProps {
  admin: AdminUser;
  onUpdateAdmin: (updatedAdmin: AdminUser) => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  admin,
  onUpdateAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'credentials'>('profile');

  // Editable Profile Information
  const [avatar, setAvatar] = useState<string>(
    admin.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
  );
  const [name, setName] = useState(admin.name || 'Dr. Sarah Malik');
  const [email, setEmail] = useState(admin.email || 'admin@campusos.edu');
  const [department, setDepartment] = useState(admin.department || 'Faculty of Computing & Academic Affairs');
  const [role, setRole] = useState(admin.role || 'Super Admin');
  const [phone, setPhone] = useState(admin.phone || '+1 (555) 382-9014 ext 402');
  const [officeLocation, setOfficeLocation] = useState(admin.officeLocation || 'Academic Complex, Hall 4, Suite 310');
  const [officeHours, setOfficeHours] = useState(admin.officeHours || 'Mon - Thu • 10:00 AM - 1:00 PM');
  const [bio, setBio] = useState(
    admin.bio ||
      'Lead Administrator & Academic Dean overseeing undergraduate student career roadmaps, degree audits, curriculum alignment, and institutional analytics.'
  );

  // Credentials
  const [staffId, setStaffId] = useState(admin.staffId || admin.credentials?.staffId || 'FAC-COMP-2024-09');
  const [departmentCode, setDepartmentCode] = useState(admin.credentials?.verifiedDepartmentCode || 'DEPT-COMP-88');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Profile Picture Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        showToast('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    showToast('Profile picture removed');
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      showToast('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await adminApi.updateProfile({
        name: name.trim(),
        avatar,
        department,
        role,
        phone,
        officeLocation,
        officeHours,
        bio,
      });

      if (res.success) {
        const updatedAdmin: AdminUser = {
          ...admin,
          name: name.trim(),
          email,
          avatar,
          department,
          role,
          phone,
          officeLocation,
          officeHours,
          bio,
          staffId,
          credentials: admin.credentials
            ? {
                ...admin.credentials,
                staffId,
                verifiedDepartmentCode: departmentCode,
              }
            : undefined,
        };
        onUpdateAdmin(updatedAdmin);
        showToast('Profile changes saved to PostgreSQL database!');
      } else {
        showToast(res.error || 'Failed to update profile');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast('Current password is required');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await adminApi.updatePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Admin password updated and secured in database!');
      } else {
        showToast(res.error || 'Failed to update password');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in w-full pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#283593] text-white shadow-xs">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Faculty & Administrator Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your profile photo, campus contact details, and faculty credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-save-admin-profile-view"
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveProfile()}
              className="flex items-center gap-2 rounded-xl bg-[#283593] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header & Picture Upload Card */}
      <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Picture with Camera Upload Button */}
          <div className="relative group shrink-0">
            <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-gradient-to-tr from-blue-600 to-[#283593] shadow-md flex items-center justify-center text-white text-3xl font-extrabold">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span>
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'AD'}
                </span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              id="admin-profile-avatar-input"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Camera Overlay Icon */}
            <label
              htmlFor="admin-profile-avatar-input"
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#283593] text-white shadow-lg cursor-pointer hover:bg-[#1F297E] hover:scale-105 transition"
              title="Upload new profile picture"
            >
              <Camera className="h-4.5 w-4.5" />
            </label>
          </div>

          {/* Profile Quick Info & Upload Actions */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                <span className="rounded-md bg-[#283593] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  {role}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#283593]">{department}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff ID: <span className="font-mono font-bold text-slate-800">{staffId}</span> • {email}
              </p>
            </div>

            {/* Photo Upload Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <label
                htmlFor="admin-profile-avatar-input"
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold text-[#283593] hover:bg-indigo-100/80 transition cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload New Picture</span>
              </label>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Picture</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#283593] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Faculty & Profile Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'credentials'
              ? 'bg-[#283593] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>Credentials & Security</span>
        </button>
      </div>

      {/* Main Form Content */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        {/* TAB 1: FACULTY PROFILE INFO */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
              Personal & Campus Contact Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Malik"
                  className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@campusos.edu"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Division / Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Faculty of Computing & Academic Affairs"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrative Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminUser['role'])}
                  className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Academic Admin">Academic Admin</option>
                  <option value="Career Counselor">Career Counselor</option>
                  <option value="System Admin">System Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Office Phone & Direct Extension
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 382-9014 ext 402"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Office Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    placeholder="Academic Complex, Hall 4, Suite 310"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Advising & Office Hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    placeholder="Mon - Thu • 10:00 AM - 1:00 PM"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Bio & Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summary of responsibilities and academic focus..."
                  className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] p-3 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CREDENTIALS & ACCOUNT SECURITY */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
                Faculty Identification & Department Codes
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty / Staff ID
                  </label>
                  <div className="relative">
                    <FileKey className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                      placeholder="e.g. FAC-COMP-2024-09"
                      className="w-full font-mono uppercase rounded-xl border border-slate-200 bg-[#FAFBFD] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department Passcode / Approval Code
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DEPT-COMP-88"
                      className="w-full font-mono uppercase rounded-xl border border-slate-200 bg-[#FAFBFD] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="rounded-2xl border border-[#8F9CFE]/80 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#283593]" />
                <span>Account Password</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#283593]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isUpdatingPassword || !currentPassword || !newPassword}
                  onClick={handleUpdatePassword}
                  className="flex items-center gap-2 rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
