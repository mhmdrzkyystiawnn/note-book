'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface SidebarProps {
  user?: any;
}

const navItems = [
  { href: '/dashboard', icon: '⌂', label: 'Dashboard' },
  { href: '/dashboard/notes', icon: '◻', label: 'Catatan' },
  { href: '/dashboard/gallery', icon: '▣', label: 'Galeri' },
  { href: '/dashboard/attendance', icon: '◷', label: 'Presensi' },
  { href: '/dashboard/analytics', icon: '▲', label: 'Analitik' },
];

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

export default function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Pengguna';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
        style={{ background: '#FFFDF7', border: '1px solid #E4D6A9', color: '#622B14', boxShadow: '0 2px 8px rgba(98,43,20,0.08)' }}
      >
        <span className="text-base leading-none">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(98,43,20,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-[256px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
        style={{ background: '#2A1208', borderRight: '1px solid rgba(228,214,169,0.15)' }}
      >
        {/* Decorative top grain */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Brand */}
        <div className="px-6 pt-7 pb-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(228,214,169,0.12)', border: '1px solid rgba(228,214,169,0.2)' }}>
              <span style={{ color: '#E4D6A9', fontSize: '16px' }}>✦</span>
            </div>
            <div>
              <p className="font-normal text-xl tracking-tight" style={{ fontFamily: garamondFont, color: '#E4D6A9' }}>
                NoteHub
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ color: 'rgba(228,214,169,0.4)', fontFamily: georgiaFont }}>
                Workspace
              </p>
            </div>
          </div>
        </div>

        <div className="mx-5 h-px" style={{ background: 'rgba(228,214,169,0.1)' }} />

        {/* User block - nama besar, email kecil */}
        {user && (
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold" style={{ background: 'rgba(153,95,47,0.3)', color: '#E4D6A9', border: '1px solid rgba(153,95,47,0.4)', fontFamily: georgiaFont }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate leading-tight" style={{ fontFamily: garamondFont, color: '#E4D6A9' }}>
                {displayName}
              </p>
              <p className="text-[10px] truncate mt-0.5 opacity-75" style={{ fontFamily: georgiaFont, color: 'rgba(228,214,169,0.6)' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}

        <div className="mx-5 h-px mb-2" style={{ background: 'rgba(228,214,169,0.1)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-1 pb-3 text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(228,214,169,0.3)', fontFamily: georgiaFont }}>
            Navigasi
          </p>
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-normal transition-all duration-150"
                style={{
                  background: active ? 'rgba(228,214,169,0.1)' : 'transparent',
                  color: active ? '#E4D6A9' : 'rgba(228,214,169,0.45)',
                  fontFamily: georgiaFont,
                }}
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-lg text-sm transition-all duration-150" style={{
                  background: active ? 'rgba(228,214,169,0.12)' : 'transparent',
                  color: active ? '#E4D6A9' : 'rgba(228,214,169,0.35)',
                }}>
                  {icon}
                </span>
                <span className="tracking-wide">{label}</span>
                {active && (
                  <span className="ml-auto w-1 h-5 rounded-full" style={{ background: '#995F2F' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(228,214,169,0.1)' }}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 disabled:opacity-40"
            style={{ color: 'rgba(228,214,169,0.35)', fontFamily: georgiaFont }}
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-lg text-sm" style={{ background: 'rgba(153,95,47,0.15)' }}>↩</span>
            <span className="tracking-wide text-xs">{isLoggingOut ? 'Keluar…' : 'Keluar'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}