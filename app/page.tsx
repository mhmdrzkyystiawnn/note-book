'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = '"Cormorant Garamond", Georgia, serif';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
});

const features = [
  { symbol: '⟲', title: 'Tersimpan Otomatis', desc: 'Setiap kata yang Anda tulis langsung tersimpan. Tak ada yang hilang, tak ada yang terlewat.' },
  { symbol: '◈', title: 'Privat & Aman',       desc: 'Catatan Anda hanya milik Anda. Dilindungi dengan enkripsi tingkat lanjut.' },
  { symbol: '◻', title: 'Antarmuka Bersih',    desc: 'Dirancang agar pikiran Anda tetap jernih. Tanpa gangguan, hanya ruang untuk menulis.' },
];

const stats = [
  { symbol: '∞', label: 'Catatan tak terbatas' },
  { symbol: '⌘', label: 'Pintasan cerdas' },
  { symbol: '◌', label: 'Mode fokus penuh' },
];

const floatingCards = [
  { title: 'Ide pagi hari',    preview: 'Menulis adalah cara terbaik untuk berpikir…', delay: 0,    rotate: -3,   x: '5%',  y: '8%'  },
  { title: 'Rencana minggu',   preview: '— Selesaikan desain\n— Baca 30 menit\n— Hubungi tim…', delay: 0.14, rotate: 2.5,  x: '52%', y: '26%' },
  { title: 'Kutipan favorit',  preview: '"Jika manusia tak memiliki sejarah, apakah dia manusia?"', delay: 0.28, rotate: -1.5, x: '18%', y: '54%' },
];

