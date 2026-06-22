'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import NoteList from '@/components/NoteList';
import NoteForm from '@/components/NoteForm';
import SearchNotes from '@/components/SearchNotes';

// ─── Types ────────────────────────────────────────────────────────
interface Note {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  emotion?: string;
  aspect_ratio?: number;
  created_at: string;
  user_id: string;
}

// ─── Design tokens ────────────────────────────────────────────────
const T = {
  bg:         '#F5EFE0',
  surface:    '#FFFDF7',
  ink:        '#622B14',
  inkSoft:    '#995F2F',
  gold:       '#C4A97D',
  goldLight:  '#E4D6A9',
  muted:      '#978F66',
  border:     '#E4D6A9',
  borderSoft: 'rgba(228,214,169,0.5)',
} as const;

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = 'Georgia, serif';

// ─── Shared spring ────────────────────────────────────────────────
const spring = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const};

// ─── Main page ───────────────────────────────────────────────────
export default function NotesPage() {
  const [notes, setNotes]               = useState<Note[]>([]);
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState<{ id: string; email?: string } | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [fabOpen, setFabOpen]           = useState(false);

  const router   = useRouter();
  const supabase = createClient();
  const toast    = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: au } } = await supabase.auth.getUser();
        if (!au) { router.push('/auth/login'); return; }
        setUser(au);
        const { data } = await supabase
          .from('notes').select('*')
          .eq('user_id', au.id)
          .order('created_at', { ascending: false });
        setNotes(data || []);
      } catch { router.push('/auth/login'); }
      finally   { setLoading(false); }
    };
    init();
  }, [router, supabase]);

  // ── Helpers ──
  const deleteImage = async (imageUrl?: string) => {
    if (!imageUrl) return;
    const marker = '/note-images/';
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;
    const path = imageUrl.slice(idx + marker.length);
    if (path) await supabase.storage.from('note-images').remove([path]);
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    const ext  = file.name.split('.').pop();
    const name = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('note-images').upload(name, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(name);
    return publicUrl;
  };

  // ── Handlers ──
  const handleDeleteNote = async (id: string, imageUrl?: string) => {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    try {
      await deleteImage(imageUrl);
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) { toast.showToast('Gagal menghapus catatan', 'error'); return; }
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.showToast('Catatan dihapus', 'success');
    } catch { toast.showToast('Terjadi kesalahan', 'error'); }
  };

  const handleCreateNote = async (
    title: string, content: string,
    imageFile?: File, emotion?: string, aspectRatio?: number,
  ) => {
    if (!user) return;
    let imageUrl: string | undefined;
    if (imageFile) imageUrl = await uploadImage(imageFile, user.id) || undefined;
    const { data, error } = await supabase.from('notes').insert([{
      title, content,
      image_url:    imageUrl,
      emotion:      emotion || '😊',
      aspect_ratio: aspectRatio || null,
      user_id:      user.id,
      created_at:   new Date().toISOString(),
    }]).select().single();
    if (error) { toast.showToast('Gagal menyimpan catatan', 'error'); throw error; }
    setNotes(prev => [data, ...prev]);
    setShowForm(false);
    setFabOpen(false);
  };

  const filteredNotes = notes.filter(n => {
    const q           = searchQuery.toLowerCase();
    const matchSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchMood   = selectedMoods.length === 0 || selectedMoods.includes(n.emotion || '😊');
    return matchSearch && matchMood;
  });

  const hasFilter = !!(searchQuery || selectedMoods.length);

  // ─── Loading screen ────────────────────────────────────────────
  if (loading) return (
    <div
      className="flex flex-col items-center justify-center gap-5 min-h-screen"
      style={{ background: T.bg }}
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display: 'block',
              width: 5, height: 5,
              borderRadius: '50%',
              background: T.ink,
              animation: `dotPulse 1.3s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
      <p
        className="text-[0.5rem] tracking-[0.3em] uppercase"
        style={{ color: T.muted, fontFamily: sf }}
      >
        Memuat catatan
      </p>
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50%       { opacity: 0.8; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );

  // ─── Main render ───────────────────────────────────────────────
  return (
    <div className="flex min-h-screen" style={{ background: T.bg }}>
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50%       { opacity: 0.8; transform: translateY(-3px); }
        }
        /* Thin scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.goldLight}; border-radius: 99px; }
      `}</style>

      <Sidebar user={user} />

      <main className="flex-1 flex flex-col min-w-0 md:pl-64">

        {/* ═══════════════════════════════════════ MASTHEAD ══ */}
        <header
          className="sticky top-0 z-20"
          style={{
            background: 'rgba(245,239,224,0.93)',
            backdropFilter: 'blur(14px)',
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div className="max-w-5xl mx-auto">

            {/* Title row */}
            <div
              className="flex items-end justify-between gap-4
                         px-5 sm:px-8 pt-5 pb-4
                         pr-13 md:pr-8"
            >
              {/* Left: eyebrow + display title */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className="text-[0.48rem] tracking-[0.32em] uppercase block"
                  style={{ color: T.gold, fontFamily: sf }}
                >
                  Jurnal Pribadi
                </span>
                <h1
                  className="text-[2rem] sm:text-[2.5rem] leading-none font-normal truncate"
                  style={{ fontFamily: gf, color: T.ink, fontStyle: 'italic' }}
                >
                  Catatan
                </h1>
              </div>

              {/* Right: count pill + actions */}
              <div className="flex items-center gap-2 shrink-0">

                {/* Editorial count — visible ≥sm */}
                <div
                  className="hidden sm:flex items-baseline gap-1 px-3 py-1.5 rounded-xl mr-1"
                  style={{
                    background: 'rgba(98,43,20,0.05)',
                    border: `1px solid ${T.borderSoft}`,
                  }}
                >
                  <span
                    className="text-2xl leading-none font-normal"
                    style={{ fontFamily: gf, color: T.ink }}
                  >
                    {filteredNotes.length}
                  </span>
                  {filteredNotes.length !== notes.length && (
                    <>
                      <span style={{ color: T.gold, fontSize: '0.6rem' }}>/</span>
                      <span style={{ fontFamily: gf, color: T.gold, fontSize: '1rem' }}>
                        {notes.length}
                      </span>
                    </>
                  )}
                  <span
                    className="text-[0.46rem] tracking-[0.2em] uppercase ml-0.5"
                    style={{ color: T.muted, fontFamily: sf }}
                  >
                    {filteredNotes.length === 1 ? 'catatan' : 'catatan'}
                  </span>
                </div>


                {/* Write / close button */}
                <button
                  onClick={() => setShowForm(f => !f)}
                  title={showForm ? 'Tutup' : 'Tulis catatan baru'}
                  className="flex items-center gap-2 rounded-xl
                             transition-all duration-150 active:scale-95"
                  style={{
                    height: 38,
                    padding: '0 14px',
                    background: showForm ? 'rgba(98,43,20,0.08)' : T.ink,
                    border: `1px solid ${showForm ? 'rgba(98,43,20,0.16)' : T.ink}`,
                    color: showForm ? T.ink : T.goldLight,
                    fontFamily: sf,
                    fontSize: '0.76rem',
                    letterSpacing: '0.01em',
                  }}
                >
                  <motion.span
                    animate={{ rotate: showForm ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ display: 'inline-block', lineHeight: 1, fontSize: '1.1rem' }}
                  >
                    +
                  </motion.span>
                  <span className="hidden sm:inline">
                    {showForm ? 'Tutup' : 'Tulis'}
                  </span>
                </button>
              </div>
            </div>

            {/* Hairline divider */}
            <div
              style={{
                height: 1,
                background: T.border,
                marginLeft: '1.25rem',
                marginRight: '1.25rem',
              }}
            />

            {/* Search strip */}
            <div className="px-5 sm:px-8 py-3">
              <SearchNotes
                searchQuery={searchQuery}
                selectedMoods={selectedMoods}
                onSearchChange={setSearchQuery}
                onMoodsChange={setSelectedMoods}
                totalNotes={notes.length}
                filteredCount={filteredNotes.length}
              />
            </div>
          </div>
        </header>

        {/* ════════════════════════════════════════ CONTENT ══ */}
        <div
          className="flex-1 px-4 sm:px-8 pt-5 pb-28 md:pb-10
                     max-w-5xl mx-auto w-full"
        >

          {/* ── New note form (animated panel) ── */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                key="note-form"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={spring}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    boxShadow: `0 4px 32px rgba(98,43,20,0.08)`,
                  }}
                >
                  {/* Form top bar */}
                  <div
                    className="flex items-center justify-between px-5 py-3 border-b"
                    style={{
                      borderColor: T.border,
                      background: 'rgba(228,214,169,0.12)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Accent bar */}
                      <div
                        className="rounded-full"
                        style={{ width: 3, height: 18, background: T.ink }}
                      />
                      <span
                        className="text-[0.54rem] tracking-[0.24em] uppercase"
                        style={{ color: T.muted, fontFamily: sf }}
                      >
                        Catatan Baru
                      </span>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex items-center justify-center rounded-lg
                                 transition-opacity duration-150 hover:opacity-60"
                      style={{
                        width: 28, height: 28,
                        background: T.bg,
                        border: `1px solid ${T.border}`,
                        color: T.muted,
                        fontSize: '0.7rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-5">
                    <NoteForm onSubmit={handleCreateNote} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Filter annotation ── */}
          <AnimatePresence>
            {hasFilter && (
              <motion.div
                key="filter-label"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2 mb-4"
              >
                <span style={{ color: T.goldLight, fontSize: '0.5rem' }}>◆</span>
                <p
                  style={{
                    color: T.muted,
                    fontFamily: sf,
                    fontSize: '0.68rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  {filteredNotes.length} hasil
                  {searchQuery && (
                    <>
                      {' '}untuk{' '}
                      <em style={{ color: T.inkSoft }}>&quot;{searchQuery}&quot;</em>
                    </>
                  )}
                  {selectedMoods.length > 0 && (
                    <span> · {selectedMoods.join(' ')}</span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Notes or empty state ── */}
          <motion.div layout transition={{ duration: 0.22, ease: 'easeOut' }}>
            {filteredNotes.length === 0 ? (
              <EmptyState
                hasFilter={hasFilter}
                showForm={showForm}
                onAdd={() => setShowForm(true)}
              />
            ) : (
              <NoteList notes={filteredNotes} onDelete={handleDeleteNote} />
            )}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════ FAB MOBILE ══ */}
        <div className="fixed bottom-5 left-4 z-30 flex flex-col-reverse gap-2.5 md:hidden">
          <AnimatePresence>
            {fabOpen && (
              <>
                {/* Write */}
                <motion.button
                  key="fab-write"
                  initial={{ opacity: 0, y: 10, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.88 }}
                  transition={{ duration: 0.16, delay: 0.05 }}
                  onClick={() => {
                    setShowForm(true);
                    setFabOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl"
                  style={{
                    background: T.ink,
                    color: T.goldLight,
                    fontFamily: sf,
                    fontSize: '0.8rem',
                    boxShadow: `0 8px 28px rgba(98,43,20,0.32)`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: 28, height: 28,
                      background: 'rgba(255,255,255,0.13)',
                      fontSize: '0.7rem',
                    }}
                  >
                    ✦
                  </span>
                  Tulis catatan
                </motion.button>

              </>
            )}
          </AnimatePresence>

          {/* Trigger */}
          <motion.button
            onClick={() => setFabOpen(o => !o)}
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52, height: 52,
              background: fabOpen ? T.bg : T.ink,
              color: fabOpen ? T.ink : T.goldLight,
              border: `1.5px solid ${fabOpen ? T.border : T.ink}`,
              boxShadow: fabOpen
                ? `0 4px 14px rgba(98,43,20,0.1)`
                : `0 8px 30px rgba(98,43,20,0.28)`,
              fontSize: '1.4rem',
              lineHeight: 1,
            }}
          >
            +
          </motion.button>
        </div>

      </main>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────
function EmptyState({
  hasFilter,
  showForm,
  onAdd,
}: {
  hasFilter: boolean;
  showForm: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center py-28 text-center select-none">

      {/* Ambient ghost glyph — the signature element.
          Acts like a blank journal page-marker: ∅ when truly empty,
          ◌ when a filter found nothing. */}
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          fontFamily: gf,
          fontSize: 'clamp(7rem, 22vw, 15rem)',
          color: T.ink,
          opacity: 0.04,
          fontStyle: 'italic',
          lineHeight: 1,
        }}
      >
        {hasFilter ? '◌' : '∅'}
      </span>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center gap-4">

        {/* Ornamental rule */}
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 1, background: T.border }} />
          <span style={{ color: T.gold, fontSize: '0.55rem' }}>◆</span>
          <div style={{ width: 32, height: 1, background: T.border }} />
        </div>

        <h3
          className="text-[1.6rem] font-normal"
          style={{ fontFamily: gf, color: T.ink, fontStyle: 'italic', lineHeight: 1.2 }}
        >
          {hasFilter ? 'Tidak ada hasil' : 'Halaman kosong'}
        </h3>

        <p
          className="text-sm leading-relaxed max-w-[200px]"
          style={{ color: T.muted, fontFamily: sf }}
        >
          {hasFilter
            ? 'Coba kata kunci atau mood yang berbeda.'
            : 'Mulai dengan menuliskan sesuatu yang berarti.'}
        </p>

        {!hasFilter && !showForm && (
          <button
            onClick={onAdd}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl
                       transition-all duration-150 active:scale-95 hover:opacity-90"
            style={{
              background: T.ink,
              color: T.goldLight,
              fontFamily: sf,
              fontSize: '0.78rem',
              letterSpacing: '0.01em',
            }}
          >
            <span>+</span>
            Tulis catatan pertama
          </button>
        )}
      </div>
    </div>
  );
}
