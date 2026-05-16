'use client';

import Link from 'next/link';
import Image from 'next/image';
import Masonry from 'react-masonry-css';

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

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string, imageUrl?: string) => Promise<void>;
}

export default function NoteList({ notes, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-[#F0E9D8] text-3xl text-[#C4B896]">
          ◻
        </div>
        <p className="text-sm text-[#978F66] font-serif">Belum ada catatan. Buat catatan baru!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // Breakpoints: jumlah kolom berdasarkan lebar layar
  const breakpointColumns = {
    default: 3,    // >= 1100px
    1024: 2,       // >= 768px
    640: 1,        // >= 640px
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex w-auto -ml-4" // margin kiri negatif untuk kompensasi
      columnClassName="pl-4 bg-clip-padding" // padding kiri tiap kolom
    >
      {notes.map((note) => {
        const aspectRatio = note.aspect_ratio || (note.image_url ? 16 / 9 : null);
        return (
          <div key={note.id} className="group mb-4">
            <Link href={`/dashboard/notes/${note.id}`}>
              <div
                className="
                  block
                  border border-[#E4D6A9] bg-[#FEFAF0]
                  rounded-xl overflow-hidden
                  hover:border-[#995F2F] hover:shadow-md hover:shadow-[#E4D6A9]/50
                  transition-all duration-200 cursor-pointer
                "
              >
                {/* Gambar dengan aspect ratio asli */}
                {note.image_url && aspectRatio && (
                  <div
                    className="w-full overflow-hidden bg-[#F0E9D8] relative"
                    style={{ aspectRatio: `${aspectRatio} / 1` }}
                  >
                    <Image
                      src={note.image_url}
                      alt={note.title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-3 flex flex-col gap-1.5">
                  {/* Header: emotion + judul + tombol hapus */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="shrink-0 text-lg leading-5">
                        {note.emotion || '◻'}
                      </span>
                      <h3
                        className="
                          text-sm font-semibold leading-tight line-clamp-1
                          text-[#622B14]
                          group-hover:text-[#995F2F]
                          transition-colors duration-150
                        "
                      >
                        {note.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(note.id);
                      }}
                      className="
                        shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-sm
                        text-[#C4B896] hover:text-[#622B14]
                        hover:bg-[#F0E9D8] transition-all duration-150
                        opacity-0 group-hover:opacity-100
                      "
                      title="Hapus catatan"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Konten (3 baris) */}
                  <p className="text-xs text-[#978F66] line-clamp-3 leading-relaxed font-serif">
                    {note.content}
                  </p>

                  {/* Tanggal */}
                  <p className="text-[10px] text-[#C4B896] mt-1">
                    {formatDate(note.created_at)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </Masonry>
  );
}