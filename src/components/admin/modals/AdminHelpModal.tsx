import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface AdminHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminHelpModal: React.FC<AdminHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#283593]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Teacher & Admin Quick Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Helpful tips to navigate and view student progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="rounded-xl bg-[#FAFBFD] p-3.5 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-900 block text-[13px]">
              1. Switch Views Anytime
            </span>
            <p className="text-slate-500">
              Easily switch between your Teacher dashboard and what students see on their screens. Use the &quot;Switch to Student View&quot; button at the bottom of the left menu or from the top-right profile icon.
            </p>
          </div>

          <div className="rounded-xl bg-[#FAFBFD] p-3.5 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-900 block text-[13px]">
              2. Check Student Progress & Grades
            </span>
            <p className="text-slate-500">
              Click &quot;Inspect&quot; on any student in the list to see their grades, courses, technical projects, verified skills, and add your own advising notes.
            </p>
          </div>

          <div className="rounded-xl bg-[#FAFBFD] p-3.5 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-900 block text-[13px]">
              3. Try All Features Safely
            </span>
            <p className="text-slate-500">
              You can freely create class announcements, review student job applications, and update statuses. Everything updates instantly right on your screen so you can test anything without worry.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#283593] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F297E] transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
