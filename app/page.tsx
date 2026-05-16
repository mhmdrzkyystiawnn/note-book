'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const gf = '"EB Garamond", Garamond, "Times New Roman", serif';
const sf = '"Cormorant Garamond", Georgia, serif';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay },
});

const features = [
  { symbol: '⟲', title: 'Tersimpan Otomatis', desc: 'Setiap kata yang Anda tulis langsung tersimpan. Tak ada yang hilang, tak ada yang terlewat.' },
  { symbol: '◈', title: 'Privat & Aman', desc: 'Catatan Anda hanya milik Anda. Dilindungi dengan enkripsi tingkat lanjut.' },
  { symbol: '◻', title: 'Antarmuka Bersih', desc: 'Dirancang agar pikiran Anda tetap jernih. Tanpa gangguan, hanya ruang untuk menulis.' },
];

const stats = [
  { symbol: '∞', label: 'Catatan tak terbatas' },
  { symbol: '⌘', label: 'Pintasan cerdas' },
  { symbol: '◌', label: 'Mode fokus penuh' },
];

const floatingCards = [
  { title: 'Ide pagi hari', preview: 'Menulis adalah cara terbaik untuk berpikir…', delay: 0, rotate: -3, x: '8%', y: '12%' },
  { title: 'Rencana minggu ini', preview: '— Selesaikan desain\n— Baca 30 menit\n— Hubungi tim…', delay: 0.15, rotate: 2, x: '55%', y: '28%' },
  { title: 'Kutipan favorit', preview: '"Menulis adalah menemukan apa yang Anda pikirkan."', delay: 0.3, rotate: -1.5, x: '22%', y: '55%' },
];