export default function Home() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { setUser(user); setTimeout(() => router.push('/dashboard'), 900); }
      } catch {}
    };
    check();
  }, [router, supabase]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5EFE0' }}>
        <motion.div {...fadeUp()} className="flex flex-col items-center gap-6 text-center px-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full"
            style={{ border: '1.5px solid #E4D6A9', borderTopColor: '#622B14' }}
          />
          <div>
            <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-1.5" style={{ color: '#B5A07A', fontFamily: sf }}>
              Selamat datang kembali
            </p>
            <h2 className="text-2xl font-normal" style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}>
              Membuka ruang catatan Anda…
            </h2>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#F5EFE0' }}>
      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-8px) rotate(-3deg)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(2.5deg)} 50%{transform:translateY(-6px) rotate(2.5deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-10px) rotate(-1.5deg)} }
        .card-float-0 { animation: float0 6s ease-in-out infinite; }
        .card-float-1 { animation: float1 7s ease-in-out infinite 0.5s; }
        .card-float-2 { animation: float2 8s ease-in-out infinite 1s; }

        /* Scrollbar hide for mobile nav */
        .hide-scroll::-webkit-scrollbar { display:none; }
        .hide-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* ── Noise texture overlay ──────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px',
        }}
      />

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55 }}
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(245,239,224,0.9)',
          borderColor: '#E2D5B7',
          backdropFilter: 'blur(18px) saturate(1.3)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#3D1E0A' }}>
              <span className="text-[#F5EFE0] text-xs">✦</span>
            </div>
            <span className="text-lg sm:text-xl font-normal tracking-tight" style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}>
              NoteHub
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-full text-sm transition-all duration-200 hover:bg-[#EDE5D0]"
              style={{ color: '#6B4226', fontFamily: sf, border: '1px solid #DDD0B3', letterSpacing: '0.02em' }}
            >
              Masuk
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-full text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: '#3D1E0A', color: '#F5EFE0', fontFamily: sf, letterSpacing: '0.02em' }}
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile: compact buttons */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3.5 py-1.5 rounded-full text-xs transition-all duration-200"
              style={{ color: '#6B4226', fontFamily: sf, border: '1px solid #DDD0B3' }}
            >
              Masuk
            </Link>
            <Link
              href="/auth/signup"
              className="px-3.5 py-1.5 rounded-full text-xs transition-all duration-200"
              style={{ background: '#3D1E0A', color: '#F5EFE0', fontFamily: sf }}
            >
              Daftar
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8">

        <div className="pt-14 pb-16 sm:pt-24 sm:pb-20 md:pt-32 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: copy */}
          <div className="space-y-7 sm:space-y-10">
            <motion.p
              {...fadeUp(0.08)}
              className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.32em] uppercase"
              style={{ color: '#A89870', fontFamily: sf }}
            >
              Ruang berpikir yang tenang
            </motion.p>

            <motion.div {...fadeUp(0.18)} className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08]"
                style={{ fontFamily: gf, color: '#3D1E0A' }}
              >
                Tulis lebih
                <br />
                <span style={{ fontStyle: 'italic', color: '#622B14' }}>leluasa.</span>
              </h1>
              <p
                className="text-base sm:text-lg font-normal leading-relaxed max-w-sm sm:max-w-md"
                style={{ color: '#7A5C3A', fontFamily: sf, fontStyle: 'italic' }}
              >
                Tempat di mana ide tidak terburu-buru. Catat, susun, dan simpan
                pikiran Anda dalam antarmuka yang tenang dan elegan.
              </p>
            </motion.div>

            {/* Features list */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3.5"
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(98,43,20,0.07)', color: '#622B14' }}
                  >
                    <span className="text-xs sm:text-sm">{f.symbol}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-snug" style={{ color: '#3D1E0A', fontFamily: gf }}>{f.title}</p>
                    <p className="text-sm leading-relaxed mt-0.5" style={{ color: '#9C8260', fontFamily: sf, fontStyle: 'italic' }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA buttons */}
            <motion.div {...fadeUp(0.65)} className="flex flex-col xs:flex-row flex-wrap gap-3 pt-1">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-7 py-3 sm:px-8 sm:py-3.5 rounded-full text-sm transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: '#3D1E0A', color: '#F5EFE0',
                  fontFamily: sf, letterSpacing: '0.04em',
                  boxShadow: '0 4px 20px rgba(61,30,10,0.22)',
                }}
              >
                Mulai menulis
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-7 py-3 sm:px-8 sm:py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-[#EDE5D0]"
                style={{ border: '1px solid #D9C9A8', color: '#6B4226', fontFamily: sf, letterSpacing: '0.04em' }}
              >
                Sudah punya akun
              </Link>
            </motion.div>
          </div>

          {/* Right: floating cards — Desktop only */}
       {/* Right: floating cards — Desktop only */}
<motion.div
  initial={{ opacity: 0, scale: 0.94 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.75, delay: 0.28, ease: 'easeOut' }}
  className="relative h-105 lg:h-125 hidden lg:block"
>
  {floatingCards.map((card, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + card.delay, duration: 0.65, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`card-float-${i} absolute rounded-2xl p-5 cursor-default`}
      style={{
        left: card.x, top: card.y, width: 210,
        background: '#FEFAF2', border: '1px solid #E8D9BE',
        boxShadow: '0 8px 32px rgba(61,30,10,0.1), 0 2px 8px rgba(61,30,10,0.06)',
      }}
    >
      <p className="text-[0.52rem] tracking-[0.25em] uppercase mb-2" style={{ color: '#B5A07A', fontFamily: sf }}>{card.title}</p>
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5A3A1A', fontFamily: gf, fontStyle: 'italic' }}>{card.preview}</p>
      <div className="mt-3 flex gap-1.5">
        {[40, 30, 20].map((w, j) => (
          <div key={j} className="h-1 rounded-full" style={{ width: w, background: 'rgba(98,43,20,0.11)' }} />
        ))}
      </div>
    </motion.div>
  ))}

  {/* Dot grid */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
    className="absolute bottom-6 right-2"
  >
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-1.5 mb-1.5">
        {[...Array(5)].map((_, j) => (
          <div key={j} className="w-1 h-1 rounded-full" style={{ background: `rgba(98,43,20,${0.05 + (i + j) * 0.018})` }} />
        ))}
      </div>
    ))}
  </motion.div>
