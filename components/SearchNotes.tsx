'use client';

import { useState } from 'react';

const MOODS = ['😊', '😢', '😡', '😴', '🤩', '😎', '😰', '🤔', '😍', '🎉', '😌', '💪', '🤗', '😔', '🙂'];

interface SearchNotesProps {
  searchQuery: string;
  selectedMoods: string[];
  onSearchChange: (query: string) => void;
  onMoodsChange: (moods: string[]) => void;
  totalNotes: number;
  filteredCount: number;
}

export default function SearchNotes({
  searchQuery,
  selectedMoods,
  onSearchChange,
  onMoodsChange,
  totalNotes,
  filteredCount,
}: SearchNotesProps) {
  const [showMoodFilter, setShowMoodFilter] = useState(false);

  const toggleMood = (mood: string) => {
    const newMoods = selectedMoods.includes(mood)
      ? selectedMoods.filter(m => m !== mood)
      : [...selectedMoods, mood];
    onMoodsChange(newMoods);
  };

  // const clearAllFilters = () => {
  //   onSearchChange('');
  //   onMoodsChange([]);
  // };

  const hasActiveFilters = searchQuery || selectedMoods.length > 0;

  const georgiaFont = 'Georgia, serif';

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#C4B896' }}>
          ◌
        </span>
        <input
          type="text"
          placeholder="Cari catatan…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
          style={{ background: '#F0E9D8', border: '1px solid #E4D6A9', color: '#622B14', fontFamily: georgiaFont }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#995F2F')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E4D6A9')}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors duration-150"
            style={{ color: '#C4B896' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Mood Filter Toggle */}
      <button
        onClick={() => setShowMoodFilter(!showMoodFilter)}
        className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-between"
        style={{
          background: showMoodFilter || selectedMoods.length > 0 ? 'rgba(98,43,20,0.08)' : '#F0E9D8',
          color: '#622B14',
          border: `1px solid ${showMoodFilter || selectedMoods.length > 0 ? '#995F2F' : '#E4D6A9'}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: georgiaFont }}>Mood/Emosi</span>
          {selectedMoods.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(153, 95, 47, 0.15)' }}>
              {selectedMoods.join('')}
              <span style={{ color: '#995F2F' }}>×</span>
            </span>
          )}
        </div>
        <span style={{ transform: showMoodFilter ? 'rotate(180deg)' : 'rotate(0))', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {/* Mood Filter Grid */}
      {showMoodFilter && (
        <div className="grid grid-cols-5 gap-2 p-3 rounded-lg" style={{ background: '#F0E9D8' }}>
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className="aspect-square flex items-center justify-center rounded-lg text-xl transition-all duration-150"
              style={{
                background: selectedMoods.includes(mood) ? '#995F2F' : 'white',
                border: `2px solid ${selectedMoods.includes(mood) ? '#995F2F' : '#E4D6A9'}`,
                boxShadow: selectedMoods.includes(mood) ? '0 0 0 2px rgba(153, 95, 47, 0.2)' : 'none',
              }}
              title={`Filter dengan ${mood}`}
            >
              {mood}
            </button>
          ))}
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            onSearchChange('');
            onMoodsChange([]);
            setShowMoodFilter(false);
          }}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: 'rgba(153, 95, 47, 0.1)',
            color: '#995F2F',
            border: '1px solid rgba(153, 95, 47, 0.2)',
          }}
        >
          Hapus semua filter
        </button>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && (
        <p className="text-xs" style={{ color: '#978F66', fontFamily: georgiaFont }}>
          {filteredCount} dari {totalNotes} catatan
          {searchQuery && ` · Cari: "${searchQuery}"`}
          {selectedMoods.length > 0 && ` · Mood: ${selectedMoods.join('')}`}
        </p>
      )}
    </div>
  );
}
