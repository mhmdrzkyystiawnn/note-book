'use client';

import { useState } from 'react';
import { useToast } from './Toast';

interface CountdownFormProps {
  onSubmit: (data: { title: string; description: string; start_date: string; end_date: string; color: string }) => Promise<void>;
  isLoading: boolean;
}

export default function CountdownForm({ onSubmit, isLoading }: CountdownFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('mahoni');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.showToast('Judul tidak boleh kosong', 'error');
      return;
    }
    if (!startDate || !endDate) {
      toast.showToast('Tanggal awal dan akhir harus diisi', 'error');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.showToast('Tanggal awal tidak boleh kurang dari hari ini (tidak boleh kemarin atau sebelumnya)', 'error');
      return;
    }
    if (start >= end) {
      toast.showToast('Tanggal akhir harus lebih besar dari tanggal awal', 'error');
      return;
    }

    await onSubmit({ title: title.trim(), description: description.trim(), start_date: startDate, end_date: endDate, color });
    setTitle(''); setDescription(''); setStartDate(new Date().toISOString().split('T')[0]); setEndDate(''); setColor('mahoni');
  };

  // Warna aksen yang lebih cocok dengan tema (coklat, hangat)
  const colors = [
    { value: 'mahoni',   label: 'Mahoni',   hex: '#622B14' },
    { value: 'sienna',   label: 'Sienna',   hex: '#995F2F' },
    { value: 'khaki',    label: 'Khaki',    hex: '#978F66' },
    { value: 'cokelat',  label: 'Cokelat',  hex: '#7A4020' },
    { value: 'tembaga',  label: 'Tembaga',  hex: '#B37040' },
    { value: 'krem',     label: 'Krem',     hex: '#E4D6A9' },
  ];

  // const getColorHex = (val: string) => colors.find(c => c.value === val)?.hex || '#622B14';

  const inputStyle: React.CSSProperties = {
    background: '#F8F3EA',
    border: '1px solid #E4D6A9',
    color: '#622B14',
    fontFamily: 'Georgia, serif',
    fontSize: '13px',
    borderRadius: '10px',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#978F66',
    fontFamily: 'Georgia, serif',
    marginBottom: '6px',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label style={labelStyle}>Judul <span style={{ color: '#995F2F' }}>*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Misal: Deadline Project"
          style={inputStyle}
          disabled={isLoading}
          onFocus={e => (e.target.style.borderColor = '#995F2F')}
          onBlur={e => (e.target.style.borderColor = '#E4D6A9')}
        />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Catatan tambahan…"
          rows={2}
          style={{ ...inputStyle, resize: 'none' }}
          disabled={isLoading}
          onFocus={e => (e.target.style.borderColor = '#995F2F')}
          onBlur={e => (e.target.style.borderColor = '#E4D6A9')}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Tanggal Awal <span style={{ color: '#995F2F' }}>*</span></label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={inputStyle}
            disabled={isLoading}
            onFocus={e => (e.target.style.borderColor = '#995F2F')}
            onBlur={e => (e.target.style.borderColor = '#E4D6A9')}
          />
        </div>
        <div>
          <label style={labelStyle}>Tanggal Akhir <span style={{ color: '#995F2F' }}>*</span></label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            style={inputStyle}
            disabled={isLoading}
            onFocus={e => (e.target.style.borderColor = '#995F2F')}
            onBlur={e => (e.target.style.borderColor = '#E4D6A9')}
          />
        </div>
      </div>

      {/* Color Selection - upgraded */}
      <div>
        <label style={labelStyle}>Warna Aksen</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
              style={{
                background: color === c.value ? c.hex : '#F0E9D8',
                color: color === c.value ? '#FEFAF0' : '#978F66',
                border: `1px solid ${color === c.value ? c.hex : '#E4D6A9'}`,
                transform: color === c.value ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200 disabled:opacity-50"
        style={{ background: '#622B14', color: '#E4D6A9', fontFamily: 'Georgia, serif', letterSpacing: '0.12em' }}
      >
        {isLoading ? 'Membuat…' : '✦ Buat Target'}
      </button>
    </form>
  );
}