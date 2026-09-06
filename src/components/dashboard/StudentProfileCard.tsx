import React from 'react';
import { ArrowUpRight, GraduationCap, Building, Target } from 'lucide-react';
import { StudentUser } from '../../types';

interface StudentProfileCardProps {
  user: StudentUser;
  onViewProfile: () => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  user,
  onViewProfile,
}) => {
  return (
    <div
      id="card-student-profile"
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.1)] hover:bg-white/95 hover:backdrop-blur-md"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-bold text-slate-900">
            My Profile
          </h3>
          <button
            id="btn-view-profile"
            onClick={onViewProfile}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-[#283593] transition"
          >
            <span>View</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* User Identity - Centered */}
        <div className="flex flex-col items-center justify-center my-3 text-center">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover shadow-xs border-2 border-white ring-2 ring-[#8F9CFE]/60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-[#283593] text-lg font-bold text-white shadow-xs border-2 border-white ring-2 ring-[#8F9CFE]/60">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'ST'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#283593] border-2 border-white" />
          </div>

          <h4 className="text-sm font-bold text-slate-900 mt-2.5">
            {user.name}
          </h4>
          <p className="text-xs font-medium text-[#283593]">
            {user.degree} • Semester {user.semester}
          </p>
        </div>

        {/* Quick Profile Details List */}
        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100/80 text-xs">
          <div className="flex items-start gap-2 text-slate-600">
            <Target className="h-4 w-4 text-[#283593] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10.5px] text-slate-400 block">Career Goal</span>
              <span className="font-semibold text-slate-800">{user.careerGoal}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Building className="h-4 w-4 text-[#283593] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10.5px] text-slate-400 block">University</span>
              <span className="font-medium text-slate-800">{user.university}</span>
            </div>
          </div>
        </div>

        {/* Profile Completion indicator */}
        <div className="mt-4 rounded-xl bg-[#FAFBFD] border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Profile Completion</span>
            <span className="font-bold text-slate-900">{user.profileCompletion}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#283593] transition-all duration-500 ease-out"
              style={{ width: `${user.profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Profile Action Button */}
      <div className="mt-5">
        <button
          id="btn-see-profile-action"
          onClick={onViewProfile}
          className="w-full rounded-full bg-[#283593] py-2.5 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1F297E] active:scale-[0.99]"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};
