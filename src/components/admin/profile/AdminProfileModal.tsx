import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { AdminUser } from '../../../types/admin';
import { uploadApi } from '../../../services/api';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser;
  onUpdateAdmin: (updatedAdmin: AdminUser) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
        const base64 = reader.result as string;
        setAvatar(base64);
        uploadApi.uploadAvatar(base64).catch((err) => console.warn('Avatar upload error:', err));
        showToast('Profile picture updated and saved!');
      };
      reader.readAsDataURL(file);
    }
  };


  const handleRemovePhoto = () => {
    setAvatar('');
    showToast('Profile picture removed');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Name is required');
      return;
    }

    const updatedAdmin: AdminUser = {
      ...admin,
      name,
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
    showToast('Profile saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-top-3">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#283593] text-white shadow-xs">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Faculty & Admin Profile
              </h3>
              <p className="text-xs text-slate-500">
                Manage profile details and campus information.
              </p>
            </div>
          </div>

          <button
            id="btn-close-admin-profile"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 px-6 pt-2 bg-white shrink-0">
          <button
            id="tab-admin-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            id="tab-admin-credentials"
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'border-[#283593] text-[#283593]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Credentials & Password</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROFILE DETAILS & PHOTO */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                <div className="relative group shrink-0">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-200 bg-gradient-to-tr from-blue-600 to-[#283593] shadow-md flex items-center justify-center text-white text-2xl font-extrabold">
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

                  <input
                    type="file"
                    id="modal-admin-profile-avatar-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <label
                    htmlFor="modal-admin-profile-avatar-input"
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#283593] text-white shadow-md cursor-pointer hover:bg-[#1F297E] transition"
                    title="Upload photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-base font-bold text-slate-900">{name}</h4>
                    <span className="rounded-md bg-[#283593] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{department}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label
                      htmlFor="modal-admin-profile-avatar-input"
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1 text-xs font-bold text-[#283593] hover:bg-indigo-50 transition cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload Picture</span>
                    </label>

                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Malik"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@campusos.edu"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Faculty / Division Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Faculty of Computing & Academic Affairs"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Administrative Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminUser['role'])}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Academic Admin">Academic Admin</option>
                    <option value="Career Counselor">Career Counselor</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Office Phone & Direct Extension
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 382-9014 ext 402"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Campus Office Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value)}
                      placeholder="Academic Complex, Hall 4, Suite 310"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Advising & Office Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={officeHours}
                      onChange={(e) => setOfficeHours(e.target.value)}
                      placeholder="Mon - Thu • 10:00 AM - 1:00 PM"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Executive Biography & Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description of your scope and responsibilities..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-[#283593] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS & SECURITY */}
          {activeTab === 'credentials' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                  Faculty Credentials & Codes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Faculty / Staff ID
                    </label>
                    <div className="relative">
                      <FileKey className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                        placeholder="e.g. FAC-COMP-2024-09"
                        className="w-full font-mono uppercase rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-[#283593] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Department Passcode / Approval Code
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={departmentCode}
                        onChange={(e) => setDepartmentCode(e.target.value.toUpperCase())}
                        placeholder="e.g. DEPT-COMP-88"
                        className="w-full font-mono uppercase rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-[#283593] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Management */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#283593]" />
                  <span>Update Password</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#283593] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-save-admin-profile"
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-5 py-2 text-xs font-bold text-white hover:bg-[#1f297e] active:scale-[0.98] transition shadow-xs cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
