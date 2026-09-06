import React, { useState } from 'react';
import {
  Users,
  Shield,
  Search,
  Plus,
  Mail,
  Building,
  CheckCircle2,
  Lock,
  UserPlus,
  Download,
} from 'lucide-react';
import { AdminUser, DirectoryStudent } from '../../../types/admin';

interface AdminUsersViewProps {
  adminUsers: AdminUser[];
  students: DirectoryStudent[];
  onSelectStudent: (student: DirectoryStudent) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  adminUsers,
  students,
  onSelectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'admins'>('admins');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Academic Admin' | 'Career Counselor' | 'System Admin'>('Academic Admin');
  const [newAdminDept, setNewAdminDept] = useState('');
  const [adminsList, setAdminsList] = useState<AdminUser[]>(adminUsers);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;
    const newAdmin: AdminUser = {
      id: `adm-00${adminsList.length + 1}`,
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      department: newAdminDept || 'General Administration',
      lastActive: 'Just now',
      status: 'Active',
    };
    setAdminsList([...adminsList, newAdmin]);
    setIsAddAdminOpen(false);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminDept('');
    showToast(`Added ${newAdmin.name} as ${newAdmin.role}`);
  };

  const filteredAdmins = adminsList.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8F9CFE]/80 bg-white p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              User & Role Management
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
              {students.length + adminsList.length} Total Users
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student records and administrative role-based access control (RBAC).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'admins' && (
            <button
              onClick={() => setIsAddAdminOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1F297E] transition active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Administrator</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white rounded-2xl p-2 px-4 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'admins'
                ? 'bg-[#283593] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Administrators ({adminsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'students'
                ? 'bg-[#283593] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Students ({students.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-[#283593] w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Admin Tab Content */}
      {activeTab === 'admins' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                          {admin.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{admin.name}</span>
                          <span className="text-[10.5px] text-slate-400 block">{admin.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                        <Lock className="h-2.5 w-2.5" />
                        <span>{admin.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {admin.department}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {admin.lastActive}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>{admin.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => showToast(`Editing permissions for ${admin.name} (Demo)`)}
                        className="text-xs font-bold text-[#283593] hover:underline"
                      >
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Tab Content */}
      {activeTab === 'students' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.slice(0, 10).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {student.name}
                      <span className="block text-[10.5px] font-normal text-slate-400">
                        {student.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{student.program}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">Semester {student.semester}</td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="rounded-lg bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 text-[11px] font-bold text-[#283593] hover:bg-[#EEF2FF] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add New Administrator
            </h3>
            <p className="text-xs text-slate-500">
              Grant administrative control and set department scope.
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Official University Email
                </label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="name@campusos.edu"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Role Permission Level
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
                >
                  <option value="Academic Admin">Academic Admin (Dean / Advisor)</option>
                  <option value="Career Counselor">Career Counselor (Placement Cell)</option>
                  <option value="System Admin">System Admin (IT Operations)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newAdminDept}
                  onChange={(e) => setNewAdminDept(e.target.value)}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#283593]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E]"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
