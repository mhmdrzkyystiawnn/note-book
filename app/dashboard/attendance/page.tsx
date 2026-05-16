'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  date: string;
  working_hours: number | null;
  notes: string | null;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="rounded-xl p-4 transition-all duration-200" style={{ background: '#F8F3EA', border: '1px solid #EEE4CF' }}>
      <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{label}</p>
      <p className="text-2xl font-light" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: accent }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{sub}</p>}
    </div>
  );
}

export default function AttendancePage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { router.push('/auth/login'); return; }
        setUser(authUser);
        const today = new Date().toISOString().split('T')[0];
        const { data: todayData } = await supabase.from('attendance').select('*').eq('user_id', authUser.id).eq('date', today).single();
        if (todayData) { setTodayAttendance(todayData); setIsCheckedIn(!todayData.check_out); }
        const { data: historyData } = await supabase.from('attendance').select('*').eq('user_id', authUser.id).order('date', { ascending: false }).limit(30);
        if (historyData) setAttendanceHistory(historyData);
      } catch { console.error('Error loading attendance'); }
      finally { setLoading(false); }
    };
    loadAttendance();
  }, [router, supabase]);

  const handleCheckIn = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase.from('attendance').select('*').eq('user_id', user.id).eq('date', today);
      if (existing && existing.length > 0) {
        showToast(existing[0].check_out ? 'Sudah check in & check out hari ini.' : 'Sudah check in hari ini.', false);
        return;
      }
      const { data, error } = await supabase.from('attendance').insert([{ user_id: user.id, date: today, check_in: new Date().toISOString(), notes: notes || null }]).select().single();
      if (error || !data) { showToast('Gagal check in. Coba lagi.', false); return; }
      setTodayAttendance(data); setIsCheckedIn(true); setNotes('');
      showToast('Check in berhasil! Selamat bekerja.');
    } catch { showToast('Terjadi kesalahan.', false); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    setActionLoading(true);
    try {
      const checkOutTime = new Date().toISOString();
      const workingHours = (new Date(checkOutTime).getTime() - new Date(todayAttendance.check_in).getTime()) / 3600000;
      const { data, error } = await supabase.from('attendance').update({
        check_out: checkOutTime, working_hours: Math.round(workingHours * 100) / 100, notes: notes || todayAttendance.notes,
      }).eq('id', todayAttendance.id).select().single();
      if (error || !data) { showToast('Gagal check out. Coba lagi.', false); return; }
      setTodayAttendance(data); setIsCheckedIn(false); setNotes('');
      showToast(`Check out berhasil! Total ${Math.round(data.working_hours * 100) / 100} jam kerja.`);
    } catch { showToast('Terjadi kesalahan.', false); }
    finally { setActionLoading(false); }
  };

  const formatTime = (s: string) => new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (s: string) => new Date(s).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#E4D6A9', borderTopColor: '#622B14' }} />
          <p className="text-sm tracking-widest uppercase" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Memuat presensi…</p>
        </div>
      </div>
    );
  }

  const cardStyle = { background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 2px 12px rgba(98,43,20,0.05)' };

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EFE0' }}>
      <Sidebar user={user} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm flex items-center gap-2.5 max-w-xs transition-all duration-300"
          style={{ background: toast.ok ? '#622B14' : '#995F2F', color: '#E4D6A9', fontFamily: 'Georgia, serif' }}>
          <span>{toast.ok ? '✦' : '✕'}</span>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 md:pl-[256px]">
        <header className="sticky top-0 z-20 backdrop-blur-md border-b" style={{ background: 'rgba(245,239,224,0.85)', borderColor: '#E4D6A9' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'rgba(98,43,20,0.08)' }}>
                  <span style={{ color: '#622B14' }}>◷</span>
                </div>
                <div>
                  <h1 className="text-2xl font-normal" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>Presensi</h1>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{today}</p>
                </div>
              </div>
              <Link href="/dashboard/analytics" className="px-4 py-2 mr-12 mb-4 rounded-full text-xs tracking-widest uppercase transition-all duration-150"
                style={{ background: 'rgba(98,43,20,0.08)', color: '#622B14', fontFamily: 'Georgia, serif' }}>
                ▲ Analitik
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Today Card */}
          <section className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between" style={{ borderColor: '#F0E9D8' }}>
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Hari Ini</p>
                <h2 className="text-xl font-normal" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>Presensi Kehadiran</h2>
              </div>
              {todayAttendance && (
                <span className="px-3 py-1 rounded-full text-xs tracking-wide" style={{
                  background: isCheckedIn ? 'rgba(98,43,20,0.08)' : '#F0E9D8',
                  color: isCheckedIn ? '#622B14' : '#978F66',
                  fontFamily: 'Georgia, serif',
                  border: `1px solid ${isCheckedIn ? 'rgba(98,43,20,0.15)' : '#E4D6A9'}`,
                }}>
                  {isCheckedIn ? '● Sedang Bekerja' : '✓ Selesai'}
                </span>
              )}
            </div>

            <div className="p-6 space-y-5">
              {todayAttendance ? (
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Check In"  value={formatTime(todayAttendance.check_in)} accent="#995F2F" />
                  <StatCard label="Check Out" value={todayAttendance.check_out ? formatTime(todayAttendance.check_out) : '—'} accent={todayAttendance.check_out ? '#622B14' : '#C4B896'} />
                  <StatCard label="Jam Kerja" value={todayAttendance.working_hours ? `${todayAttendance.working_hours}j` : '—'} sub={todayAttendance.working_hours ? 'jam hari ini' : undefined} accent={todayAttendance.working_hours ? '#622B14' : '#C4B896'} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl" style={{ background: '#F8F3EA', border: '1px dashed #E4D6A9' }}>
                  <p className="text-4xl font-light mb-3 opacity-20" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>◷</p>
                  <p className="text-sm font-medium" style={{ color: '#622B14', fontFamily: 'Georgia, serif' }}>Belum check in hari ini</p>
                  <p className="text-xs mt-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Tekan tombol di bawah untuk mulai</p>
                </div>
              )}

              {!todayAttendance?.check_out && (
                <div>
                  <label className="block text-[9px] tracking-widest uppercase mb-2" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>
                    Catatan <span className="normal-case font-normal">(opsional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Tambahkan catatan presensi…"
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all duration-150"
                    style={{ background: '#F8F3EA', border: '1px solid #E4D6A9', color: '#622B14', fontFamily: 'Georgia, serif' }}
                    onFocus={e => (e.target.style.borderColor = '#995F2F')}
                    onBlur={e => (e.target.style.borderColor = '#E4D6A9')}
                  />
                </div>
              )}

              {!todayAttendance?.check_out && (
                <button
                  onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium flex items-center justify-center gap-2.5 transition-all duration-150 disabled:opacity-50"
                  style={{
                    background: isCheckedIn ? '#995F2F' : '#622B14',
                    color: '#E4D6A9',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.12em',
                  }}
                >
                  {actionLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin opacity-60" />
                      Memproses…
                    </>
                  ) : isCheckedIn ? '○ Check Out Sekarang' : '✦ Check In Sekarang'}
                </button>
              )}

              {todayAttendance?.check_out && (
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl" style={{ background: '#F8F3EA', border: '1px solid #E4D6A9' }}>
                  <span style={{ color: '#995F2F', fontSize: '18px' }}>✓</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#622B14', fontFamily: 'Georgia, serif' }}>Presensi hari ini selesai</p>
                    <p className="text-xs" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Sampai jumpa besok!</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* History */}
          <section className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-6 pt-5 pb-4 border-b flex items-center justify-between" style={{ borderColor: '#F0E9D8' }}>
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Riwayat</p>
                <h2 className="text-xl font-normal" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>30 Hari Terakhir</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: '#F0E9D8', color: '#978F66', border: '1px solid #E4D6A9', fontFamily: 'Georgia, serif' }}>
                {attendanceHistory.length} hari
              </span>
            </div>

            {attendanceHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-3xl opacity-10 mb-3" style={{ color: '#622B14' }}>◷</span>
                <p className="text-sm" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Belum ada riwayat presensi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F0E9D8' }}>
                      {['Tanggal', 'Check In', 'Check Out', 'Jam Kerja', 'Catatan'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[9px] tracking-widest uppercase" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record) => {
                      const isToday = record.date === new Date().toISOString().split('T')[0];
                      return (
                        <tr key={record.id} className="transition-colors duration-100" style={{
                          background: isToday ? 'rgba(98,43,20,0.025)' : 'transparent',
                          borderBottom: '1px solid rgba(240,233,216,0.5)',
                        }}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {isToday && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#622B14' }} />}
                              <span className="text-xs font-medium" style={{ color: '#622B14', fontFamily: 'Georgia, serif' }}>{formatDateShort(record.date)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: '#995F2F', fontFamily: 'Georgia, serif' }}>{formatTime(record.check_in)}</td>
                          <td className="px-5 py-3.5">
                            {record.check_out ? (
                              <span className="text-xs font-semibold" style={{ color: '#622B14', fontFamily: 'Georgia, serif' }}>{formatTime(record.check_out)}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#F8F3EA', color: '#978F66', border: '1px solid #E4D6A9', fontFamily: 'Georgia, serif' }}>● Belum keluar</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {record.working_hours ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs" style={{ background: '#F0E9D8', color: '#622B14', border: '1px solid #E4D6A9', fontFamily: 'Georgia, serif' }}>{record.working_hours} jam</span>
                            ) : <span className="text-xs" style={{ color: '#C4B896' }}>—</span>}
                          </td>
                          <td className="px-5 py-3.5 max-w-[160px]">
                            <span className="text-xs truncate block" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{record.notes ?? '—'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}