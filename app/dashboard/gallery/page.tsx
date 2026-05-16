'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: string; title: string; content: string;
  image_url?: string; emotion?: string;
  aspect_ratio?: number;
  created_at: string; user_id: string;
}

type AspectValue = number | undefined;

const ASPECT_RATIOS: { label: string; value: AspectValue }[] = [
  { label: 'Semua', value: undefined },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '21:9', value: 21 / 9 },
];

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = '"Cormorant Garamond", Georgia, serif';

// ── Modal Preview ──────────────────────────────────────────
function ImagePreviewModal({ note, onClose, onDelete }: {
  note: Note; onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete(note.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,7,2,0.92)', backdropFilter: 'blur(20px) saturate(0.6)' }}
      onClick={onClose}
    >
      {/* Decorative grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Image container */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center max-w-[88vw] max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-1">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-white/60 text-[0.68rem] tracking-[0.25em] uppercase truncate max-w-[60%]"
            style={{ fontFamily: sf }}
          >
            {note.title}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center gap-2"
          >
            {/* Delete button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              onMouseLeave={() => setConfirmDelete(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] tracking-[0.18em] uppercase transition-all duration-300"
              style={{
                fontFamily: sf,
                background: confirmDelete ? 'rgba(180,40,20,0.75)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${confirmDelete ? 'rgba(220,60,30,0.6)' : 'rgba(255,255,255,0.15)'}`,
                color: confirmDelete ? '#fff' : 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: '0.6rem' }}>✕</span>
              {confirmDelete ? 'Konfirmasi hapus' : 'Hapus'}
            </motion.button>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '1rem',
              }}
              title="Tutup"
            >
              ✕
            </motion.button>
          </motion.div>
        </div>

        {/* Image frame */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Loading shimmer */}
          {!imageLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #2a1a10, #1a0e08)', minWidth: 280, minHeight: 180 }}
            />
          )}
          <motion.img
            src={note.image_url}
            alt={note.title}
            onLoad={() => setImageLoaded(true)}
            initial={{ filter: 'blur(12px)', opacity: 0 }}
            animate={imageLoaded ? { filter: 'blur(0px)', opacity: 1 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="block max-w-[88vw] max-h-[78vh] w-auto h-auto object-contain"
          />
        </div>

        {/* Bottom caption */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-4 flex items-center gap-3 text-white/30"
        >
          {note.emotion && (
            <span className="text-xs tracking-[0.15em] uppercase" style={{ fontFamily: sf }}>
              {note.emotion}
            </span>
          )}
          {note.emotion && <span className="w-px h-3 bg-white/20" />}
          <span className="text-[0.62rem] tracking-[0.2em] uppercase" style={{ fontFamily: sf }}>
            {new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Photo Card ─────────────────────────────────────────────
function PhotoCard({ note, onPreview, onDelete, index }: {
  note: Note; onPreview: (n: Note) => void;
  onDelete: (id: string) => Promise<void>;
  index: number;
}) {
  const aspectRatio = note.aspect_ratio || 16 / 9;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-[#E8DECA]"
      style={{
        aspectRatio: `${aspectRatio} / 1`,
        boxShadow: hovered
          ? '0 20px 48px rgba(60,20,5,0.22), 0 4px 12px rgba(60,20,5,0.12)'
          : '0 2px 12px rgba(60,20,5,0.08)',
        transition: 'box-shadow 0.4s ease, transform 0.4s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPreview(note)}
    >
      <img
        src={note.image_url}
        alt={note.title}
        className="w-full h-full object-cover"
        style={{
          transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(20,8,2,0.8) 0%, rgba(20,8,2,0.2) 45%, transparent 100%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Title */}
      <div
        className="absolute inset-x-0 bottom-0 p-3"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.3s ease, transform 0.35s ease',
        }}
      >
        <h3
          className="text-white text-sm sm:text-base font-normal leading-snug line-clamp-2 drop-shadow-lg"
          style={{ fontFamily: gf, fontStyle: 'italic' }}
        >
          {note.title}
        </h3>
        {note.emotion && (
          <p className="text-white/50 text-[0.58rem] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: sf }}>
            {note.emotion}
          </p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] text-white transition-all duration-200"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.12)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.25s ease, transform 0.25s ease, background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(180,40,20,0.75)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
      >
        ✕
      </button>
    </motion.div>
  );
}

// ── Main Gallery Page ──────────────────────────────────────
export default function GalleryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedAspect, setSelectedAspect] = useState<AspectValue>(undefined);
  const [search, setSearch] = useState('');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/login'); return; }
        setUser(user);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error) setNotes(data || []);
      } catch { router.push('/auth/login'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDeleteNote = useCallback(async (id: string) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;
    const note = notes.find(n => n.id === id);
    if (note?.image_url) {
      const parts = note.image_url.split('/note-images/');
      if (parts[1]) await supabase.storage.from('note-images').remove([parts[1]]);
    }
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) alert('Gagal menghapus');
    else setNotes(prev => prev.filter(n => n.id !== id));
  }, [notes, supabase]);

  const photoNotes = notes.filter(n => n.image_url);

  const filtered = photoNotes.filter(note => {
    if (selectedAspect !== undefined && note.aspect_ratio !== selectedAspect) return false;
    if (search && !note.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full"
            style={{ border: '1.5px solid #E4D6A9', borderTopColor: '#622B14' }}
          />
          <p className="text-[0.6rem] tracking-[0.28em] uppercase" style={{ color: '#A89870', fontFamily: sf }}>
            Memuat galeri…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EFE0' }}>
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 md:pl-[256px]">

        {/* Header */}
        <header
          className="sticky top-0 z-20 border-b"
          style={{
            background: 'rgba(245,239,224,0.92)',
            borderColor: '#E2D5B7',
            backdropFilter: 'blur(16px) saturate(1.4)',
          }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

              {/* Title block */}
              <div>
                <p className="text-[0.55rem] tracking-[0.3em] uppercase mb-1" style={{ color: '#A89870', fontFamily: sf }}>
                  Koleksi Visual
                </p>
                <h1
                  className="text-3xl sm:text-4xl font-normal leading-none"
                  style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}
                >
                  Galeri Foto
                </h1>
                <p className="text-[0.6rem] tracking-[0.18em] uppercase mt-1.5" style={{ color: '#B5A07A', fontFamily: sf }}>
                  {filtered.length} dari {photoNotes.length} foto
                </p>
              </div>

              {/* Aspect ratio filters */}
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {ASPECT_RATIOS.map(ratio => (
                  <button
                    key={ratio.label}
                    onClick={() => setSelectedAspect(ratio.value)}
                    className="px-3 py-1 rounded-full text-[0.65rem] tracking-[0.12em] uppercase transition-all duration-200"
                    style={{
                      fontFamily: sf,
                      background: selectedAspect === ratio.value ? '#3D1E0A' : 'rgba(98,43,20,0.06)',
                      color: selectedAspect === ratio.value ? '#F5EFE0' : '#7A5C3A',
                      border: `1px solid ${selectedAspect === ratio.value ? '#3D1E0A' : '#D9C9A8'}`,
                    }}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: '#B5A07A' }}
              >
                ⌕
              </span>
              <input
                type="text"
                placeholder="Cari berdasarkan judul…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  fontFamily: sf,
                  color: '#3D1E0A',
                  background: 'rgba(98,43,20,0.05)',
                  border: '1px solid #DDD0B3',
                  letterSpacing: '0.01em',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#A07840')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#DDD0B3')}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] px-1.5 py-0.5 rounded transition-colors"
                  style={{ color: '#A89870', fontFamily: sf }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Gallery Content */}
        <div className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto w-full">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <div
                className="text-8xl font-extralight mb-8 select-none"
                style={{ color: '#C8B99A', fontFamily: gf, lineHeight: 1 }}
              >
                ◌
              </div>
              <h3
                className="text-2xl font-normal mb-2"
                style={{ fontFamily: gf, color: '#7A5C3A', fontStyle: 'italic' }}
              >
                {search || selectedAspect !== undefined ? 'Tidak ada hasil' : 'Galeri masih kosong'}
              </h3>
              <p
                className="text-sm mt-1 max-w-xs leading-relaxed"
                style={{ color: '#B5A07A', fontFamily: sf, fontStyle: 'italic' }}
              >
                {search || selectedAspect !== undefined
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Tambahkan catatan bergambar dari halaman Catatan untuk mulai mengisi galeri'}
              </p>
            </motion.div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {filtered.map((note, idx) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <PhotoCard
                    note={note}
                    index={idx}
                    onPreview={setPreviewNote}
                    onDelete={handleDeleteNote}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewNote && (
          <ImagePreviewModal
            note={previewNote}
            onClose={() => setPreviewNote(null)}
            onDelete={handleDeleteNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}