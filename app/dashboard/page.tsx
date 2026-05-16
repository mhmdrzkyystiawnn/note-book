'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import CountdownForm from '@/components/CountdownForm';
import CountdownCard from '@/components/CountdownCard';
import AttendanceCard from '@/components/AttendanceCard';

interface Note {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  emotion?: string;
  created_at: string;
  user_id: string;
}

interface Countdown {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  color: string;
  user_id: string;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  date: string;
  working_hours: number | null;
  notes: string | null;
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingCountdown, setSubmittingCountdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/login'); return; }
        setUser(user);

        try {
          const { data: notesData, error: notesError } = await supabase
            .from('notes').select('*').eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (!notesError) setNotes(notesData || []);

          const { data: countdownsData, error: countdownsError } = await supabase
            .from('countdowns').select('*').eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (!countdownsError) setCountdowns(countdownsData || []);

          const today = new Date().toISOString().split('T')[0];
          const { data: attendanceData } = await supabase
            .from('attendance').select('*').eq('user_id', user.id).eq('date', today).single();
          setTodayAttendance(attendanceData || null);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router, supabase]);

  const handleAddNote = async (title: string, content: string, imageFile?: File, emotion?: string) => {
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('note-images').upload(fileName, imageFile);
        if (uploadError) { alert('Gagal mengupload gambar'); return; }
        const { data: publicUrlData } = supabase.storage.from('note-images').getPublicUrl(fileName);
        imageUrl = publicUrlData?.publicUrl;
      }
      const { data, error } = await supabase
        .from('notes').insert([{ title, content, image_url: imageUrl, emotion: emotion || '😊', user_id: user.id }]).select();
      if (error) { alert('Gagal menambah note'); }
      else if (data) { setNotes([data[0], ...notes]); alert('Note berhasil disimpan!'); }
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Yakin ingin menghapus note ini?')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) alert('Gagal menghapus note');
    else setNotes(notes.filter(note => note.id !== id));
  };

  const handleCreateCountdown = async (data: { title: string; description: string; start_date: string; end_date: string; color: string }) => {
    if (!user?.id) return;
    try {
      setSubmittingCountdown(true);
      const { data: insertedData, error } = await supabase
        .from('countdowns').insert([{ ...data, user_id: user.id }]).select();
      if (error) alert('Gagal membuat countdown');
      else if (insertedData) { setCountdowns([insertedData[0], ...countdowns]); alert('Countdown berhasil dibuat!'); }
    } finally {
      setSubmittingCountdown(false);
    }
  };

  const handleDeleteCountdown = async (id: string) => {
    const { error } = await supabase.from('countdowns').delete().eq('id', id);
    if (error) alert('Gagal menghapus countdown');
    else setCountdowns(countdowns.filter(c => c.id !== id));
  };

  const refreshAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('attendance').select('*').eq('user_id', user?.id).eq('date', today).single();
    setTodayAttendance(data || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#995F2F', borderTopColor: 'transparent' }} />
          <p className="text-sm tracking-widest uppercase" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Memuat…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EFE0' }}>
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 md:pl-[256px]">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md border-b" style={{ background: 'rgba(245,239,224,0.85)', borderColor: '#E4D6A9' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-5">
              <div>
                <h1 className="text-3xl font-normal tracking-tight" style={{ fontFamily: '"EB Garamond", Garamond, "Times New Roman", serif', color: '#622B14' }}>
                  Dashboard
                </h1>
                <p className="text-xs tracking-widest uppercase mt-1" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>
                  Ruang kerja personal Anda
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest uppercase" style={{ background: '#E4D6A9', color: '#622B14' }}>
                <span>✦</span>
                <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Catatan', value: notes.length, icon: '◻', href: '/dashboard/notes', cta: 'Lihat semua →', accent: '#622B14' },
              { label: 'Total Foto', value: notes.filter(n => n.image_url).length, icon: '▣', href: '/dashboard/gallery', cta: 'Lihat galeri →', accent: '#995F2F' },
              { label: 'Target Aktif', value: countdowns.length, icon: '◎', href: null, cta: 'Countdown berjalan', accent: '#978F66' },
              {
                label: 'Status Hari Ini',
                value: todayAttendance ? 'Sudah Hadir' : 'Belum',
                icon: todayAttendance ? '●' : '○',
                href: '/dashboard/attendance',
                cta: todayAttendance?.working_hours ? `${todayAttendance.working_hours}h kerja` : (todayAttendance ? 'Check out belum' : 'Belum check in'),
                accent: todayAttendance ? '#622B14' : '#978F66'
              },
            ].map((stat, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-0.5" style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 2px 12px rgba(98,43,20,0.06)' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs tracking-widest uppercase" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{stat.label}</span>
                  <span className="text-lg" style={{ color: stat.accent }}>{stat.icon}</span>
                </div>
                <p className="text-4xl font-light mb-3" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>{stat.value}</p>
                {stat.href ? (
                  <Link href={stat.href} className="text-xs tracking-wide transition-colors" style={{ color: '#995F2F' }}>{stat.cta}</Link>
                ) : (
                  <p className="text-xs" style={{ color: '#978F66' }}>{stat.cta}</p>
                )}
                <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl opacity-5" style={{ background: stat.accent }} />
              </div>
            ))}
          </div>

          {/* Attendance Section */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 2px 12px rgba(98,43,20,0.06)' }}>
            <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: '#E4D6A9' }}>
              <span style={{ color: '#995F2F' }}>◷</span>
              <h2 className="text-lg font-normal tracking-tight" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>Presensi Hari Ini</h2>
            </div>
            <div className="p-6">
              <AttendanceCard
                todayAttendance={todayAttendance}
                onCheckInSuccess={refreshAttendance}
                onCheckOutSuccess={refreshAttendance}
              />
            </div>
          </div>

          {/* Countdown Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: '#E4D6A9' }} />
              <h2 className="text-lg font-normal tracking-tight px-3 whitespace-nowrap" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>◎ Target & Deadline</h2>
              <div className="flex-1 h-px" style={{ background: '#E4D6A9' }} />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Form Section - Lebih besar (proporsi 40% agar form lebih lega) */}
              <div className="lg:w-2/5">
                <div className="rounded-2xl p-6 sticky top-24" style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 2px 12px rgba(98,43,20,0.06)' }}>
                  <h3 className="text-base font-normal mb-4" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>Buat Target Baru</h3>
                  <CountdownForm onSubmit={handleCreateCountdown} isLoading={submittingCountdown} />
                </div>
              </div>

              {/* List Countdown Section (mengisi 60% sisanya) */}
              <div className="lg:w-3/5">
                {countdowns.length === 0 ? (
                  <div className="rounded-2xl p-16 text-center" style={{ background: '#FFFDF7', border: '1px dashed #E4D6A9' }}>
                    <p className="text-4xl mb-3 opacity-20" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: '#622B14' }}>◎</p>
                    <p className="text-sm" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>Belum ada target countdown</p>
                    <p className="text-xs mt-1" style={{ color: '#E4D6A9' }}>Buat target baru untuk tracking progres</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {countdowns.map((countdown) => (
                      <CountdownCard key={countdown.id} countdown={countdown} onDelete={handleDeleteCountdown} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}