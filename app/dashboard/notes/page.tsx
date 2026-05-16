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
  id: string;
  title: string;
  content: string;
  image_url?: string;
  emotion?: string;
  aspect_ratio?: number;
  created_at: string;
  user_id: string;
}

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { router.push('/auth/login'); return; }
        setUser(authUser);
        const { data: notesData } = await supabase.from('notes').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false });
        setNotes(notesData || []);
      } catch { router.push('/auth/login'); }
      finally { setLoading(false); }
    };
    fetchNotes();
  }, [router, supabase]);

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Yakin ingin menghapus note ini?')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) toast.showToast('Gagal menghapus note', 'error');
    else {
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.showToast('Note berhasil dihapus', 'success');
    }
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('note-images').upload(fileName, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleCreateNote = async (title: string, content: string, imageFile?: File, emotion?: string, aspectRatio?: number) => {
    if (!user) return;
    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, user.id) || undefined;
    }
    const newNote = {
      title,
      content,
      image_url: imageUrl,
      emotion: emotion || '😊',
      aspect_ratio: aspectRatio || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('notes').insert([newNote]).select().single();
    if (error) {
      toast.showToast('Gagal menyimpan catatan', 'error');
      throw error;
    }
    setNotes(prev => [data, ...prev]);
    setShowForm(false);
  };

  const filteredNotes = notes.filter(note => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      note.title.toLowerCase().includes(q) || 
      note.content.toLowerCase().includes(q);
    
    const matchesMood = 
      selectedMoods.length === 0 || 
      selectedMoods.includes(note.emotion || '😊');
    
    return matchesSearch && matchesMood;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#E4D6A9', borderTopColor: '#622B14' }} />
          <p className="text-sm tracking-widest uppercase" style={{ color: '#978F66', fontFamily: georgiaFont }}>Memuat catatan…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EFE0' }}>
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 md:pl-64">
        <header className="sticky top-0 z-20 backdrop-blur-md border-b" style={{ background: 'rgba(245,239,224,0.85)', borderColor: '#E4D6A9' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-5 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(98,43,20,0.08)' }}>
                  <span style={{ color: '#622B14' }}>◻</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-normal truncate" style={{ fontFamily: garamondFont, color: '#622B14' }}>Catatan</h1>
                  <p className="text-[10px] tracking-widest uppercase truncate" style={{ color: '#978F66', fontFamily: georgiaFont }}>
                    {filteredNotes.length} dari {notes.length} catatan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-3 shrink-0">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#995F2F] hover:bg-[#622B14] text-white transition-all duration-150 shadow-sm"
                  title="Buka kalender"
                >
                  <span className="text-base">📅</span>
                  <span className="hidden sm:inline">Kalender</span>
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#622B14] hover:bg-[#995F2F] text-white transition-all duration-150 shadow-sm"
                >
                  <span className="text-base">{showForm ? '✕' : '+'}</span>
                  <span className="hidden sm:inline">{showForm ? 'Tutup' : 'Tambah Catatan'}</span>
                </button>
              </div>
            </div>
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

        <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
          {/* Animated presence untuk form */}
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mb-6"
              >
                <div className="bg-[#FEFAF0] rounded-xl border border-[#E4D6A9] p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-[#622B14] uppercase tracking-wider">Catatan Baru</h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-[#C4B896] hover:text-[#622B14] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <NoteForm onSubmit={handleCreateNote} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List notes dengan animasi layout (terdorong/naik) */}
          <motion.div
            layout
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {searchQuery && (
              <p className="text-xs mb-4" style={{ color: '#978F66', fontFamily: georgiaFont }}>
                {filteredNotes.length} hasil untuk <span style={{ color: '#995F2F', fontStyle: 'italic' }}>&quot;{searchQuery}&quot;</span>
                {selectedMoods.length > 0 && ` dan mood ${selectedMoods.join('')}`}
              </p>
            )}

            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-6xl font-light opacity-10 mb-5" style={{ fontFamily: garamondFont, color: '#622B14' }}>
                  {searchQuery || selectedMoods.length > 0 ? '◌' : '◻'}
                </p>
                <h3 className="text-xl font-normal mb-2" style={{ fontFamily: garamondFont, color: '#622B14' }}>
                  {searchQuery || selectedMoods.length > 0 ? 'Tidak ada catatan' : 'Belum ada catatan'}
                </h3>
                <p className="text-sm" style={{ color: '#978F66', fontFamily: georgiaFont }}>
                  {searchQuery || selectedMoods.length > 0 ? 'Coba kata kunci atau mood lain' : 'Buat catatan pertama Anda'}
                </p>
              </div>
            ) : (
              <NoteList notes={filteredNotes} onDelete={handleDeleteNote} />
            )}
          </motion.div>
        </div>

        {/* Calendar Modal */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              key="calendar-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4 backdrop-blur-sm"
              onClick={() => setShowCalendar(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-[#FEFAF0] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 border-b border-[#E4D6A9] bg-[#FEFAF0] px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ fontFamily: garamondFont, color: '#622B14' }}>
                    Kalender Catatan
                  </h2>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-[#C4B896] hover:text-[#622B14] transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
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