# Setup Instruksi - Dashboard Note dengan Supabase

## 1. Setup Database di Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Login ke project Anda: `mrmdcqkgclskxsuqtefx`
3. Pergi ke menu **SQL Editor**
4. Buat query baru (New Query)
5. Copy dan paste isi file `SETUP_DATABASE.sql` ke editor
6. Klik **Run** atau tekan `Ctrl+Enter`

Script tersebut akan membuat:
- Tabel `notes` untuk menyimpan catatan
- RLS (Row Level Security) policies untuk keamanan data

## 2. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 3. Fitur Aplikasi

### Authentication
- **Login**: `/auth/login` - Masuk dengan email dan password
- **Sign Up**: `/auth/signup` - Buat akun baru
- Middleware otomatis melindungi route `/dashboard`

### Dashboard Notes
- **Buat Note**: Form untuk membuat catatan dengan judul dan konten
- **Lihat Notes**: Daftar semua catatan yang diurutkan dari terbaru
- **Hapus Note**: Tombol hapus untuk menghapus catatan
- **Logout**: Tombol logout untuk keluar

## 4. Struktur Folder

```
app/
  ├── auth/
  │   ├── login/page.tsx       # Halaman login
  │   └── signup/page.tsx      # Halaman signup
  ├── dashboard/
  │   └── page.tsx             # Halaman dashboard
  ├── layout.tsx
  ├── page.tsx                 # Home (redirect ke dashboard)
  └── globals.css

components/
  ├── NoteForm.tsx             # Form untuk membuat note
  └── NoteList.tsx             # Tampilan list notes

utils/supabase/
  ├── client.ts                # Supabase client untuk browser
  └── server.ts                # Supabase client untuk server

middleware.ts                  # Proteksi route dan auth check
```

## 5. Environment Variables

`.env.local` sudah berisi:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 6. Testing

Coba beberapa workflow:

1. **Sign Up**
   - Buka `http://localhost:3000/auth/signup`
   - Isi email dan password
   - Klik "Daftar"

2. **Login**
   - Buka `http://localhost:3000/auth/login`
   - Masukkan email dan password yang baru dibuat
   - Klik "Login"

3. **Create Note**
   - Anda akan diarahkan ke dashboard
   - Isi judul dan konten
   - Klik "Simpan Note"

4. **Delete Note**
   - Klik tombol "Hapus" di salah satu note
   - Konfirmasi penghapusan

5. **Logout**
   - Klik tombol "Logout" di navbar
   - Anda akan diarahkan ke halaman login

---

**Catatan**: 
- Setiap user hanya bisa melihat dan mengelola note milik mereka sendiri
- Data dilindungi dengan RLS (Row Level Security) di Supabase
- Session otomatis tersimpan di cookies
