import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Heart, 
  Archive, 
  Layers, 
  Sparkles, 
  Calendar,
  X
} from 'lucide-react';
import { Memory, CategoryType } from '../types';
import { MemoryCard } from '../components/MemoryCard';
import { CATEGORIES } from '../utils/constants';

interface AllMemoriesProps {
  memories: Memory[];
  onFavoriteToggle: (id: string) => void;
  onArchiveToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
  onViewDetails: (memory: Memory) => void;
  initialCategory?: CategoryType;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AllMemories: React.FC<AllMemoriesProps> = ({
  memories,
  onFavoriteToggle,
  onArchiveToggle,
  onDelete,
  onEdit,
  onViewDetails,
  initialCategory,
  onToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>(
    initialCategory || 'all'
  );
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'archived'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'importance'>('newest');

  // Filtering Logic
  const filteredMemories = memories.filter(m => {
    // Tab filter
    if (filterTab === 'favorites' && !m.isFavorite) return false;
    if (filterTab === 'archived' && !m.isArchived) return false;
    if (filterTab === 'all' && m.isArchived) return false;

    // Category filter
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const created = new Date(m.createdAt).getTime();
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (dateFilter === 'today' && now - created > oneDay) return false;
      if (dateFilter === 'week' && now - created > 7 * oneDay) return false;
      if (dateFilter === 'month' && now - created > 30 * oneDay) return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchContent = m.content.toLowerCase().includes(q);
      const matchTags = m.tags.some(t => t.toLowerCase().includes(q));
      const matchPeople = m.people.some(p => p.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags && !matchPeople) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'importance') {
      const weight = { high: 3, medium: 2, low: 1 };
      return weight[b.importance] - weight[a.importance];
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sam-purple/10 border border-sam-purple/30 text-sam-highlight text-xs font-medium mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Second Mind Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sam-text">
            All Memories
          </h2>
          <p className="text-sm text-sam-muted mt-1">
            Search, filter, categorize and browse everything your second mind has retained.
          </p>
        </div>

        {/* Tab Pills (Active, Favorites, Archived) */}
        <div className="flex items-center p-1 rounded-xl bg-sam-surface border border-sam-purple/20 self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterTab === 'all'
                ? 'bg-sam-purple text-white shadow-glow-purple'
                : 'text-sam-muted hover:text-white'
            }`}
          >
            Active ({memories.filter(m => !m.isArchived).length})
          </button>
          <button
            onClick={() => setFilterTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterTab === 'favorites'
                ? 'bg-rose-500 text-white shadow-glow-purple'
                : 'text-sam-muted hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favorites</span>
          </button>
          <button
            onClick={() => setFilterTab('archived')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterTab === 'archived'
                ? 'bg-sam-blue text-white shadow-glow-blue'
                : 'text-sam-muted hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sam-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, person name, tag, or topic..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text placeholder-sam-muted focus:outline-none focus:border-sam-purple/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sam-muted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="p-2.5 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2.5 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="importance">Highest Importance</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-sam-purple text-white shadow-glow-purple'
                : 'bg-sam-card hover:bg-sam-cardHover text-sam-muted hover:text-white border border-sam-purple/15'
            }`}
          >
            All Categories ({memories.length})
          </button>

          {Object.values(CATEGORIES).map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = memories.filter(m => m.category === cat.id && !m.isArchived).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-transparent shadow-glow-purple text-white'
                    : 'bg-sam-card hover:bg-sam-cardHover text-sam-muted hover:text-white border-sam-purple/15'
                }`}
                style={isSelected ? { backgroundColor: cat.color } : {}}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {sortedMemories.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-sam-surface/50 border border-sam-purple/15 p-8">
          <Layers className="w-12 h-12 text-sam-muted/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-sam-text">No memories found</h3>
          <p className="text-xs text-sam-muted max-w-sm mx-auto mt-1">
            Try adjusting your search terms or filters, or capture a new thought with voice recording!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedMemories.map(m => (
            <MemoryCard
              key={m.id}
              memory={m}
              onFavoriteToggle={onFavoriteToggle}
              onArchiveToggle={onArchiveToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onViewDetails={onViewDetails}
              onTagClick={(t) => setSearchTerm(t)}
              onPersonClick={(p) => setSearchTerm(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

