'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Note {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  emotion?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  aspect_ratio?: number;
}

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

function getReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
}
function getParagraphCount(text: string) {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}
function getTimeOfDay(dateStr: string) {
  const h = new Date(dateStr).getHours();
  if (h >= 5 && h < 12) return { label: 'Pagi', icon: '🌅' };
  if (h >= 12 && h < 15) return { label: 'Siang', icon: '☀️' };
  if (h >= 15 && h < 18) return { label: 'Sore', icon: '🌤️' };
  if (h >= 18 && h < 21) return { label: 'Malam', icon: '🌆' };
  return { label: 'Tengah Malam', icon: '🌙' };
}
function getDayName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' });
}

// ── Chip kecil untuk sidebar ──────────────────────────────────────────────────
function MetaChip({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
      style={{ background: 'rgba(98,43,20,0.035)', border: '1px solid rgba(228,214,169,0.55)' }}
    >
      <span
        className="text-[0.6rem] tracking-[0.18em] uppercase shrink-0"
        style={{ color: '#C4A97D', fontFamily: georgiaFont }}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
      <span
        className="text-xs text-right"
        style={{ color: '#622B14', fontFamily: georgiaFont, fontStyle: 'italic' }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Card container sidebar ────────────────────────────────────────────────────
function SideCard({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: '#FFFDF7',
        border: '1px solid #E4D6A9',
        boxShadow: '0 4px 18px rgba(98,43,20,0.06)',
      }}
    >
      <div
        className="px-4 py-2.5 border-b flex items-center gap-1.5"
        style={{ borderColor: '#EDE3C8', background: 'rgba(244,235,210,0.45)' }}
      >
        <span style={{ color: '#C4A97D', fontSize: '0.7rem' }}>{icon}</span>
        <span
          className="text-[0.6rem] tracking-[0.2em] uppercase"
          style={{ color: '#C4A97D', fontFamily: georgiaFont }}
        >
          {label}
        </span>
      </div>
      <div className="p-3.5 space-y-2">{children}</div>
    </div>
  );
}

export default function NoteDetailPage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/login'); return; }
        setUser(user);
        const { data, error } = await supabase
          .from('notes').select('*').eq('id', noteId).eq('user_id', user.id).single();
        if (error || !data) { router.push('/dashboard'); return; }
        setNote(data);
      } catch { router.push('/dashboard'); }
      finally { setLoading(false); }
    };
    loadNote();
  }, [noteId, router, supabase]);

  const handleDeleteNote = async () => {
    if (!user) return;
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    setDeleting(true);
    try {
      if (note?.image_url) {
        const urlParts = note.image_url.split('/');
        await supabase.storage.from('note-images').remove([`${user.id}/${urlParts[urlParts.length - 1]}`]);
      }
      const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('user_id', user.id);
      if (error) {
        toast.showToast('Gagal menghapus note', 'error');
        return;
      }
      toast.showToast('Note berhasil dihapus', 'success');
      router.push('/dashboard');
    } catch { toast.showToast('Terjadi kesalahan saat menghapus note', 'error'); }
    finally { setDeleting(false); }
  };

  const handleCopy = () => {
    if (!note) return;
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const formatDateShort = (s: string) =>
    new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: '#E4D6A9', borderTopColor: '#622B14' }} />
          <p className="text-[0.65rem] tracking-[0.22em] uppercase"
            style={{ color: '#978F66', fontFamily: georgiaFont }}>Memuat catatan…</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5EFE0' }}>
        <div className="text-center space-y-4">
          <p className="text-6xl opacity-10" style={{ fontFamily: garamondFont, color: '#622B14' }}>◌</p>
          <p className="text-sm" style={{ color: '#978F66', fontFamily: georgiaFont }}>Catatan tidak ditemukan</p>
          <Link href="/dashboard" className="text-sm" style={{ color: '#995F2F', fontFamily: georgiaFont }}>
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { words, minutes } = getReadingTime(note.content);
  const paragraphs = getParagraphCount(note.content);
  const chars = note.content.length;
  const tod = getTimeOfDay(note.created_at);
  const day = getDayName(note.created_at);
  const isEdited = note.updated_at !== note.created_at;

  // Drop cap: huruf pertama dari konten (unused for current design)
  // const firstChar = note.content.trim()[0] ?? '';
  // const restContent = note.content.trim().slice(1);

  return (
    <div className="min-h-screen" style={{ background: '#F5EFE0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }

        .r1 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .04s both; }
        .r2 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .14s both; }
        .r3 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .24s both; }
        .r4 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .34s both; }
        .r5 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .44s both; }

        /* Drop cap editorial */
        .drop-cap::first-letter {
          float: left;
          font-family: ${garamondFont};
          font-size: 4.4em;
          line-height: 0.78;
          margin-right: 0.09em;
          margin-top: -0.4em;
          color: #622B14;
          font-style: italic;
          shape-outside: margin-box;
        }

        /* Garis dekoratif kiri pada card konten */
        .content-accent-bar {
          position: absolute;
          left: 0; top: 2rem; bottom: 2rem;
          width: 3px;
          background: linear-gradient(to bottom, #C4A97D 0%, #E4D6A9 60%, transparent 100%);
          border-radius: 99px;
        }

        .pill-btn { transition: background .15s, box-shadow .15s, transform .12s; }
        .pill-btn:hover { box-shadow: 0 2px 12px rgba(98,43,20,0.14); transform: translateY(-1px); }
        .pill-btn:active { transform: scale(0.97); }

        .side-action:hover { background: rgba(98,43,20,0.07) !important; }
        .delete-action:hover { background: rgba(180,60,30,0.07) !important; color: #b43c1e !important; }

        /* Masonry sidebar */
        .sidebar-masonry {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Divider ornamental */
        .ornament-divider {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin: 1.5rem 0;
        }
        .ornament-divider::before,
        .ornament-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #E4D6A9, transparent);
        }

        /* Reading progress bar */
        #reading-bar {
          position: fixed;
          top: 0; left: 0;
          height: 2px;
          background: linear-gradient(to right, #C4A97D, #622B14);
          z-index: 50;
          transition: width .1s linear;
        }

        /* Stat besar */
        .stat-big {
          transition: transform .2s ease;
        }
        .stat-big:hover { transform: translateY(-2px); }
      `}</style>

      {/* Reading Progress */}
      <ReadingProgressBar />

      {/* ── Header sticky ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(245,239,224,0.93)' : 'rgba(245,239,224,0.55)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid #E4D6A9' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 24px rgba(98,43,20,0.07)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link
            href="/dashboard/notes"
            className="group flex items-center gap-2 text-sm transition-all duration-150"
            style={{ color: '#978F66', fontFamily: georgiaFont }}
          >
            <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">←</span>
            <span className="hidden sm:inline">Semua Catatan</span>
          </Link>

          {/* judul muncul saat scroll */}
          <div
            className="flex items-center gap-2 overflow-hidden transition-all duration-300"
            style={{ opacity: scrolled ? 1 : 0, maxWidth: scrolled ? '280px' : '0' }}
          >
            {note.emotion && <span className="text-base">{note.emotion}</span>}
            <span className="text-sm truncate" style={{ fontFamily: garamondFont, color: '#622B14', fontStyle: 'italic' }}>
              {note.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="pill-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs"
              style={{
                background: copied ? 'rgba(98,43,20,0.12)' : 'rgba(98,43,20,0.05)',
                color: copied ? '#622B14' : '#978F66',
                fontFamily: georgiaFont,
                border: '1px solid rgba(98,43,20,0.10)',
              }}
            >
              {copied ? '✓ Disalin' : '⎘ Salin'}
            </button>
            <Link
              href={`/dashboard/notes/${note.id}/edit`}
              className="pill-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'rgba(98,43,20,0.06)', color: '#622B14',
                fontFamily: georgiaFont, border: '1px solid rgba(98,43,20,0.12)',
              }}
            >
              ✎ Edit
            </Link>
            <button
              onClick={handleDeleteNote}
              disabled={deleting}
              className="pill-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs disabled:opacity-40"
              style={{
                background: 'rgba(153,95,47,0.06)', color: '#995F2F',
                fontFamily: georgiaFont, border: '1px solid rgba(153,95,47,0.12)',
              }}
            >
              {deleting
                ? <><span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />Menghapus…</>
                : '✕ Hapus'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">

        {/* Page headline */}
        <div className="r1 mb-8 sm:mb-10">
          <p
            className="text-[0.65rem] tracking-[0.25em] uppercase mb-3"
            style={{ color: '#C4A97D', fontFamily: georgiaFont }}
          >
            {tod.icon} {tod.label} · {day} · {formatDateShort(note.created_at)}
          </p>
          <div className="flex items-start gap-4">
            {note.emotion && (
              <span className="text-5xl sm:text-6xl leading-none shrink-0 drop-shadow" style={{ marginTop: '0.06em' }}>
                {note.emotion}
              </span>
            )}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.12] tracking-tight"
              style={{ fontFamily: garamondFont, color: '#3D2010', fontStyle: 'italic' }}
            >
              {note.title}
            </h1>
          </div>
        </div>

        {/* ── Grid utama: konten (lebar) + sidebar metadata ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ═══ KOLOM KIRI: konten + gambar ═══════════════════════════════════ */}
          <div className="space-y-5">

            {/* CARD KONTEN — hero, dominan ------------------------------------ */}
            <div className="r2">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: '#FFFDF7',
                  border: '1px solid #E0D3A8',
                  boxShadow: '0 12px 48px rgba(98,43,20,0.11), 0 2px 8px rgba(98,43,20,0.06)',
                }}
              >
                {/* Garis aksen kiri */}
                <span className="content-accent-bar" />

                {/* Label section */}
                <div
                  className="pl-8 pr-6 pt-6 pb-4 border-b flex items-center justify-between"
                  style={{ borderColor: '#EDE3C8' }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#C4A97D', fontSize: '0.75rem' }}>✦</span>
                    <span
                      className="text-[0.62rem] tracking-[0.22em] uppercase"
                      style={{ color: '#C4A97D', fontFamily: georgiaFont }}
                    >
                      Isi Catatan
                    </span>
                  </div>
                  {/* Reading stats inline — menguatkan hierarchy */}
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[0.6rem] tracking-wide"
                      style={{ color: '#D4C09A', fontFamily: georgiaFont }}
                    >
                      {words.toLocaleString('id-ID')} kata · ~{minutes} mnt baca
                    </span>
                  </div>
                </div>

                {/* Konten — ukuran besar, leading longgar = nyaman dibaca */}
                <div className="pl-8 pr-6 sm:pr-8 py-8 sm:py-10">
                  {/*
                    Typography scale:
                    - font-size  : 1.18rem  (lebih besar dari metadata ~0.8–0.9rem → kontras ~1.3×)
                    - line-height: 2.05      (longgar → breathing room, mengurangi kognitif load)
                    - letter-spacing: 0.012em (sedikit open → georgia lebih legible di ukuran ini)
                    - color: #2E1A0E        (lebih gelap dari metadata #622B14 → foreground kuat)
                  */}
                  <div
                    className="drop-cap"
                    style={{
                      fontFamily: georgiaFont,
                      color: '#2E1A0E',
                      fontSize: '1.18rem',
                      lineHeight: '2.05',
                      letterSpacing: '0.012em',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      paddingTop: '0rem',
                    }}
                  >
                    {note.content.trim()}
                  </div>

                  {/* Ornament penutup */}
                  <div className="ornament-divider mt-8">
                    <span
                      className="text-xs"
                      style={{ color: '#D4C09A', fontFamily: garamondFont, letterSpacing: '0.3em' }}
                    >
                      ✦ ✦ ✦
                    </span>
                  </div>

                  {/* Footer card konten: tanggal + aksi */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <p
                      className="text-xs"
                      style={{ color: '#C4A97D', fontFamily: georgiaFont, fontStyle: 'italic' }}
                    >
                      {formatDate(note.created_at)}
                      {isEdited && (
                        <span className="ml-2 not-italic" style={{ color: '#D4C09A' }}>
                          · diedit {formatDate(note.updated_at)}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="pill-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-xs"
                      style={{
                        background: copied ? 'rgba(98,43,20,0.10)' : 'rgba(98,43,20,0.04)',
                        color: copied ? '#622B14' : '#B09060',
                        fontFamily: georgiaFont,
                        border: '1px solid rgba(98,43,20,0.09)',
                      }}
                    >
                      {copied ? '✓ Disalin' : '⎘ Salin teks'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD GAMBAR — di bawah konten, full width kolom kiri ----------- */}
            {note.image_url && (
              <div className="r3">
                <div
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: '#F0E9D8',
                    border: '1px solid #E4D6A9',
                    boxShadow: '0 6px 24px rgba(98,43,20,0.08)',
                  }}
                >
                  <div
                    className="px-5 py-3 border-b flex items-center gap-2"
                    style={{ borderColor: '#EDE3C8', background: 'rgba(244,235,210,0.5)' }}
                  >
                    <span style={{ color: '#C4A97D', fontSize: '0.72rem' }}>▣</span>
                    <span className="text-[0.6rem] tracking-[0.2em] uppercase"
                      style={{ color: '#C4A97D', fontFamily: georgiaFont }}>Gambar Terlampir</span>
                  </div>
                  <div 
                    className="relative overflow-hidden group"
                    style={{ aspectRatio: note.aspect_ratio ? String(note.aspect_ratio) : '16/9' }}
                  >
                    {!imgLoaded && (
                      <div className="absolute inset-0 animate-pulse"
                        style={{ background: 'linear-gradient(90deg,#E4D6A9 25%,#EDE3C8 50%,#E4D6A9 75%)', backgroundSize: '200% auto' }} />
                    )}
                    <Image
                      src={note.image_url}
                      alt={note.title}
                      fill
                      onLoad={() => setImgLoaded(true)}
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                      style={{
                        opacity: imgLoaded ? 1 : 0,
                        transition: 'opacity .5s ease, transform .7s ease',
                      }}
                    />
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(98,43,20,0.10) 0%, transparent 45%)' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══ KOLOM KANAN: sidebar metadata (masonry vertikal) ══════════════ */}
          <div className="r4 sidebar-masonry">

            {/* ─ Statistik ─ */}
            <SideCard label="Statistik" icon="◈">
              {/*
                Stats dalam grid 2×2 — angkanya pakai Garamond besar, label kecil:
                Kontras ukuran ~3.5× antara angka (1.6rem) dan label (0.58rem)
                menciptakan scannable data yang jelas tanpa kompetisi dengan konten.
              */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Kata', value: words.toLocaleString('id-ID'), icon: '❦' },
                  { label: 'Karakter', value: chars.toLocaleString('id-ID'), icon: '⌨' },
                  { label: 'Paragraf', value: String(paragraphs), icon: '¶' },
                  { label: 'Menit Baca', value: `~${minutes}`, icon: '◷' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="stat-big rounded-lg p-3 flex flex-col gap-1"
                    style={{ background: 'rgba(98,43,20,0.035)', border: '1px solid rgba(228,214,169,0.5)' }}
                  >
                    <span style={{ color: '#D4C09A', fontSize: '0.75rem' }}>{s.icon}</span>
                    <span
                      className="font-normal leading-none"
                      style={{ fontFamily: garamondFont, color: '#622B14', fontSize: '1.65rem' }}
                    >
                      {s.value}
                    </span>
                    <span
                      className="text-[0.58rem] tracking-[0.18em] uppercase leading-none"
                      style={{ color: '#C4A97D', fontFamily: georgiaFont }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </SideCard>

            {/* ─ Waktu ─ */}
            <SideCard label="Waktu" icon="◷">
              <MetaChip label="Dibuat" value={formatDate(note.created_at)} icon="✦" />
              <MetaChip label="Hari" value={`${day} · ${tod.icon} ${tod.label}`} />
              {isEdited && (
                <MetaChip label="Diedit" value={formatDate(note.updated_at)} icon="✎" />
              )}
            </SideCard>

            {/* ─ Properti ─ */}
            <SideCard label="Properti" icon="⊹">
              <MetaChip label="ID" value={`#${note.id.slice(0, 8).toUpperCase()}`} />
              <MetaChip label="Emosi" value={note.emotion ? `${note.emotion} Terlampir` : '— Tidak ada'} />
              <MetaChip label="Gambar" value={note.image_url ? '▣ Terlampir' : '— Tidak ada'} />
              <MetaChip label="Status" value={isEdited ? '✎ Pernah Diedit' : '✦ Asli'} />
            </SideCard>

            {/* ─ Aksi ─ */}
            <SideCard label="Aksi" icon="⚡">
              <Link
                href={`/dashboard/notes/${note.id}/edit`}
                className="side-action flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs group transition-all duration-150"
                style={{
                  background: 'rgba(98,43,20,0.04)', border: '1px solid rgba(98,43,20,0.09)',
                  color: '#622B14', fontFamily: georgiaFont,
                }}
              >
                <span className="flex items-center gap-2"><span>✎</span><span>Edit Catatan</span></span>
                <span className="opacity-30 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <button
                onClick={handleCopy}
                className="side-action flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs group transition-all duration-150"
                style={{
                  background: copied ? 'rgba(98,43,20,0.08)' : 'rgba(98,43,20,0.03)',
                  border: '1px solid rgba(98,43,20,0.08)',
                  color: copied ? '#622B14' : '#995F2F',
                  fontFamily: georgiaFont,
                }}
              >
                <span className="flex items-center gap-2">
                  <span>{copied ? '✓' : '⎘'}</span>
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </span>
                <span className="text-[0.6rem] opacity-30" style={{ fontFamily: 'monospace' }}>.txt</span>
              </button>
              <button
                onClick={handleDeleteNote}
                disabled={deleting}
                className="delete-action flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs group transition-all duration-150 disabled:opacity-40"
                style={{
                  background: 'rgba(153,95,47,0.04)', border: '1px solid rgba(153,95,47,0.09)',
                  color: '#995F2F', fontFamily: georgiaFont,
                }}
              >
                <span className="flex items-center gap-2">
                  <span>{deleting ? '…' : '✕'}</span>
                  <span>{deleting ? 'Menghapus…' : 'Hapus Catatan'}</span>
                </span>
                {!deleting && <span className="opacity-25 text-xs">⚠</span>}
              </button>
            </SideCard>

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <div
          className="r5 mt-10 flex flex-wrap items-center justify-between gap-4 text-sm pt-6"
          style={{ borderTop: '1px solid #E4D6A9' }}
        >
          <Link
            href="/dashboard/notes"
            className="group flex items-center gap-1.5 transition-all duration-150 hover:-translate-x-0.5"
            style={{ color: '#978F66', fontFamily: georgiaFont }}
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-1">←</span>
            <span>Semua Catatan</span>
          </Link>
          <span
            style={{ color: '#D4C9A8', fontFamily: garamondFont, fontSize: '0.75rem', letterSpacing: '0.08em', fontStyle: 'italic' }}
          >
            {formatDateShort(note.created_at)}
          </span>
          <Link
            href="/dashboard"
            className="group flex items-center gap-1.5 transition-all duration-150 hover:translate-x-0.5"
            style={{ color: '#978F66', fontFamily: georgiaFont }}
          >
            <span>Dashboard</span>
            <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Reading Progress Bar ──────────────────────────────────────────────────────
function ReadingProgressBar() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setWidth(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      id="reading-bar"
      style={{ width: `${width}%` }}
    />
  );
}