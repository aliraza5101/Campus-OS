import React, { useState } from 'react';
import { X, FolderGit2, Plus } from 'lucide-react';
import { ProjectItem } from '../../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: ProjectItem) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI / Machine Learning');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [status, setStatus] = useState<'In Progress' | 'Completed' | 'Planned'>('In Progress');
  const [progress, setProgress] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const techStack = techStackInput
      ? techStackInput.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Python', 'PyTorch'];

    onAdd({
      id: `proj-${Date.now()}`,
      title,
      category,
      description,
      status,
      progress: status === 'Completed' ? 100 : progress,
      techStack,
    });

    setTitle('');
    setDescription('');
    setTechStackInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#283593]">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Add Project</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-time Object Detection with YOLO"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#283593] focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              >
                <option>AI / Machine Learning</option>
                <option>Computer Vision</option>
                <option>Natural Language Processing</option>
                <option>Full-Stack Web</option>
                <option>Data Science</option>
                <option>Robotics / IoT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. Python, PyTorch, OpenCV, Flask"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#283593] focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brief Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this project demonstrates..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#283593] focus:outline-none"
            />
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
              className="flex items-center gap-1.5 rounded-xl bg-[#283593] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1F297E] active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
