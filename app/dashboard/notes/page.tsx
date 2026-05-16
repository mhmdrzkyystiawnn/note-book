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
import NoteCalendar from '@/components/NoteCalendar';

interface Note {
  id: string; title: string; content: string;
  image_url?: string; emotion?: string;
  aspect_ratio?: number; created_at: string; user_id: string;
}

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = 'Georgia, serif';

export default function NotesPage() {
  const [notes, setNotes]               = useState<Note[]>([]);
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState<{ id: string; email?: string } | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fabOpen, setFabOpen]           = useState(false);
  const router  = useRouter();
  const supabase = createClient();
  const toast   = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { user: au } } = await supabase.auth.getUser();
        if (!au) { router.push('/auth/login'); return; }
        setUser(au);
        const { data } = await supabase.from('notes').select('*').eq('user_id', au.id).order('created_at', { ascending: false });
        setNotes(data || []);
      } catch { router.push('/auth/login'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [router, supabase]);

  const deleteNoteImageIfNeeded = async (imageUrl?: string) => {
    if (!imageUrl) return;
    const marker = '/note-images/';
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;
    const path = imageUrl.slice(idx + marker.length);
    if (path) await supabase.storage.from('note-images').remove([path]);
  };

  const handleDeleteNote = async (id: string, imageUrl?: string) => {
    if (!confirm('Yakin ingin menghapus note ini?')) return;
    try {
      await deleteNoteImageIfNeeded(imageUrl);
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) { toast.showToast('Gagal menghapus note', 'error'); return; }
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.showToast('Note berhasil dihapus', 'success');
    } catch { toast.showToast('Terjadi kesalahan', 'error'); }
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const name = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('note-images').upload(name, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(name);
    return publicUrl;
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
      image_url: imageUrl,
      emotion: emotion || '😊',
      aspect_ratio: aspectRatio || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }]).select().single();
    if (error) { toast.showToast('Gagal menyimpan catatan', 'error'); throw error; }
    setNotes(prev => [data, ...prev]);
    setShowForm(false);
    setFabOpen(false);
  };

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchMood   = selectedMoods.length === 0 || selectedMoods.includes(n.emotion || '😊');
    return matchSearch && matchMood;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: '#E4D6A9', borderTopColor: '#622B14' }} />
          <p className="text-[0.62rem] tracking-[0.22em] uppercase" style={{ color: '#978F66', fontFamily: sf }}>
            Memuat catatan…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EFE0' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fabPop {
          from { opacity:0; transform:scale(0.85) translateY(8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .fab-item { animation: fabPop 0.2s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <Sidebar user={user} />

      <main className="flex-1 flex flex-col min-w-0 md:pl-64">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-20 backdrop-blur-md border-b"
          style={{ background: 'rgba(245,239,224,0.9)', borderColor: '#E4D6A9' }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 gap-3">

              {/* Kiri: ikon + judul */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
                  style={{ background: 'rgba(98,43,20,0.08)' }}
                >
                  <span style={{ color: '#622B14', fontSize: '0.85rem' }}>◻</span>
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-xl sm:text-2xl font-normal truncate leading-tight"
                    style={{ fontFamily: gf, color: '#622B14' }}
                  >
                    Catatan
                  </h1>
                  <p
                    className="text-[0.58rem] tracking-[0.2em] uppercase leading-none mt-0.5"
                    style={{ color: '#C4A97D', fontFamily: sf }}
                  >
                    {filteredNotes.length} dari {notes.length} catatan
                  </p>
                </div>
              </div>

              {/*
                Kanan — DESKTOP: Kalender + Tambah
                         MOBILE : hanya ikon kecil (bukan text), dengan padding
                                  kanan yang cukup agar tak tertabrak hamburger Sidebar
              */}
              <div
                className="flex items-center gap-2 shrink-0
                           pr-12 md:pr-0"
                /*
                  pr-12 di mobile: memberi ruang ~48px di kanan agar
                  hamburger Sidebar (yang biasanya fixed top-right ~44px lebar)
                  tidak menimpa tombol ini.
                  md:pr-0 karena di md+ Sidebar sudah permanent (tidak ada hamburger).
                */
              >
                {/* Kalender — icon only di mobile, icon+teks di sm+ */}
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex items-center gap-1.5 rounded-xl transition-all duration-150 active:scale-95"
                  style={{
                    background: 'rgba(153,95,47,0.09)',
                    border: '1px solid rgba(153,95,47,0.18)',
                    color: '#995F2F',
                    padding: '7px 10px',
                    fontFamily: sf,
                    fontSize: '0.75rem',
                  }}
                  title="Kalender"
                >
                  <span className="text-base leading-none">📅</span>
                  <span className="hidden sm:inline">Kalender</span>
                </button>

                {/* Tambah Catatan — icon only di mobile */}
                <button
                  onClick={() => setShowForm(f => !f)}
                  className="flex items-center gap-1.5 rounded-xl transition-all duration-150 active:scale-95"
                  style={{
                    background: showForm ? 'rgba(98,43,20,0.12)' : '#622B14',
                    border: `1px solid ${showForm ? 'rgba(98,43,20,0.2)' : '#622B14'}`,
                    color: showForm ? '#622B14' : '#E4D6A9',
                    padding: '7px 10px',
                    fontFamily: sf,
                    fontSize: '0.75rem',
                  }}
                  title={showForm ? 'Tutup' : 'Tambah Catatan'}
                >
                  <span
                    className="text-base leading-none transition-transform duration-200"
                    style={{ display: 'inline-block', transform: showForm ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                  <span className="hidden sm:inline">{showForm ? 'Tutup' : 'Tambah'}</span>
                </button>
              </div>
            </div>

            {/* Search + filter */}
            <div className="pb-4">
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

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full
                        pb-28 md:pb-6">
          {/* pb-28 mobile: ruang untuk FAB agar tidak tertutup */}

          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mb-5"
              >
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    background: '#FFFDF7',
                    borderColor: '#E4D6A9',
                    boxShadow: '0 4px 20px rgba(98,43,20,0.07)',
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#C4A97D', fontSize: '0.7rem' }}>✦</span>
                      <h2
                        className="text-[0.62rem] tracking-[0.2em] uppercase"
                        style={{ color: '#C4A97D', fontFamily: sf }}
                      >
                        Catatan Baru
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors duration-150"
                      style={{ color: '#C4A97D', background: '#F0E9D8', border: '1px solid #E4D6A9' }}
                    >
                      ✕
                    </button>
                  </div>
                  <NoteForm onSubmit={handleCreateNote} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout transition={{ duration: 0.25, ease: 'easeOut' }}>
            {searchQuery && (
              <p className="text-xs mb-4" style={{ color: '#978F66', fontFamily: sf }}>
                {filteredNotes.length} hasil untuk{' '}
                <span style={{ color: '#995F2F', fontStyle: 'italic' }}>"{searchQuery}"</span>
                {selectedMoods.length > 0 && ` dan mood ${selectedMoods.join('')}`}
              </p>
            )}

            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <p
                  className="text-6xl font-light opacity-[0.08] mb-5 select-none"
                  style={{ fontFamily: gf, color: '#622B14' }}
                >
                  {searchQuery || selectedMoods.length > 0 ? '◌' : '◻'}
                </p>
                <h3 className="text-xl font-normal mb-2" style={{ fontFamily: gf, color: '#622B14', fontStyle: 'italic' }}>
                  {searchQuery || selectedMoods.length > 0 ? 'Tidak ada catatan' : 'Belum ada catatan'}
                </h3>
                <p className="text-sm" style={{ color: '#978F66', fontFamily: sf }}>
                  {searchQuery || selectedMoods.length > 0
                    ? 'Coba kata kunci atau mood lain'
                    : 'Buat catatan pertama Anda'}
                </p>
                {!showForm && !searchQuery && selectedMoods.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-95"
                    style={{ background: '#622B14', color: '#E4D6A9', fontFamily: sf }}
                  >
                    <span>+</span> Buat catatan
                  </button>
                )}
              </div>
            ) : (
              <NoteList notes={filteredNotes} onDelete={handleDeleteNote} />
            )}
          </motion.div>
        </div>

        {/* ── FAB Mobile (md ke bawah) ─────────────────────────────────
            Muncul HANYA di mobile, di pojok kiri bawah agar jauh dari
            hamburger Sidebar yang biasanya di pojok kanan atas.
        ─────────────────────────────────────────────────────────────── */}
        <div className="fixed bottom-5 left-4 z-30 flex flex-col-reverse gap-2.5 md:hidden">
          <AnimatePresence>
            {fabOpen && (
              <>
                {/* Item: Tambah Catatan */}
                <motion.button
                  key="fab-add"
                  className="fab-item flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl shadow-lg"
                  style={{
                    background: '#622B14',
                    color: '#E4D6A9',
                    fontFamily: sf,
                    fontSize: '0.8rem',
                    boxShadow: '0 8px 28px rgba(98,43,20,0.35)',
                    animationDelay: '0.05s',
                  }}
                  onClick={() => { setShowForm(true); setFabOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                >
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    ✦
                  </span>
                  Tambah Catatan
                </motion.button>

                {/* Item: Kalender */}
                <motion.button
                  key="fab-cal"
                  className="fab-item flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl shadow-lg"
                  style={{
                    background: '#FFFDF7',
                    color: '#622B14',
                    fontFamily: sf,
                    fontSize: '0.8rem',
                    border: '1px solid #E4D6A9',
                    boxShadow: '0 8px 28px rgba(98,43,20,0.15)',
                  }}
                  onClick={() => { setShowCalendar(true); setFabOpen(false); }}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.18, delay: 0.04 }}
                >
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-base"
                    style={{ background: 'rgba(98,43,20,0.06)' }}
                  >
                    📅
                  </span>
                  Kalender
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* Tombol trigger FAB */}
          <motion.button
            onClick={() => setFabOpen(o => !o)}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200"
            style={{
              background: fabOpen ? '#F0E9D8' : '#622B14',
              color: fabOpen ? '#622B14' : '#E4D6A9',
              border: fabOpen ? '1px solid #E4D6A9' : '1px solid transparent',
              boxShadow: fabOpen
                ? '0 4px 16px rgba(98,43,20,0.15)'
                : '0 8px 32px rgba(98,43,20,0.35)',
              fontSize: '1.4rem',
            }}
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            +
          </motion.button>
        </div>

        {/* ── Calendar Modal ────────────────────────────────────────── */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              key="cal-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              style={{ background: 'rgba(28,12,4,0.55)', backdropFilter: 'blur(10px)' }}
              onClick={() => setShowCalendar(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl"
                style={{
                  background: '#FFFDF7',
                  border: '1px solid #E4D6A9',
                  boxShadow: '0 40px 100px rgba(28,12,4,0.35)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="sticky top-0 border-b px-6 py-4 flex items-center justify-between"
                  style={{
                    borderColor: '#E4D6A9',
                    background: 'rgba(255,253,247,0.95)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#C4A97D', fontSize: '0.72rem' }}>◷</span>
                    <h2
                      className="text-xl font-normal"
                      style={{ fontFamily: gf, color: '#622B14', fontStyle: 'italic' }}
                    >
                      Kalender Catatan
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-sm transition-all duration-150"
                    style={{ background: '#F0E9D8', color: '#622B14', border: '1px solid #E4D6A9' }}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  <NoteCalendar notes={notes} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}