import type { FilterType, SortType } from '../types';

interface Props {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: { total: number; completed: number; active: number; highPriority: number };
}

export default function TodoFilter({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
  stats,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search tasks or categories..."
          className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 placeholder-gray-500"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-2 rounded font-bold transition uppercase text-sm ${
              filter === f
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-cyan-500/30'
            }`}
          >
            {f === 'all' && '📋'}
            {f === 'active' && '⏳'}
            {f === 'completed' && '✅'}
            {' '}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Sort By</label>
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as SortType)}
          className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500"
        >
          <option value="date">📅 Newest First</option>
          <option value="priority">🔥 Priority</option>
          <option value="alphabetical">🔤 Alphabetical</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-800 rounded border border-cyan-500/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-1">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.active}</div>
          <div className="text-xs text-gray-400 mt-1">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.highPriority}</div>
          <div className="text-xs text-gray-400 mt-1">High Priority</div>
        </div>
      </div>
    </div>
  );
}
