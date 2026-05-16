'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data?.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
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
            Buat Akun Baru
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ fontFamily: georgiaFont, color: '#978F66' }}
          >
            Mulai mencatat momen berharga Anda
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
              <label htmlFor="name" className="sr-only">
                Nama
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-150"
                style={{
                  background: '#FEFAF0',
                  borderColor: '#E4D6A9',
                  color: '#3D2010',
                  fontFamily: georgiaFont,
                  fontSize: '0.9rem',
                }}
                placeholder="Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#A0784A')}
                onBlur={(e) => (e.target.style.borderColor = '#E4D6A9')}
              />
            </div>

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

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
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
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm transition-colors duration-150"
              style={{ color: '#995F2F', fontFamily: georgiaFont }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#622B14')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#995F2F')}
            >
              Sudah punya akun? Login di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}