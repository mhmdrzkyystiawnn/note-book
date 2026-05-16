// ═══════════════════════════════════════════════════════
// EDIT NOTE PAGE — /dashboard/notes/[id]/edit/page.tsx
// ═══════════════════════════════════════════════════════
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageCropper from '@/components/ImageCropper';

interface Note {
  id: string; title: string; content: string; image_url?: string;
  emotion?: string; created_at: string; updated_at: string; user_id: string; aspect_ratio?: number;
}

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = 'Georgia, serif';

const EMOTIONS = [
  '😊','😢','😡','😴','🤩','😎','😰','🤔','😍','🎉','😌','💪','🤗','😔','🙂',
];
const EMOTION_LABELS: Record<string, string> = {
  '😊':'Senang','😢':'Sedih','😡':'Marah','😴':'Ngantuk','🤩':'Excited',
  '😎':'Keren','😰':'Cemas','🤔':'Bingung','😍':'Suka','🎉':'Rayakan',
  '😌':'Damai','💪':'Semangat','🤗':'Hangat','😔':'Lesu','🙂':'Oke',
};

export default function EditNotePage() {
  const [note, setNote]           = useState<Note | null>(null);
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [emotion, setEmotion]     = useState('😊');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage]   = useState(false);
  const [showCropper, setShowCropper]   = useState(false);
  const [cropImage, setCropImage]       = useState<string | null>(null);
  const [aspectRatio, setAspectRatio]   = useState<number | undefined>(undefined);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [user, setUser]           = useState<any>(null);
  const [dragOver, setDragOver]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/login'); return; }
        setUser(user);
        const { data, error } = await supabase
          .from('notes').select('*').eq('id', noteId).eq('user_id', user.id).single();
        if (error || !data) { router.push('/dashboard'); return; }
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
        setEmotion(data.emotion || '😊');
        if (data.image_url) setImagePreview(data.image_url);
      } catch { router.push('/dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, [noteId]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) { alert('Hanya file gambar'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Maksimal 5MB'); return; }
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File, ratio: number) => {
    setImageFile(croppedFile);
    setAspectRatio(ratio);
    setShowCropper(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(croppedFile);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { alert('Judul dan konten tidak boleh kosong'); return; }
    setSaving(true);
    try {
      let imageUrl = removeImage ? null : note?.image_url;

      if (removeImage && note?.image_url) {
        const parts = note.image_url.split('/note-images/');
        if (parts[1]) await supabase.storage.from('note-images').remove([parts[1]]);
      }

      if (imageFile) {
        if (note?.image_url && !removeImage) {
          const parts = note.image_url.split('/note-images/');
          if (parts[1]) await supabase.storage.from('note-images').remove([parts[1]]);
        }
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: upErr } = await supabase.storage.from('note-images').upload(fileName, imageFile);
        if (upErr) { alert('Gagal upload gambar'); setSaving(false); return; }
        const { data: urlData } = supabase.storage.from('note-images').getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl;
      }

      const updateData: any = {
        title, content, emotion,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (imageFile && aspectRatio) {
        updateData.aspect_ratio = aspectRatio;
      }

      const { error } = await supabase.from('notes').update(updateData).eq('id', noteId).eq('user_id', user.id);

      if (error) alert('Gagal memperbarui catatan');
      else router.push(`/dashboard/notes/${noteId}`);
    } catch { alert('Terjadi kesalahan'); }
    finally { setSaving(false); }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const fieldStyle = (field: string): React.CSSProperties => ({
    background: '#F8F3EA',
    border: `1px solid ${focusedField === field ? '#A0784A' : '#E4D6A9'}`,
    color: '#3D2010',
    fontFamily: sf,
    fontSize: '14px',
    borderRadius: '14px',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(160,120,74,0.1)' : 'none',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#E4D6A9', borderTopColor: '#622B14' }} />
          <p className="text-[0.62rem] tracking-[0.22em] uppercase" style={{ color: '#978F66', fontFamily: sf }}>Memuat catatan…</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5EFE0' }}>
        <div className="text-center space-y-4">
          <p className="text-5xl font-light opacity-10" style={{ fontFamily: gf, color: '#622B14' }}>◌</p>
          <p className="text-sm" style={{ color: '#978F66', fontFamily: sf }}>Catatan tidak ditemukan</p>
          <Link href="/dashboard" className="text-sm" style={{ color: '#995F2F', fontFamily: sf }}>← Kembali</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5EFE0' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .f1 { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .05s both; }
        .f2 { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .12s both; }
        .f3 { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .19s both; }
        .f4 { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .26s both; }
        .f5 { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .33s both; }
        textarea { resize: none; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{ background: 'rgba(245,239,224,0.9)', borderColor: '#E4D6A9' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/notes/${noteId}`}
            className="group flex items-center gap-1.5 text-sm transition-all duration-150"
            style={{ color: '#978F66', fontFamily: sf }}
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-1">←</span>
            Batal
          </Link>

          <div className="flex items-center gap-2">
            {emotion && <span className="text-lg">{emotion}</span>}
            <p
              className="text-sm font-normal truncate max-w-40"
              style={{ color: '#622B14', fontFamily: gf, fontStyle: 'italic' }}
            >
              {title || 'Edit Catatan'}
            </p>
          </div>

          <button
            form="edit-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-95"
            style={{ background: '#622B14', color: '#E4D6A9', fontFamily: sf }}
          >
            {saving ? (
              <><span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />Menyimpan…</>
            ) : '✦ Simpan'}
          </button>
        </div>
      </header>

      {/* ── Main: 2-kolom di desktop ─────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <form id="edit-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

            {/* ═══ Kolom kiri: form utama ════════════════════════ */}
            <div className="space-y-4">

              {/* Judul */}
              <div className="f1">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 4px 20px rgba(98,43,20,0.06)' }}
                >
                  <div
                    className="px-5 py-3 border-b flex items-center gap-2"
                    style={{ borderColor: '#EDE3C8', background: 'rgba(244,235,210,0.4)' }}
                  >
                    <span style={{ color: '#C4A97D', fontSize: '0.72rem' }}>✦</span>
                    <span className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: '#C4A97D', fontFamily: sf }}>
                      Judul <span style={{ color: '#995F2F' }}>*</span>
                    </span>
                  </div>
                  <div className="p-5">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Judul catatan…"
                      disabled={saving}
                      style={fieldStyle('title')}
                      onFocus={() => setFocusedField('title')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>

              {/* Konten */}
              <div className="f2">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 4px 20px rgba(98,43,20,0.06)' }}
                >
                  <div
                    className="px-5 py-3 border-b flex items-center justify-between"
                    style={{ borderColor: '#EDE3C8', background: 'rgba(244,235,210,0.4)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#C4A97D', fontSize: '0.72rem' }}>✎</span>
                      <span className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: '#C4A97D', fontFamily: sf }}>
                        Konten <span style={{ color: '#995F2F' }}>*</span>
                      </span>
                    </div>
                    <span className="text-[0.58rem]" style={{ color: '#D4C09A', fontFamily: sf }}>
                      {wordCount} kata · {charCount} karakter
                    </span>
                  </div>
                  <div className="p-5">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tulis isi catatan di sini…"
                      rows={10}
                      disabled={saving}
                      style={{ ...fieldStyle('content'), lineHeight: '1.8' }}
                      onFocus={() => setFocusedField('content')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Kolom kanan: sidebar ═══════════════════════════ */}
            <div className="space-y-4">

              {/* Mood / Emosi */}
              <div className="f3">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 4px 20px rgba(98,43,20,0.06)' }}
                >
                  <div
                    className="px-5 py-3 border-b flex items-center justify-between"
                    style={{ borderColor: '#EDE3C8', background: 'rgba(244,235,210,0.4)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#C4A97D', fontSize: '0.72rem' }}>◈</span>
                      <span className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: '#C4A97D', fontFamily: sf }}>
                        Perasaan / Mood
                      </span>
                    </div>
                    {emotion && (
                      <span className="text-[0.62rem] italic" style={{ color: '#A0784A', fontFamily: sf }}>
                        {EMOTION_LABELS[emotion]}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {/* Selected preview */}
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3"
                      style={{ background: 'rgba(98,43,20,0.04)', border: '1px solid rgba(228,214,169,0.6)' }}
                    >
                      <span className="text-3xl">{emotion}</span>
                      <div>
                        <p className="text-xs" style={{ color: '#3D2010', fontFamily: sf }}>{EMOTION_LABELS[emotion]}</p>
                        <p className="text-[0.58rem]" style={{ color: '#C4A97D', fontFamily: sf }}>Mood saat ini</p>
                      </div>
                    </div>

                    {/* Grid emosi */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {EMOTIONS.map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setEmotion(emo)}
                          disabled={saving}
                          title={EMOTION_LABELS[emo]}
                          className="relative flex items-center justify-center text-xl rounded-xl transition-all duration-150 hover:scale-110 active:scale-95"
                          style={{
                            aspectRatio: '1',
                            background: emotion === emo ? '#622B14' : '#F0E9D8',
                            border: `1px solid ${emotion === emo ? '#622B14' : '#E4D6A9'}`,
                            boxShadow: emotion === emo ? '0 4px 12px rgba(98,43,20,0.25)' : 'none',
                            transform: emotion === emo ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          {emo}
                          {emotion === emo && (
                            <span
                              className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold"
                              style={{ background: '#C4A97D', color: '#FFFDF7' }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gambar */}
              <div className="f4">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', boxShadow: '0 4px 20px rgba(98,43,20,0.06)' }}
                >
                  <div
                    className="px-5 py-3 border-b flex items-center gap-2"
                    style={{ borderColor: '#EDE3C8', background: 'rgba(244,235,210,0.4)' }}
                  >
                    <span style={{ color: '#C4A97D', fontSize: '0.72rem' }}>▣</span>
                    <span className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: '#C4A97D', fontFamily: sf }}>
                      Gambar (Opsional)
                    </span>
                  </div>
                  <div className="p-4">
                    {imagePreview && !removeImage ? (
                      <div className="relative rounded-xl overflow-hidden" style={{ background: '#F0E9D8' }}>
                        <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-52" />
                        <div
                          className="absolute inset-0 flex items-end justify-end p-2"
                          style={{ background: 'linear-gradient(to top, rgba(42,18,8,0.3) 0%, transparent 60%)' }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              setRemoveImage(true);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            disabled={saving}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150"
                            style={{ background: 'rgba(245,239,224,0.92)', color: '#622B14', backdropFilter: 'blur(4px)', fontFamily: sf }}
                          >
                            ✕ Hapus foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drop zone */
                      <div
                        className="relative rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                        style={{
                          minHeight: '120px',
                          background: dragOver ? 'rgba(98,43,20,0.07)' : '#F8F3EA',
                          border: `2px dashed ${dragOver ? '#A0784A' : '#E4D6A9'}`,
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <span className="text-2xl opacity-30" style={{ color: '#622B14' }}>▣</span>
                        <p className="text-xs text-center" style={{ color: '#B09060', fontFamily: sf }}>
                          Klik atau seret gambar ke sini
                        </p>
                        <p className="text-[0.58rem]" style={{ color: '#D4C09A', fontFamily: sf }}>
                          JPG, PNG, WebP · Maks 5MB
                        </p>
                        {removeImage && note?.image_url && (
                          <p className="text-[0.58rem] mt-1" style={{ color: '#995F2F', fontFamily: sf }}>
                            Foto lama akan dihapus saat disimpan
                          </p>
                        )}
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={saving}
                      className="hidden"
                    />

                    {/* Ganti foto jika sudah ada */}
                    {imagePreview && !removeImage && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2.5 w-full py-2 rounded-xl text-xs transition-all duration-150"
                        style={{ background: '#F0E9D8', color: '#978F66', border: '1px solid #E4D6A9', fontFamily: sf }}
                        disabled={saving}
                      >
                        ↺ Ganti gambar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="f5 flex gap-3">
                <Link
                  href={`/dashboard/notes/${noteId}`}
                  className="flex-1 flex items-center justify-center py-3 rounded-xl text-sm transition-all duration-150"
                  style={{ color: '#978F66', background: '#F0E9D8', fontFamily: sf, border: '1px solid #E4D6A9' }}
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#622B14', color: '#E4D6A9', fontFamily: sf }}
                >
                  {saving ? (
                    <><span className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />Menyimpan…</>
                  ) : '✦ Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Image Cropper Modal */}
        {showCropper && cropImage && (
          <ImageCropper
            imagePreview={cropImage}
            onCrop={handleCropComplete}
            onCancel={() => {
              setShowCropper(false);
              setCropImage(null);
            }}
          />
        )}
      </main>
    </div>
  );
}