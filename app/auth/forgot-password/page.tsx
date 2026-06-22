'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const garamondFont = '"EB Garamond", Garamond, "Times New Roman", serif';
const georgiaFont = 'Georgia, serif';

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        'Link reset password telah dikirim ke email kamu.'
      );
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
            Akses Akun
          </span>
          <h1
            className="mt-3 text-3xl font-normal"
            style={{ fontFamily: garamondFont, color: '#622B14', fontStyle: 'italic' }}
          >
            Reset Password
          </h1>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ fontFamily: georgiaFont, color: '#978F66' }}
          >
            Masukkan email akun kamu, lalu kami kirimkan tautan untuk membuat password baru.
          </p>
        </div>

        <form
          onSubmit={handleReset}
          className="space-y-5 rounded-2xl p-6 shadow-[0_18px_55px_rgba(98,43,20,0.1)]"
          style={{ background: '#FFFDF7', border: '1px solid #E4D6A9' }}
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs"
              style={{ color: '#995F2F', fontFamily: georgiaFont }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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
