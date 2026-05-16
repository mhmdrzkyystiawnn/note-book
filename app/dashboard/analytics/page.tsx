'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const EMOTIONS = ['😊','😢','😡','😴','🤩','😎','😰','🤔','😍','🎉','😌','💪','🤗','😔','🙂'];

const EMOTION_LABELS: Record<string, string> = {
  '😊': 'Senang',   '😢': 'Sedih',    '😡': 'Marah',
  '😴': 'Ngantuk',  '🤩': 'Excited',  '😎': 'Keren',
  '😰': 'Cemas',    '🤔': 'Bingung',  '😍': 'Suka',
  '🎉': 'Rayakan',  '😌': 'Damai',    '💪': 'Semangat',
  '🤗': 'Hangat',   '😔': 'Lesu',     '🙂': 'Oke',
};

const EMOTION_VALENCE: Record<string, 'positive' | 'neutral' | 'negative'> = {
  '😊': 'positive', '😢': 'negative', '😡': 'negative',
  '😴': 'neutral',  '🤩': 'positive', '😎': 'positive',
  '😰': 'negative', '🤔': 'neutral',  '😍': 'positive',
  '🎉': 'positive', '😌': 'positive', '💪': 'positive',
  '🤗': 'positive', '😔': 'negative', '🙂': 'neutral',
};

interface AttendanceRecord {
  id: string; user_id: string; check_in: string;
  check_out: string | null; date: string; working_hours: number | null;
}
interface NoteRecord { id: string; emotion?: string; created_at: string; }
interface Analytics {
  totalDays: number; totalHours: number; averageHoursPerDay: number;
  attendanceRate: number; longestDay: number; shortestDay: number;
  monthlyStats: { month: string; monthKey: string; hours: number; days: number }[];
}
interface MoodStats {
  distribution: { emoji: string; count: number; pct: number }[];
  topMood: string; totalWithMood: number;
  positiveRate: number; negativeRate: number; neutralRate: number;
  recentMoods: { emoji: string; date: string }[];
  streak: { emoji: string; count: number } | null;
}

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = 'Georgia, serif';

