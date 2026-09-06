import React, { useState } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Link,
  Layers,
  Cpu,
} from 'lucide-react';
import { IntegrationCardItem } from '../../../types/admin';

interface AdminIntegrationsViewProps {
  integrations: IntegrationCardItem[];
}

export const AdminIntegrationsView: React.FC<AdminIntegrationsViewProps> = ({
  integrations,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
              Integrations & Enterprise Connectors
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-[#283593]">
              {integrations.length} Connectors Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect university LMS/SIS transcript databases, GitHub repositories, LinkedIn alumni networks, and Google Gemini AI.
          </p>
        </div>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#8F9CFE]/80 transition group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-[#283593]">
                  {item.category}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    item.status === 'Connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Demo Mode'
                      ? 'bg-indigo-100 text-indigo-800'
                      : item.status === 'Coming Soon'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#283593] transition">
                {item.name}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10.5px] text-slate-400 truncate max-w-[170px]">
                {item.configSummary}
              </span>

              <button
                onClick={() => showToast(`Configuring ${item.name} connector (Simulated)`)}
                className="rounded-lg bg-indigo-50 border border-indigo-200/60 px-3 py-1.5 text-xs font-bold text-[#283593] hover:bg-[#EEF2FF] transition active:scale-95 shadow-xs"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
