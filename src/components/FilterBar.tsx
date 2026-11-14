import React from 'react';
import { Search, LayoutGrid, List, Columns, Sparkles, Filter } from 'lucide-react';
import { ViewMode } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (platform: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  platformFilter,
  onPlatformFilterChange,
  viewMode,
  onViewModeChange,
  totalFiltered
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-[#ede3d5]">
      {/* Search Bar */}
      <div className="relative w-full md:w-72">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search day #, title, hook or script..."
          className="w-full pl-9 pr-3 py-1.5 text-xs font-medium text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
        {[
          { id: 'all', label: 'All 100' },
          { id: 'published', label: 'Done (✓)' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'ready', label: 'Ready' },
          { id: 'draft', label: 'Drafts' },
          { id: 'milestones', label: 'Milestones 🎁' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onStatusFilterChange(item.id)}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              statusFilter === item.id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            {item.label}
          </button>
        ))}

        {/* Platform Dropdown */}
        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-xl border border-stone-200 outline-none cursor-pointer"
        >
          <option value="all">All Channels</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
          <option value="x">X / Twitter</option>
        </select>
      </div>

      {/* View Switcher: Grid, List, Kanban */}
      <div className="flex items-center gap-1 bg-[#ede4d8] p-1 rounded-xl self-end md:self-auto">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            viewMode === 'grid'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          title="100 Challenge Grid (Default)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            viewMode === 'list'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          title="Table / Spreadsheet view"
        >
          <List className="w-3.5 h-3.5" />
          <span>List</span>
        </button>
        <button
          onClick={() => onViewModeChange('kanban')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            viewMode === 'kanban'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          title="Kanban Board"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Board</span>
        </button>
      </div>
    </div>
  );
};
