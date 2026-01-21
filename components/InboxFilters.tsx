'use client'

import { Search, Calendar, Pin, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type DateFilter = 'all' | 'today' | 'week' | 'month'

interface InboxFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  dateFilter: DateFilter
  onDateFilterChange: (filter: DateFilter) => void
  showPinnedOnly: boolean
  onPinnedOnlyChange: (show: boolean) => void
  totalCount: number
  filteredCount: number
}

export default function InboxFilters({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  showPinnedOnly,
  onPinnedOnlyChange,
  totalCount,
  filteredCount
}: InboxFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasActiveFilters = searchQuery || dateFilter !== 'all' || showPinnedOnly
  
  const clearFilters = () => {
    onSearchChange('')
    onDateFilterChange('all')
    onPinnedOnlyChange(false)
  }

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full border transition-all text-sm font-medium ${
            hasActiveFilters 
              ? 'bg-brand-primary/20 border-brand-primary/50 text-brand-primary' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
          }`}
        >
          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-primary" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-2">
              {/* Date Filters */}
              <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
                <Calendar size={14} className="text-gray-500 ml-2" />
                {(['all', 'today', 'week', 'month'] as DateFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => onDateFilterChange(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      dateFilter === filter
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>

              {/* Pinned Only Toggle */}
              <button
                onClick={() => onPinnedOnlyChange(!showPinnedOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  showPinnedOnly
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Pin size={14} />
                Pinned Only
              </button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-500">
          Showing {filteredCount} of {totalCount} messages
        </p>
      )}
    </div>
  )
}
