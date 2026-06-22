'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Password berhasil diubah. Mengarahkan ke halaman login...');
      router.push('/auth/login');
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6"
      style={{ background: '#F5EFE0' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span
            className="text-[0.55rem] uppercase tracking-[0.32em]"
            style={{ color: '#C4A97D', fontFamily: georgiaFont }}
          >
            Keamanan Akun
          </span>
          <h1
            className="mt-3 text-3xl font-normal"
            style={{ fontFamily: garamondFont, color: '#622B14', fontStyle: 'italic' }}
          >
            Password Baru
          </h1>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ fontFamily: georgiaFont, color: '#978F66' }}
          >
            Buat password baru untuk mengamankan kembali akses ke catatan kamu.
          </p>
        </div>

        <form
          onSubmit={handleUpdatePassword}
          className="space-y-5 rounded-2xl p-6 shadow-[0_18px_55px_rgba(98,43,20,0.1)]"
          style={{ background: '#FFFDF7', border: '1px solid #E4D6A9' }}
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs"
              style={{ color: '#995F2F', fontFamily: georgiaFont }}
            >
              Password baru
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full appearance-none rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-150"
              style={{
                background: '#FEFAF0',
                borderColor: '#E4D6A9',
                color: '#3D2010',
                fontFamily: georgiaFont,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#A0784A')}
              onBlur={(e) => (e.target.style.borderColor = '#E4D6A9')}
            />
          </div>

          {message && (
            <p
              className="rounded-xl px-4 py-3 text-center text-sm"
              style={{
                background: '#FEF3E2',
                border: '1px solid #E4C9A0',
                color: '#995F2F',
                fontFamily: georgiaFont,
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 disabled:opacity-50"
            style={{ background: '#622B14', color: '#FEFAF0', fontFamily: georgiaFont }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#995F2F')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#622B14')}
          >
            {loading ? 'Menyimpan...' : 'Simpan Password'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm transition-colors duration-150"
              style={{ color: '#995F2F', fontFamily: georgiaFont }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#622B14')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#995F2F')}
            >
              Kembali ke halaman login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