</motion.div>

          {/* Mobile: mini card preview instead of floating cards */}
          <motion.div
            {...fadeUp(0.5)}
            className="lg:hidden grid grid-cols-2 gap-3"
          >
            {floatingCards.slice(0, 2).map((card, i) => (
              <div
                key={i}
                className="rounded-2xl p-4"
                style={{
                  background: '#FEFAF2', border: '1px solid #E8D9BE',
                  boxShadow: '0 4px 16px rgba(61,30,10,0.08)',
                  transform: `rotate(${card.rotate * 0.5}deg)`,
                }}
              >
                <p className="text-[0.5rem] tracking-[0.22em] uppercase mb-1.5" style={{ color: '#B5A07A', fontFamily: sf }}>{card.title}</p>
                <p className="text-xs leading-relaxed whitespace-pre-line line-clamp-3" style={{ color: '#5A3A1A', fontFamily: gf, fontStyle: 'italic' }}>{card.preview}</p>
                <div className="mt-2.5 flex gap-1">
                  {[32, 22, 14].map((w, j) => (
                    <div key={j} className="h-0.5 rounded-full" style={{ width: w, background: 'rgba(98,43,20,0.12)' }} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(0.85)}
          className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden mb-16 sm:mb-24"
          style={{ border: '1px solid #E2D5B7' }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center py-6 sm:py-8 px-2 sm:px-4 text-center"
              style={{ background: i % 2 === 0 ? '#FEFAF2' : '#FAF3E2' }}
            >
              <span
                className="text-xl sm:text-2xl mb-1.5 sm:mb-2"
                style={{ color: '#622B14', fontFamily: gf }}
              >
                {s.symbol}
              </span>
              <p
                className="text-[0.55rem] sm:text-[0.62rem] tracking-[0.14em] sm:tracking-[0.18em] uppercase leading-snug"
                style={{ color: '#A89870', fontFamily: sf }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Quote block ───────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(0.95)}
          className="mb-16 sm:mb-28 max-w-xl sm:max-w-2xl mx-auto text-center px-2"
        >
          <p
            className="text-2xl sm:text-3xl md:text-4xl font-normal leading-snug mb-5 sm:mb-6"
            style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}
          >
            &quot;Pikiran terbaik datang saat Anda memiliki
            tempat yang tenang untuk menulisnya.&quot;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 sm:w-12 h-px" style={{ background: '#D9C9A8' }} />
            <p className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.2em] sm:tracking-[0.22em] uppercase" style={{ color: '#B5A07A', fontFamily: sf }}>
              NoteHub
            </p>
            <div className="w-8 sm:w-12 h-px" style={{ background: '#D9C9A8' }} />
          </div>
        </motion.div>

        {/* ── Feature highlights (mobile-first cards) ───────────────── */}
        <motion.div
          {...fadeUp(1.0)}
          className="mb-16 sm:mb-24 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: '✦', title: 'Desain elegan', desc: 'Antarmuka yang terinspirasi dari buku-buku arsip klasik. Setiap elemen dirancang dengan teliti.' },
            { icon: '◷', title: 'Riwayat lengkap', desc: 'Lacak kapan Anda menulis, mood apa yang dirasakan, dan pola kreativitas Anda.' },
            { icon: '🎭', title: 'Pelacak mood', desc: 'Lampirkan emoji perasaan di setiap catatan. Lihat tren emosi Anda dari waktu ke waktu.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 + i * 0.08, duration: 0.5 }}
              className="rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: '#FEFAF2', border: '1px solid #E8D9BE',
                boxShadow: '0 4px 16px rgba(61,30,10,0.06)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 text-base"
                style={{ background: 'rgba(98,43,20,0.08)', color: '#622B14' }}
              >
                {item.icon}
              </div>
              <h3 className="text-base font-normal mb-1.5" style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#9C8260', fontFamily: sf, fontStyle: 'italic' }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(1.05)}
          className="mb-16 sm:mb-28 rounded-2xl sm:rounded-3xl py-12 sm:py-16 px-6 sm:px-10 text-center"
          style={{ background: '#3D1E0A', boxShadow: '0 24px 64px rgba(61,30,10,0.2)' }}
        >
          <p
            className="text-[0.58rem] sm:text-[0.6rem] tracking-[0.28em] sm:tracking-[0.3em] uppercase mb-4"
            style={{ color: 'rgba(245,239,224,0.38)', fontFamily: sf }}
          >
            Gratis selamanya
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-normal mb-3"
            style={{ fontFamily: gf, color: '#F5EFE0', fontStyle: 'italic' }}
          >
            Siap mulai menulis?
          </h2>
          <p
            className="text-sm mb-7 sm:mb-8 max-w-xs sm:max-w-sm mx-auto leading-relaxed"
            style={{ color: 'rgba(245,239,224,0.5)', fontFamily: sf, fontStyle: 'italic' }}
          >
            Bergabunglah dan temukan cara baru untuk mengekspresikan pikiran Anda setiap hari.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: '#F5EFE0', color: '#3D1E0A',
                fontFamily: sf, letterSpacing: '0.04em',
              }}
            >
              Buat akun gratis
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full text-sm transition-all duration-200"
              style={{
                border: '1px solid rgba(245,239,224,0.2)',
                color: 'rgba(245,239,224,0.65)',
                fontFamily: sf, letterSpacing: '0.04em',
              }}
            >
              Sudah punya akun
            </Link>
          </div>
        </motion.div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-7 sm:py-8 border-t" style={{ borderColor: '#E2D5B7', background: '#EDE5D0' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#3D1E0A' }}>
              <span className="text-[#F5EFE0] text-[0.45rem]">✦</span>
            </div>
            <span className="text-sm font-normal" style={{ fontFamily: gf, color: '#6B4226', fontStyle: 'italic' }}>NoteHub</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 sm:gap-5">
            {['Privasi', 'Ketentuan', 'Kontak'].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-[0.6rem] tracking-[0.15em] uppercase transition-colors duration-150 hover:text-[#6B4226]"
                style={{ color: '#B5A07A', fontFamily: sf }}
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="text-[0.58rem] tracking-[0.16em] uppercase" style={{ color: '#C4B090', fontFamily: sf }}>
            © 2026 · Semua hak dilindungi
          </p>
        </div>
      </footer>
    </div>
  );
}