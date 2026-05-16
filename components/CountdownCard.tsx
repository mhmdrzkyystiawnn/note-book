'use client';

interface Countdown {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  color: string;
}

interface CountdownCardProps {
  countdown: Countdown;
  onDelete: (id: string) => Promise<void>;
}

export default function CountdownCard({ countdown, onDelete }: CountdownCardProps) {
  const startDate = new Date(countdown.start_date);
  const endDate = new Date(countdown.end_date);
  const today = new Date();

  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  let daysElapsed = 0;
  if (today >= startDate) daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1;
  let daysRemaining = 0;
  if (today < endDate) daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / 86400000) + 1;

  const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
  const isCompleted = today > endDate;
  const isStarted = today >= startDate;
  const isNotStarted = today < startDate;

  // All colors map to warm palette
  const colorMap: Record<string, { bar: string; badge: string }> = {
    teal:    { bar: '#622B14', badge: 'rgba(98,43,20,0.1)'   },
    blue:    { bar: '#995F2F', badge: 'rgba(153,95,47,0.1)'  },
    emerald: { bar: '#978F66', badge: 'rgba(151,143,102,0.1)' },
    amber:   { bar: '#622B14', badge: 'rgba(98,43,20,0.08)'  },
    rose:    { bar: '#995F2F', badge: 'rgba(153,95,47,0.08)' },
  };

  const colors = colorMap[countdown.color] || colorMap['teal'];

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className="rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
      style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 2px 12px rgba(98,43,20,0.05)' }}
    >
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: colors.bar, opacity: 0.4 }} />

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-normal leading-snug line-clamp-2 transition-colors duration-150" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>
            {countdown.title}
          </h3>
          {countdown.description && (
            <p className="text-xs mt-1 line-clamp-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>
              {countdown.description}
            </p>
          )}
        </div>
        <button
          onClick={() => { if (confirm('Hapus countdown ini?')) onDelete(countdown.id); }}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-150"
          style={{ color: '#978F66' }}
          title="Hapus"
        >
          ✕
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ background: colors.badge, color: colors.bar, fontFamily: 'Georgia, serif' }}>
          {isCompleted && '✓ Selesai'}
          {isStarted && !isCompleted && '◎ Berjalan'}
          {isNotStarted && '○ Belum Mulai'}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Progress</span>
          <span className="text-xs font-semibold" style={{ color: '#622B14', fontFamily: 'Georgia, serif' }}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F0E9D8' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, background: colors.bar }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Mulai', value: formatDate(countdown.start_date) },
          { label: 'Sisa', value: daysRemaining > 0 ? `${daysRemaining}h` : '✓' },
          { label: 'Akhir', value: formatDate(countdown.end_date) },
        ].map((item) => (
          <div key={item.label} className="rounded-lg p-2.5 text-center" style={{ background: '#F8F3EA' }}>
            <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{item.label}</p>
            <p className="text-xs font-medium" style={{ color: '#622B14', fontFamily: 'Georgia, serif' }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3" style={{ borderTop: '1px solid #F0E9D8' }}>
        <p className="text-xs" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>
          <span className="font-semibold" style={{ color: '#622B14' }}>{daysElapsed}</span>/{totalDays} hari berlalu
        </p>
      </div>
    </div>
  );
}