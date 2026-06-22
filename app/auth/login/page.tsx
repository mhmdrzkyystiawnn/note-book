'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: '#F5EFE0' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2
            className="mt-6 text-center text-3xl font-normal"
            style={{ fontFamily: garamondFont, color: '#622B14' }}
          >
            Selamat Datang Kembali
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ fontFamily: georgiaFont, color: '#978F66' }}
          >
            Masuk untuk melanjutkan menulis catatan
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div
              className="rounded-lg p-3 text-sm text-center"
              style={{ background: '#FEF3E2', border: '1px solid #E4C9A0', color: '#B85C1A' }}
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-150"
                style={{
                  background: '#FEFAF0',
                  borderColor: '#E4D6A9',
                  color: '#3D2010',
                  fontFamily: georgiaFont,
                  fontSize: '0.9rem',
                }}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#A0784A')}
                onBlur={(e) => (e.target.style.borderColor = '#E4D6A9')}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-150"
                style={{
                  background: '#FEFAF0',
                  borderColor: '#E4D6A9',
                  color: '#3D2010',
                  fontFamily: georgiaFont,
                  fontSize: '0.9rem',
                }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#A0784A')}
                onBlur={(e) => (e.target.style.borderColor = '#E4D6A9')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50"
              style={{
                background: '#622B14',
                color: '#FEFAF0',
                fontFamily: georgiaFont,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#995F2F')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#622B14')}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm"
              style={{ color: '#995F2F', fontFamily: georgiaFont }}
            >
              Lupa Password?
            </Link>
          </div>
          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm transition-colors duration-150"
              style={{ color: '#995F2F', fontFamily: georgiaFont }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#622B14')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#995F2F')}
            >
              Belum punya akun? Daftar di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}