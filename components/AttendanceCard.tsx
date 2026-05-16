'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from './Toast';

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  date: string;
  working_hours: number | null;
  notes: string | null;
}

interface AttendanceCardProps {
  todayAttendance: AttendanceRecord | null;
  onCheckInSuccess: () => void;
  onCheckOutSuccess: () => void;
}

export default function AttendanceCard({
  todayAttendance,
  onCheckInSuccess,
  onCheckOutSuccess,
}: AttendanceCardProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const toast = useToast();

  const hasCheckedIn = !!todayAttendance;
  const hasCheckedOut = !!todayAttendance?.check_out;

  const handleCheckIn = async () => {
    if (hasCheckedIn) {
      toast.showToast('Anda sudah check in hari ini.', 'info');
      return;
    }
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('attendance').insert([{
        user_id: user.id,
        date: today,
        check_in: new Date().toISOString(),
        notes: notes || null,
      }]);

      if (error) throw error;
      setNotes('');
      toast.showToast('✅ Check in berhasil!', 'success');
      onCheckInSuccess();
    } catch {
      toast.showToast('❌ Gagal check in.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      toast.showToast('Anda belum check in.', 'info');
      return;
    }
    if (hasCheckedOut) {
      toast.showToast('Anda sudah check out hari ini.', 'info');
      return;
    }
    try {
      setLoading(true);
      const checkOutTime = new Date().toISOString();
      const workingHours = (new Date(checkOutTime).getTime() - new Date(todayAttendance.check_in).getTime()) / 3600000;
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: checkOutTime,
          working_hours: Math.round(workingHours * 100) / 100,
          notes: notes || todayAttendance.notes,
        })
        .eq('id', todayAttendance.id);

      if (error) throw error;
      setNotes('');
      toast.showToast(`✅ Check out berhasil! ${Math.round(workingHours * 100) / 100} jam kerja.`, 'success');
      onCheckOutSuccess();
    } catch {
      toast.showToast('❌ Gagal check out.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: string) => new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Check In',
            value: todayAttendance ? formatTime(todayAttendance.check_in) : '—',
            sub: todayAttendance ? formatDate(todayAttendance.check_in) : null,
            active: hasCheckedIn,
            accentBg: '#FDF6EC',
            accentBorder: 'rgba(153,95,47,0.2)',
            accentText: '#995F2F',
          },
          {
            label: 'Check Out',
            value: hasCheckedOut ? formatTime(todayAttendance.check_out!) : '—',
            sub: null,
            active: hasCheckedOut,
            accentBg: '#FDF6EC',
            accentBorder: 'rgba(98,43,20,0.2)',
            accentText: '#622B14',
          },
          {
            label: 'Jam Kerja',
            value: todayAttendance?.working_hours ? `${todayAttendance.working_hours}j` : '—',
            sub: null,
            active: !!todayAttendance?.working_hours,
            accentBg: '#FDF6EC',
            accentBorder: 'rgba(151,143,102,0.25)',
            accentText: '#978F66',
          },
        ].map((card, i) => (
          <div key={i} className="rounded-xl p-4 transition-all duration-200" style={{
            background: card.active ? card.accentBg : '#F8F3EA',
            border: `1px solid ${card.active ? card.accentBorder : '#E4D6A9'}`,
          }}>
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{card.label}</p>
            <p className="text-2xl font-light" style={{ fontFamily: '"EB Garamond", Garamond, serif', color: card.active ? card.accentText : '#C4B896' }}>
              {card.value}
            </p>
            {card.sub && <p className="text-xs mt-1.5" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>{card.sub}</p>}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: '#978F66', fontFamily: 'Georgia, serif' }}>
          Catatan <span className="normal-case font-normal">(opsional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan catatan untuk hari ini…"
          rows={2}
          disabled={loading || hasCheckedOut}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all duration-150"
          style={{
            background: '#F8F3EA',
            border: '1px solid #E4D6A9',
            color: '#622B14',
            fontFamily: 'Georgia, serif',
          }}
          onFocus={e => e.target.style.borderColor = '#995F2F'}
          onBlur={e => e.target.style.borderColor = '#E4D6A9'}
        />
      </div>

      <div className="space-y-3">
        {!hasCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm tracking-widest uppercase font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              background: '#622B14',
              color: '#E4D6A9',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.12em',
            }}
          >
            {loading ? 'Memproses…' : '✦ Check In'}
          </button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <>
            <div className="text-center text-xs py-2 rounded-full" style={{ background: '#F0E9D8', color: '#622B14' }}>
              ✓ Anda sudah check in hari ini
            </div>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm tracking-widest uppercase font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                background: '#995F2F',
                color: '#E4D6A9',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.12em',
              }}
            >
              {loading ? 'Memproses…' : '○ Check Out'}
            </button>
          </>
        )}

        {hasCheckedOut && (
          <div className="text-center text-sm py-3 rounded-full" style={{ background: '#E4D6A9', color: '#622B14' }}>
            ✔️ Anda sudah hadir hari ini (selesai)
          </div>
        )}
      </div>
    </div>
  );
}