export default function Home() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setTimeout(() => router.push('/dashboard'), 900);
        }
      } catch (_err) {
        console.error(_err);
      }
    };
    checkAuth();
  }, [router, supabase]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5EFE0' }}>
        <motion.div {...fadeUp()} className="flex flex-col items-center gap-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full"
            style={{ border: '1.5px solid #E4D6A9', borderTopColor: '#622B14' }}
          />
          <div>
            <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-1" style={{ color: '#B5A07A', fontFamily: sf }}>
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
      {/* Subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px',
        }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(245,239,224,0.88)',
          borderColor: '#E2D5B7',
          backdropFilter: 'blur(18px) saturate(1.3)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3D1E0A' }}>
              <span className="text-[#F5EFE0] text-sm">✦</span>
            </div>
            <span className="text-xl font-normal tracking-tight" style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}>
              NoteHub
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-full text-sm transition-all duration-200 hover:bg-[#EDE5D0]"
              style={{ color: '#6B4226', fontFamily: sf, border: '1px solid #DDD0B3', letterSpacing: '0.02em' }}
            >
              Masuk
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-full text-sm transition-all duration-200"
              style={{ background: '#3D1E0A', color: '#F5EFE0', fontFamily: sf, letterSpacing: '0.02em' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#622B14')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#3D1E0A')}
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="pt-24 pb-20 md:pt-36 md:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <motion.p {...fadeUp(0.1)} className="text-[0.62rem] tracking-[0.35em] uppercase" style={{ color: '#A89870', fontFamily: sf }}>
              Ruang berpikir yang tenang
            </motion.p>
            <motion.div {...fadeUp(0.2)} className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.08]" style={{ fontFamily: gf, color: '#3D1E0A' }}>
                Tulis lebih
                <br />
                <span style={{ fontStyle: 'italic', color: '#622B14' }}>leluasa.</span>
              </h1>
              <p className="text-lg sm:text-xl font-normal leading-relaxed mt-6 max-w-md" style={{ color: '#7A5C3A', fontFamily: sf, fontStyle: 'italic' }}>
                Tempat di mana ide tidak terburu-buru. Catat, susun, dan simpan
                pikiran Anda dalam antarmuka yang tenang dan elegan.
              </p>
            </motion.div>
            <motion.div {...fadeUp(0.35)} className="space-y-5 pt-2">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.1, duration: 0.55 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(98,43,20,0.07)', color: '#622B14' }}>
                    <span className="text-sm">{f.symbol}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-snug" style={{ color: '#3D1E0A', fontFamily: gf }}>{f.title}</p>
                    <p className="text-sm leading-relaxed mt-0.5" style={{ color: '#9C8260', fontFamily: sf, fontStyle: 'italic' }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div {...fadeUp(0.7)} className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/auth/signup"
                className="px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:shadow-lg"
                style={{ background: '#3D1E0A', color: '#F5EFE0', fontFamily: sf, letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(61,30,10,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#622B14'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3D1E0A'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Mulai menulis
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3.5 rounded-full text-sm transition-all duration-200"
                style={{ border: '1px solid #D9C9A8', color: '#6B4226', fontFamily: sf, letterSpacing: '0.04em' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#EDE5D0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Sudah punya akun
              </Link>
            </motion.div>
          </div>

          {/* Right floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[420px] lg:h-[500px] hidden lg:block"
          >
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, rotate: card.rotate }}
                animate={{ opacity: 1, y: 0, rotate: card.rotate }}
                transition={{ delay: 0.5 + card.delay, duration: 0.7 }}
                whileHover={{ y: -4, rotate: card.rotate * 0.5, transition: { duration: 0.3 } }}
                className="absolute rounded-2xl p-5 cursor-default"
                style={{
                  left: card.x,
                  top: card.y,
                  width: 220,
                  background: '#FEFAF2',
                  border: '1px solid #E8D9BE',
                  boxShadow: '0 8px 32px rgba(61,30,10,0.1), 0 2px 8px rgba(61,30,10,0.06)',
                }}
              >
                <p className="text-[0.55rem] tracking-[0.25em] uppercase mb-2" style={{ color: '#B5A07A', fontFamily: sf }}>{card.title}</p>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5A3A1A', fontFamily: gf, fontStyle: 'italic' }}>{card.preview}</p>
                <div className="mt-3 flex gap-1.5">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-1 rounded-full" style={{ width: [40, 30, 20][j], background: 'rgba(98,43,20,0.12)' }} />
                  ))}
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="absolute bottom-8 right-4 flex flex-col gap-1.5"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-1.5">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-1 h-1 rounded-full" style={{ background: `rgba(98,43,20,${0.06 + (i + j) * 0.018})` }} />
                  ))}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.65 }}
          className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden mb-24"
          style={{ border: '1px solid #E2D5B7' }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center py-8 px-4 text-center" style={{ background: i % 2 === 0 ? '#FEFAF2' : '#FAF3E2' }}>
              <span className="text-2xl mb-2" style={{ color: '#622B14', fontFamily: gf }}>{s.symbol}</span>
              <p className="text-[0.65rem] tracking-[0.18em] uppercase" style={{ color: '#A89870', fontFamily: sf }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quote block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mb-28 max-w-2xl mx-auto text-center"
        >
          <p className="text-3xl sm:text-4xl font-normal leading-snug mb-6" style={{ fontFamily: gf, color: '#3D1E0A', fontStyle: 'italic' }}>
            &quot;Pikiran terbaik datang saat Anda memiliki tempat yang tenang untuk menulisnya.&quot;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-px" style={{ background: '#D9C9A8' }} />
            <p className="text-[0.62rem] tracking-[0.22em] uppercase" style={{ color: '#B5A07A', fontFamily: sf }}>Filosofi NoteHub</p>
            <div className="w-12 h-px" style={{ background: '#D9C9A8' }} />
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mb-28 rounded-3xl py-16 px-8 text-center"
          style={{ background: '#3D1E0A', boxShadow: '0 24px 64px rgba(61,30,10,0.22)' }}
        >
          <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(245,239,224,0.4)', fontFamily: sf }}>Gratis selamanya</p>
          <h2 className="text-3xl sm:text-4xl font-normal mb-3" style={{ fontFamily: gf, color: '#F5EFE0', fontStyle: 'italic' }}>Siap mulai menulis?</h2>
          <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(245,239,224,0.55)', fontFamily: sf, fontStyle: 'italic' }}>
            Bergabunglah dan temukan cara baru untuk mengekspresikan pikiran Anda setiap hari.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-3.5 rounded-full text-sm transition-all duration-300"
            style={{ background: '#F5EFE0', color: '#3D1E0A', fontFamily: sf, letterSpacing: '0.04em' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEFAF2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F5EFE0'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Buat akun gratis
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ borderColor: '#E2D5B7', background: '#EDE5D0' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#3D1E0A' }}>
              <span className="text-[#F5EFE0] text-[0.5rem]">✦</span>
            </div>
            <span className="text-sm font-normal" style={{ fontFamily: gf, color: '#6B4226', fontStyle: 'italic' }}>NoteHub</span>
          </div>
          <p className="text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: '#B5A07A', fontFamily: sf }}>© 2026 · Semua hak dilindungi</p>
          <div className="flex gap-5">
            {['Privasi', 'Ketentuan', 'Kontak'].map((label, idx) => (
              <Link key={idx} href="#" className="text-[0.62rem] tracking-[0.15em] uppercase transition-colors duration-150 hover:text-[#6B4226]" style={{ color: '#B5A07A', fontFamily: sf }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}