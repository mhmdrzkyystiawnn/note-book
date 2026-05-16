'use client';

import { useState, useMemo } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  emotion?: string;
  created_at: string;
  user_id: string;
}

interface NoteCalendarProps {
  notes: Note[];
}

export default function NoteCalendar({ notes }: NoteCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get notes grouped by date (YYYY-MM-DD)
  const notesByDate = useMemo(() => {
    const grouped: { [key: string]: Note[] } = {};
    notes.forEach(note => {
      const date = new Date(note.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(note);
    });
    return grouped;
  }, [notes]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
  const georgiaFont = 'Georgia, serif';

  const getNoteCountForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0];
    return notesByDate[dateStr]?.length || 0;
  };

  const getNotesForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0];
    return notesByDate[dateStr] || [];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const notesThisMonth = notes.filter(n => {
    const noteDate = new Date(n.created_at);
    return (
      noteDate.getMonth() === currentDate.getMonth() &&
      noteDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  return (
    <div className="bg-[#FEFAF0] rounded-xl border border-[#E4D6A9] p-4 sm:p-5 shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-2">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 hover:bg-[#F0E9D8] shrink-0"
          style={{ color: '#622B14' }}
        >
          ◀
        </button>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: garamondFont, color: '#622B14' }}
          >
            {monthName}
          </h2>
          <button
            type="button"
            onClick={goToToday}
            className="text-xs px-2 py-1 rounded cursor-pointer transition-all duration-150"
            style={{
              background: 'rgba(98,43,20,0.08)',
              color: '#995F2F',
              border: '1px solid rgba(98,43,20,0.15)',
            }}
          >
            Hari ini
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 hover:bg-[#F0E9D8] shrink-0"
          style={{ color: '#622B14' }}
        >
          ▶
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-3 w-full">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold rounded h-12 flex items-center justify-center"
            style={{ background: 'rgba(98,43,20,0.05)', color: '#622B14' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4 w-full">
        {days.map((day, index) => {
          const noteCount = day ? getNoteCountForDate(day) : 0;
          const hasNotes = noteCount > 0;
          const today = isToday(day || 0);

          return (
            <div key={index} className="h-18">
              {day ? (
                <button
                  type="button"
                  className="relative w-full h-full rounded-lg text-xs font-medium transition-all duration-150 group flex flex-col items-center justify-center p-1"
                  style={{
                    background: today ? '#995F2F' : hasNotes ? '#F0E9D8' : '#FEFAF0',
                    color: today ? 'white' : '#622B14',
                    border:
                      today || hasNotes
                        ? `2px solid ${today ? '#995F2F' : '#E4D6A9'}`
                        : '1px solid #E4D6A9',
                  }}
                  title={
                    hasNotes
                      ? `${noteCount} catatan${noteCount > 1 ? '' : ''}`
                      : 'Tidak ada catatan'
                  }
                >
                  {/* Day number */}
                  <span className="text-sm leading-tight">{day}</span>

                  {/* Indicator dots */}
                  {hasNotes && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({
                        length: Math.min(noteCount, 3),
                      }).map((_, i) => (
                        <span
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{
                            background: today
                              ? 'rgba(255,255,255,0.7)'
                              : '#995F2F',
                          }}
                        />
                      ))}
                      {noteCount > 3 && (
                        <span
                          className="text-[9px] leading-none"
                          style={{
                            color: today
                              ? 'rgba(255,255,255,0.8)'
                              : '#995F2F',
                          }}
                        >
                          +
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover tooltip */}
                  {hasNotes && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      <div
                        className="bg-[#622B14] text-white text-xs rounded-lg p-2 shadow-lg whitespace-nowrap"
                        style={{ fontFamily: georgiaFont }}
                      >
                        <div className="font-semibold">{noteCount} catatan</div>
                        <div className="text-[10px] max-h-16 overflow-y-auto mt-1 space-y-1">
                          {getNotesForDate(day)
                            .slice(0, 2)
                            .map(note => (
                              <div
                                key={note.id}
                                className="line-clamp-1"
                              >
                                {note.emotion} {note.title}
                              </div>
                            ))}
                          {noteCount > 2 && (
                            <div className="italic opacity-70">
                              +{noteCount - 2} lagi
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        className="border-t border-[#E4D6A9] pt-3 text-center text-xs"
        style={{ color: '#978F66', fontFamily: georgiaFont }}
      >
        Total catatan bulan ini:{' '}
        <span style={{ color: '#995F2F', fontWeight: 'bold' }}>
          {notesThisMonth}
        </span>
      </div>
    </div>
  );
}