// ── MetricCard redesigned ────────────────────────────────────────────────────
function MetricCard({ label, value, unit, icon, sub }: {
  label: string; value: string | number; unit: string; icon: string; sub?: string;
}) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 4px 20px rgba(98,43,20,0.06)' }}
    >
      {/* decorative corner */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-[0.04] rounded-bl-full transition-all duration-500 group-hover:opacity-[0.07] group-hover:w-24 group-hover:h-24"
        style={{ background: '#622B14' }}
      />
      <div className="flex items-start justify-between mb-5">
        <span
          className="text-[0.6rem] tracking-[0.22em] uppercase"
          style={{ color: '#C4A97D', fontFamily: sf }}
        >
          {label}
        </span>
        <span className="text-base opacity-50" style={{ color: '#622B14' }}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-4xl font-normal leading-none" style={{ fontFamily: gf, color: '#3D2010' }}>
          {value}
        </span>
        <span className="text-xs" style={{ color: '#C4A97D', fontFamily: sf }}>{unit}</span>
      </div>
      {sub && <p className="text-[0.62rem] mt-1.5" style={{ color: '#C4A97D', fontFamily: sf }}>{sub}</p>}
      {/* bottom accent line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #E4D6A9, transparent)' }}
      />
    </div>
  );
}

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ stats }: { stats: Analytics['monthlyStats'] }) {
  const maxHours = Math.max(...stats.map((s) => s.hours), 1);
  return (
    <div className="flex items-end gap-1.5 h-36 w-full">
      {[...stats].reverse().map((s) => {
        const pct = (s.hours / maxHours) * 100;
        return (
          <div key={s.monthKey} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group relative">
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none"
              style={{ background: '#2A1208', color: '#E4D6A9', fontFamily: sf, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              {s.hours}j · {s.days} hari
            </div>
            <div
              className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80"
              style={{
                height: `${pct}%`, minHeight: pct > 0 ? '4px' : '0',
                background: 'linear-gradient(to top, #622B14, #C4A97D)',
              }}
            />
            <p className="text-[8px] truncate w-full text-center tracking-wide" style={{ color: '#C4A97D', fontFamily: sf }}>
              {s.month.split(' ')[0].slice(0, 3)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Mood Tracker Card ────────────────────────────────────────────────────────
function MoodTrackerCard({ mood }: { mood: MoodStats }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const positiveColor = '#5C8A4A';
  const negativeColor = '#9B3A2A';
  const neutralColor  = '#8A7A5A';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 4px 20px rgba(98,43,20,0.06)' }}
    >
      {/* Header */}
      <div
        className="px-6 pt-6 pb-5 border-b"
        style={{ borderColor: '#F0E9D8', background: 'linear-gradient(to bottom, rgba(244,235,210,0.3), transparent)' }}
      >
        <p className="text-[0.58rem] tracking-[0.24em] uppercase mb-1.5" style={{ color: '#C4A97D', fontFamily: sf }}>
          Pelacak Suasana Hati
        </p>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-normal leading-tight" style={{ fontFamily: gf, color: '#3D2010' }}>
            Mood dari Catatan
          </h2>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-3xl leading-none">{mood.topMood}</span>
            <span className="text-[0.6rem] mt-0.5 tracking-wide" style={{ color: '#C4A97D', fontFamily: sf }}>
              paling sering
            </span>
          </div>
        </div>

        {/* Valence bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex rounded-full overflow-hidden h-2" style={{ background: '#F0E9D8' }}>
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${mood.positiveRate}%`, background: 'linear-gradient(to right, #7AAD5E, #5C8A4A)' }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${mood.neutralRate}%`, background: '#C4A97D' }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${mood.negativeRate}%`, background: 'linear-gradient(to right, #C4735A, #9B3A2A)' }}
            />
          </div>
          <div className="flex items-center gap-3 text-[0.58rem] tracking-wide" style={{ fontFamily: sf }}>
            <span className="flex items-center gap-1" style={{ color: positiveColor }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: positiveColor }} />
              Positif {mood.positiveRate}%
            </span>
            <span className="flex items-center gap-1" style={{ color: neutralColor }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: neutralColor }} />
              Netral {mood.neutralRate}%
            </span>
            <span className="flex items-center gap-1" style={{ color: negativeColor }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: negativeColor }} />
              Negatif {mood.negativeRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Emoji Distribution Grid */}
        <div>
          <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-3" style={{ color: '#C4A97D', fontFamily: sf }}>
            Distribusi Emosi · {mood.totalWithMood} catatan
          </p>
          <div className="space-y-2">
            {mood.distribution.slice(0, 8).map(({ emoji, count, pct }) => (
              <div
                key={emoji}
                className="flex items-center gap-3 group cursor-default"
                onMouseEnter={() => setHovered(emoji)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="text-xl leading-none shrink-0 transition-transform duration-150"
                  style={{ transform: hovered === emoji ? 'scale(1.25)' : 'scale(1)' }}
                >
                  {emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[0.62rem]" style={{ color: '#7A6040', fontFamily: sf }}>
                      {EMOTION_LABELS[emoji] ?? emoji}
                    </span>
                    <span className="text-[0.6rem]" style={{ color: '#C4A97D', fontFamily: sf }}>
                      {count}× · {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#F0E9D8' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: hovered === emoji ? `${pct}%` : `${pct}%`,
                        background: EMOTION_VALENCE[emoji] === 'positive'
                          ? 'linear-gradient(to right, #7AAD5E, #5C8A4A)'
                          : EMOTION_VALENCE[emoji] === 'negative'
                          ? 'linear-gradient(to right, #C4735A, #9B3A2A)'
                          : 'linear-gradient(to right, #D4B86A, #C4A97D)',
                        boxShadow: hovered === emoji ? '0 0 6px rgba(98,43,20,0.3)' : 'none',
                        transition: 'width 0.5s ease, box-shadow 0.15s',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mood Trail */}
        {mood.recentMoods.length > 0 && (
          <div>
            <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-3" style={{ color: '#C4A97D', fontFamily: sf }}>
              Jejak Mood Terakhir
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {mood.recentMoods.map((m, i) => (
                <div
                  key={i}
                  className="group relative"
                  title={`${EMOTION_LABELS[m.emoji] ?? m.emoji} · ${new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all duration-150 group-hover:scale-110 group-hover:-translate-y-0.5"
                    style={{
                      background: i === 0 ? 'rgba(98,43,20,0.10)' : 'rgba(98,43,20,0.04)',
                      border: i === 0 ? '1px solid rgba(98,43,20,0.18)' : '1px solid rgba(228,214,169,0.5)',
                      boxShadow: i === 0 ? '0 2px 8px rgba(98,43,20,0.12)' : 'none',
                      opacity: Math.max(0.35, 1 - i * 0.065),
                    }}
                  >
                    {m.emoji}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[0.58rem] mt-2" style={{ color: '#D4C09A', fontFamily: sf }}>
              ← terbaru · terlama →
            </p>
          </div>
        )}

        {/* Streak info */}
        {mood.streak && mood.streak.count >= 2 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(98,43,20,0.04)', border: '1px solid rgba(228,214,169,0.6)' }}
          >
            <span className="text-2xl">{mood.streak.emoji}</span>
            <div>
              <p className="text-xs font-medium" style={{ color: '#622B14', fontFamily: sf }}>
                {mood.streak.count}× berturut-turut
              </p>
              <p className="text-[0.6rem]" style={{ color: '#C4A97D', fontFamily: sf }}>
                Mood streak terkini
              </p>
            </div>
            <span className="ml-auto text-lg">🔥</span>
          </div>
        )}

        {/* Unused emotions dim grid */}
        <div>
          <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-2.5" style={{ color: '#C4A97D', fontFamily: sf }}>
            Semua Emosi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.map((e) => {
              const found = mood.distribution.find((d) => d.emoji === e);
              return (
                <div
                  key={e}
                  title={EMOTION_LABELS[e]}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-150 hover:scale-110 cursor-default"
                  style={{
                    background: found ? 'rgba(98,43,20,0.07)' : 'rgba(98,43,20,0.02)',
                    border: found ? '1px solid rgba(98,43,20,0.14)' : '1px solid rgba(228,214,169,0.4)',
                    opacity: found ? 1 : 0.3,
                  }}
                >
                  {e}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [user, setUser]         = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { router.push('/auth/login'); return; }
        setUser(authUser);

        // Parallel fetch: attendance + notes
        const [{ data: attData }, { data: noteData }] = await Promise.all([
          supabase.from('attendance').select('*').eq('user_id', authUser.id).order('date', { ascending: false }),
          supabase.from('notes').select('id, emotion, created_at').eq('user_id', authUser.id).order('created_at', { ascending: false }),
        ]);

        // ── Mood analytics ─────────────────────────────────────────
        if (noteData && noteData.length > 0) {
          const withMood = (noteData as NoteRecord[]).filter((n) => n.emotion && EMOTIONS.includes(n.emotion));
          const counts: Record<string, number> = {};
          withMood.forEach((n) => { counts[n.emotion!] = (counts[n.emotion!] ?? 0) + 1; });
          const total = withMood.length;
          const distribution = Object.entries(counts)
            .map(([emoji, count]) => ({ emoji, count, pct: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count);

          const topMood = distribution[0]?.emoji ?? '🙂';
          const byValence = (v: string) =>
            Math.round((withMood.filter((n) => EMOTION_VALENCE[n.emotion!] === v).length / Math.max(total, 1)) * 100);

          const recentMoods = withMood.slice(0, 14).map((n) => ({ emoji: n.emotion!, date: n.created_at }));

          // streak: consecutive same emoji from most recent
          let streak: { emoji: string; count: number } | null = null;
          if (recentMoods.length >= 2) {
            const first = recentMoods[0].emoji;
            let cnt = 1;
            for (let i = 1; i < recentMoods.length; i++) {
              if (recentMoods[i].emoji === first) cnt++;
              else break;
            }
            if (cnt >= 2) streak = { emoji: first, count: cnt };
          }

          setMoodStats({
            distribution,
            topMood,
            totalWithMood: total,
            positiveRate: byValence('positive'),
            negativeRate: byValence('negative'),
            neutralRate: byValence('neutral'),
            recentMoods,
            streak,
          });
        }

        // ── Attendance analytics ────────────────────────────────────
        if (!attData || attData.length === 0) {
          setAnalytics({ totalDays: 0, totalHours: 0, averageHoursPerDay: 0, attendanceRate: 0, longestDay: 0, shortestDay: 0, monthlyStats: [] });
          return;
        }

        setAttendance(attData);
        const complete = attData.filter((r) => r.check_out && r.working_hours);
        const totalDays = complete.length;
        const totalHours = complete.reduce((s, r) => s + (r.working_hours ?? 0), 0);
        const averageHoursPerDay = totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0;
        const today = new Date();
        const sixtyAgo = new Date(today.getTime() - 60 * 86400000);
        const workingDays = Math.ceil(((today.getTime() - sixtyAgo.getTime()) / 86400000) * (5 / 7));
        const attendanceRate = Math.min(Math.round((totalDays / Math.max(workingDays, 1)) * 100), 100);
        const hours = complete.map((r) => r.working_hours ?? 0).sort((a, b) => b - a);

        const monthlyMap: Record<string, { hours: number; days: number }> = {};
        attData.forEach((r) => {
          const d = new Date(r.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyMap[key]) monthlyMap[key] = { hours: 0, days: 0 };
          if (r.check_out && r.working_hours) { monthlyMap[key].hours += r.working_hours; monthlyMap[key].days += 1; }
        });

        const monthlyStats = Object.entries(monthlyMap)
          .map(([key, v]) => ({
            monthKey: key,
            month: new Date(`${key}-01`).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
            hours: Math.round(v.hours * 100) / 100,
            days: v.days,
          }))
          .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
          .slice(0, 12);

        setAnalytics({ totalDays, totalHours: Math.round(totalHours * 100) / 100, averageHoursPerDay, attendanceRate, longestDay: hours[0] ?? 0, shortestDay: hours[hours.length - 1] ?? 0, monthlyStats });
        const now = new Date();
        setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      } catch (e) {
        console.error('Error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, supabase]);

  const getMonthlyData = () =>
    attendance.filter((r) => {
      const d = new Date(r.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth && r.working_hours;
    });

  const formatTime = (s: string) => new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (s: string) => new Date(s).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  const cardStyle = {
    background: '#FFFDF7',
    border: '1px solid #E4D6A9',
    boxShadow: '0 4px 20px rgba(98,43,20,0.06)',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#E4D6A9', borderTopColor: '#622B14' }} />
          <p className="text-[0.62rem] tracking-[0.22em] uppercase" style={{ color: '#978F66', fontFamily: sf }}>Memuat analitik…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EFE0' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .au1 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .05s both; }
        .au2 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .15s both; }
        .au3 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .25s both; }
        .au4 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .35s both; }
        .au5 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .45s both; }
      `}</style>

      <Sidebar user={user} />

      <main className="flex-1 flex flex-col min-w-0 md:pl-64">

        {/* ── Header ──────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-20 backdrop-blur-md border-b"
          style={{ background: 'rgba(245,239,224,0.88)', borderColor: '#E4D6A9' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-5">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'rgba(98,43,20,0.08)' }}>
                <span style={{ color: '#622B14' }}>▲</span>
              </div>
              <div>
                <h1 className="text-2xl font-normal" style={{ fontFamily: gf, color: '#622B14' }}>Analitik</h1>
                <p className="text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: '#978F66', fontFamily: sf }}>
                  Statistik & performa kehadiran
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">

          {!analytics || analytics.totalDays === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={cardStyle}>
              <p className="text-6xl font-light mb-4 opacity-10" style={{ fontFamily: gf, color: '#622B14' }}>▲</p>
              <h2 className="text-xl font-normal mb-2" style={{ fontFamily: gf, color: '#622B14' }}>Belum ada data</h2>
              <p className="text-sm" style={{ color: '#978F66', fontFamily: sf }}>Mulai check in di halaman Presensi</p>
            </div>
          ) : (
            <>
              {/* ── Metric Cards ──────────────────────────────────── */}
              <div className="au1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                  label="Total Hari Kerja"  icon="◻"
                  value={analytics.totalDays}  unit="hari"
                  sub={`dari data tercatat`}
                />
                <MetricCard
                  label="Total Jam Kerja"   icon="◷"
                  value={analytics.totalHours} unit="jam"
                  sub={`~${analytics.averageHoursPerDay}j/hari`}
                />
                <MetricCard
                  label="Rerata / Hari"     icon="∑"
                  value={analytics.averageHoursPerDay} unit="jam"
                  sub={`dari ${analytics.totalDays} hari`}
                />
                <MetricCard
                  label="Tingkat Kehadiran" icon="✦"
                  value={`${analytics.attendanceRate}`} unit="%"
                  sub={analytics.attendanceRate >= 80 ? 'Sangat baik 🌟' : analytics.attendanceRate >= 60 ? 'Cukup baik' : 'Perlu ditingkatkan'}
                />
              </div>

              {/* ── Chart + Quick Stats ───────────────────────────── */}
              <div className="au2 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-1" style={{ color: '#C4A97D', fontFamily: sf }}>Tren Bulanan</p>
                      <h2 className="text-xl font-normal" style={{ fontFamily: gf, color: '#622B14' }}>Jam Kerja</h2>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-[0.62rem] tracking-wide"
                      style={{ background: 'rgba(98,43,20,0.06)', color: '#978F66', fontFamily: sf, border: '1px solid rgba(228,214,169,0.7)' }}
                    >
                      {analytics.monthlyStats.length} bulan
                    </span>
                  </div>
                  <BarChart stats={analytics.monthlyStats} />
                </div>

                <div className="rounded-2xl p-6 flex flex-col gap-4" style={cardStyle}>
                  <div>
                    <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-1" style={{ color: '#C4A97D', fontFamily: sf }}>Rekap</p>
                    <h2 className="text-xl font-normal" style={{ fontFamily: gf, color: '#622B14' }}>Pencapaian</h2>
                  </div>

                  {[
                    { label: 'Hari Terlama',   value: `${analytics.longestDay} jam`,         icon: '↑', c: '#5C8A4A' },
                    { label: 'Hari Terpendek', value: `${analytics.shortestDay} jam`,         icon: '↓', c: '#9B3A2A' },
                    { label: 'Rerata Harian',  value: `${analytics.averageHoursPerDay} jam`,  icon: '≈', c: '#995F2F' },
                  ].map(({ label, value, icon, c }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: '#F8F3EA', border: '1px solid #EEE4CF' }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: `${c}18`, color: c }}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="text-[0.58rem] tracking-[0.16em] uppercase" style={{ color: '#C4A97D', fontFamily: sf }}>{label}</p>
                        <p className="text-sm" style={{ color: '#3D2010', fontFamily: gf }}>{value}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-auto pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: '#C4A97D', fontFamily: sf }}>Kehadiran</p>
                      <p className="text-xs font-semibold" style={{ color: '#622B14', fontFamily: sf }}>{analytics.attendanceRate}%</p>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F0E9D8' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${analytics.attendanceRate}%`, background: 'linear-gradient(to right, #622B14, #C4A97D)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Mood Tracker ──────────────────────────────────── */}
              {moodStats && moodStats.totalWithMood > 0 && (
                <div className="au3">
                  <MoodTrackerCard mood={moodStats} />
                </div>
              )}

              {/* ── Monthly Summary Table ─────────────────────────── */}
              <div className="au4 rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: '#F0E9D8' }}>
                  <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-1" style={{ color: '#C4A97D', fontFamily: sf }}>Ringkasan</p>
                  <h2 className="text-xl font-normal" style={{ fontFamily: gf, color: '#622B14' }}>Statistik Bulanan</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F0E9D8' }}>
                        {['Bulan', 'Total Jam', 'Hari Kerja', 'Rerata/Hari', 'Progress vs 160j'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[0.58rem] tracking-[0.18em] uppercase"
                            style={{ color: '#C4A97D', fontFamily: sf }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.monthlyStats.map((stat, idx) => {
                        const avg = stat.days > 0 ? (stat.hours / stat.days).toFixed(1) : '0';
                        const pct = Math.min(Math.round((stat.hours / 160) * 100), 100);
                        const now = new Date();
                        const isCurrent = stat.monthKey === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                        return (
                          <tr
                            key={idx}
                            className="transition-colors duration-100"
                            style={{
                              background: isCurrent ? 'rgba(98,43,20,0.025)' : 'transparent',
                              borderBottom: '1px solid rgba(240,233,216,0.5)',
                            }}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                {isCurrent && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#622B14' }} />}
                                <span className="text-xs" style={{ color: '#622B14', fontFamily: sf }}>{stat.month}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-semibold" style={{ color: '#995F2F', fontFamily: gf }}>{stat.hours} jam</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px]"
                                style={{ background: '#F0E9D8', color: '#622B14', fontFamily: sf, border: '1px solid #E4D6A9' }}>
                                {stat.days} hari
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs" style={{ color: '#978F66', fontFamily: sf }}>{avg} jam</td>
                            <td className="px-5 py-3.5 w-40">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0E9D8' }}>
                                  <div className="h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, background: 'linear-gradient(to right, #622B14, #C4A97D)' }} />
                                </div>
                                <span className="text-[10px] shrink-0 w-7 text-right" style={{ color: '#978F66', fontFamily: sf }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Monthly Detail ────────────────────────────────── */}
              <div className="au5 rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between gap-4" style={{ borderColor: '#F0E9D8' }}>
                  <div>
                    <p className="text-[0.58rem] tracking-[0.2em] uppercase mb-1" style={{ color: '#C4A97D', fontFamily: sf }}>Detail</p>
                    <h2 className="text-xl font-normal" style={{ fontFamily: gf, color: '#622B14' }}>Rincian Per Hari</h2>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs outline-none"
                    style={{ background: '#F0E9D8', border: '1px solid #E4D6A9', color: '#622B14', fontFamily: sf }}
                  >
                    {analytics.monthlyStats.map((stat) => (
                      <option key={stat.monthKey} value={stat.monthKey}>{stat.month}</option>
                    ))}
                  </select>
                </div>

                {getMonthlyData().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-3xl opacity-10 mb-3" style={{ color: '#622B14' }}>◷</span>
                    <p className="text-sm" style={{ color: '#978F66', fontFamily: sf }}>Tidak ada data untuk bulan ini</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #F0E9D8' }}>
                          {['Tanggal', 'Check In', 'Check Out', 'Durasi'].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-[0.58rem] tracking-[0.18em] uppercase"
                              style={{ color: '#C4A97D', fontFamily: sf }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getMonthlyData().map((record) => (
                          <tr key={record.id} className="transition-colors duration-100" style={{ borderBottom: '1px solid rgba(240,233,216,0.5)' }}>
                            <td className="px-5 py-3.5 text-xs" style={{ color: '#622B14', fontFamily: sf }}>{formatDateShort(record.date)}</td>
                            <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: '#995F2F', fontFamily: gf }}>{formatTime(record.check_in)}</td>
                            <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: '#622B14', fontFamily: gf }}>
                              {record.check_out ? formatTime(record.check_out) : '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px]"
                                style={{ background: '#F0E9D8', color: '#622B14', border: '1px solid #E4D6A9', fontFamily: sf }}>
                                {record.working_hours} jam
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}