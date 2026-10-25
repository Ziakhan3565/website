import React, { useState } from 'react';
import {
  FolderDown,
  Download,
  FileText,
  Search,
  Filter,
  Lock,
  Plus,
  Trash2
} from 'lucide-react';
import type { LearningMaterial } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface LearningMaterialsViewProps {
  materials: LearningMaterial[];
  onOpenCreateMaterial?: () => void;
  onDeleteMaterial?: (id: string) => void;
}

export const LearningMaterialsView: React.FC<LearningMaterialsViewProps> = ({
  materials,
  onOpenCreateMaterial,
  onDeleteMaterial,
}) => {
  const { user, isAdmin, isPremium, upgradeTier } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#10a37f]/15 border border-[#10a37f]/30 text-[#19c37d] text-xs font-mono mb-2">
              <FolderDown className="w-3.5 h-3.5" /> REPOSITORY & DESK DOWNLOADS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Courses & Learning Materials
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Download institutional trade logs, position size spreadsheets, CVD order flow cheatsheets, and comprehensive strategy playbooks compiled by the Course Crash trading team.
            </p>
          </div>

          {isAdmin && onOpenCreateMaterial && (
            <button
              onClick={onOpenCreateMaterial}
              className="px-4 py-2.5 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, spreadsheets, cheatsheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#171717] border border-[#2a2a2a] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#10a37f]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#171717] p-1 rounded-lg border border-[#2a2a2a] text-xs font-mono overflow-x-auto">
          {['All', 'PDF Guide', 'Cheat Sheet', 'Spreadsheet', 'Strategy Playbook'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                typeFilter === t ? 'bg-[#10a37f] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat) => {
          const isLocked = mat.tier === 'premium' && !isPremium;

          return (
            <div
              key={mat.id}
              className="p-5 rounded-xl bg-[#171717] border border-[#2a2a2a] hover:border-[#10a37f]/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10a37f]/10 text-[#19c37d] border border-[#10a37f]/30">
                    {mat.type} · {mat.category}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {mat.fileSize}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1">
                  {mat.title}
                </h3>

                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  {mat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-neutral-500">
                  {mat.tier} Access
                </span>

                <div className="flex items-center gap-2">
                  {isAdmin && onDeleteMaterial && (
                    <button
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                      title="Delete Material Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}

                  {isLocked ? (
                    <button
                      onClick={() => upgradeTier('premium')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" /> Unlock Premium
                    </button>
                  ) : (
                    <a
                      href={mat.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
