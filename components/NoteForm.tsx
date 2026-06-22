'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import ImageCropper from './ImageCropper';
import CameraCapture from './CameraCapture';
import { useToast } from './Toast';

interface NoteFormProps {
  onSubmit: (title: string, content: string, imageFile?: File, emotion?: string, aspectRatio?: number) => Promise<void>;
}

const EMOTIONS = ['😊', '😢', '😡', '😴', '🤩', '😎', '😰', '🤔', '😍', '🎉', '😌', '💪', '🤗', '😔', '🙂'];

export default function NoteForm({ onSubmit }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [emotion, setEmotion] = useState('😊');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const toast = useToast();

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.showToast('Ukuran file tidak boleh lebih dari 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File, ratio: number) => {
    try {
      setImageFile(croppedFile);
      setAspectRatio(ratio);
      // Update preview dengan image yang sudah di-crop
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        console.error('Error reading cropped file');
        toast.showToast('Gagal membaca file yang sudah di-crop', 'error');
      };
      reader.readAsDataURL(croppedFile);
      setShowCropper(false);
    } catch (error) {
      console.error('Crop complete error:', error);
      toast.showToast('Error saat memproses gambar yang sudah di-crop', 'error');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAspectRatio(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.showToast('Judul dan konten tidak boleh kosong', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(title, content, imageFile || undefined, emotion, aspectRatio || undefined);
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setAspectRatio(null);
      setEmotion('😊');
    } finally {
      setLoading(false);
    }
  };

  // Gaya dasar untuk input dan textarea
  const inputClass = `
    w-full px-4 py-2.5 rounded-xl text-sm
    bg-[#F0E9D8] border border-[#E4D6A9]
    text-[#622B14] placeholder:text-[#C4B896]
    focus:outline-none focus:border-[#995F2F] focus:ring-2 focus:ring-[#995F2F]/50
    disabled:opacity-50 transition-all duration-150
  `;

  const labelClass = `
    block text-[10px] font-serif tracking-widest uppercase
    text-[#978F66] mb-2
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-serif">
      {/* Judul */}
      <div>
        <label htmlFor="title" className={labelClass}>Judul</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Judul catatan…"
          disabled={loading}
        />
      </div>

      {/* Isi Catatan */}
      <div>
        <label htmlFor="content" className={labelClass}>Isi Catatan</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Tulis catatan Anda di sini…"
          rows={5}
          disabled={loading}
        />
      </div>

      {/* Mood Picker */}
      <div>
        <label className={labelClass}>Mood</label>
        <div className="
          flex flex-wrap gap-1.5 p-3 rounded-xl
          bg-[#F0E9D8] border border-[#E4D6A9]
        ">
          {EMOTIONS.map((emo) => (
            <button
              key={emo}
              type="button"
              onClick={() => setEmotion(emo)}
              disabled={loading}
              title={emo}
              className={`
                w-9 h-9 flex items-center justify-center rounded-xl text-lg
                transition-all duration-150
                ${emotion === emo
                  ? 'bg-[#E4D6A9] ring-2 ring-[#995F2F] scale-110 shadow-sm'
                  : 'hover:bg-[#F5EFE0] text-[#622B14]/70'
                }
                disabled:opacity-40
              `}
            >
              {emo}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#978F66] mt-1.5">
          Mood terpilih: <span className="text-base">{emotion}</span>
        </p>
      </div>

      {/* Upload Gambar (Opsional) */}
      <div>
        <label className={labelClass}>
          Gambar <span className="normal-case font-normal text-[#C4B896]">(opsional)</span>
        </label>

        {imagePreview ? (
          /* Preview gambar */
          <div className="relative rounded-xl overflow-hidden border border-[#E4D6A9] bg-[#F0E9D8]">
            <Image
              src={imagePreview}
              alt="Preview"
              width={500}
              height={224}
              className="w-full max-h-56 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-[10px] truncate max-w-[70%]">
                {imageFile?.name}
              </p>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={loading}
                className="
                  flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                  bg-white/20 hover:bg-white/30 backdrop-blur-sm
                  text-white transition-all duration-150
                "
              >
                ✕ Hapus
              </button>
            </div>
          </div>
        ) : (
          /* Drop zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-2
              py-8 rounded-xl border-2 border-dashed cursor-pointer
              transition-all duration-150
              ${dragOver
                ? 'border-[#995F2F] bg-[#F5EFE0]'
                : 'border-[#E4D6A9] bg-[#F0E9D8] hover:border-[#995F2F] hover:bg-[#F5EFE0]'
              }
            `}
          >
            <span className={`text-3xl transition-transform duration-150 ${dragOver ? 'scale-110' : ''}`}>
              ◻
            </span>
            <div className="text-center">
              <p className="text-sm font-medium text-[#622B14]">
                {dragOver ? 'Lepaskan untuk mengunggah' : 'Klik atau seret gambar ke sini'}
              </p>
              <p className="text-xs text-[#978F66] mt-0.5">
                JPG, PNG, GIF · Max 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Ganti Kamera (di atas tombol Simpan) */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', color: '#622B14' }}
        >
          📷 Buka Kamera
        </button>
      </div>

      {/* Tombol Simpan */}
      <button
        type="submit"
        disabled={loading || !title.trim() || !content.trim()}
        className="
          w-full py-2.5 rounded-xl text-sm font-semibold
          bg-[#622B14] hover:bg-[#995F2F]
          text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <span className="
              w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin
            " />
            Menyimpan…
          </>
        ) : (
          '✦ Simpan Catatan'
        )}
      </button>

      {/* Image Cropper Modal */}
      {showCropper && imagePreview && (
        <ImageCropper
          imagePreview={imagePreview}
          onCrop={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setImagePreview(null);
          }}
        />
      )}
      {showCamera && (
        <CameraCapture
          facingMode={cameraFacing}
          onCapture={(file) => { processImageFile(file); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </form>
  );
}