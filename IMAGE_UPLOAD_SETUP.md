# Setup Gambar Upload di Dashboard Note

Fitur upload gambar telah ditambahkan! Ikuti langkah di bawah untuk setup storage bucket.

## Step 1: Setup Storage Bucket di Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda: `mrmdcqkgclskxsuqtefx`
3. Pergi ke menu **Storage** di sidebar kiri
4. Klik **Create a new bucket**
5. Isi nama bucket: `note-images`
6. Pastikan **Public bucket** di-enable (centang)
7. Klik **Create bucket**

## Step 2: Setup RLS Policies untuk Storage

1. Di menu **Storage**, buka bucket `note-images` yang baru dibuat
2. Klik tab **Policies**
3. Buka file `SETUP_STORAGE.sql` di project root
4. Copy seluruh isi file
5. Buka **SQL Editor** di Supabase
6. Buat **New Query**
7. Paste code dari `SETUP_STORAGE.sql`
8. Jalankan dengan **Ctrl+Enter** atau klik **Run**

## Step 3: Update Database (Jika pakai existing database)

Jika sudah punya data sebelumnya, jalankan query ini untuk menambah kolom:

```sql
ALTER TABLE public.notes ADD COLUMN image_url TEXT;
```

## Step 4: Coba Upload Gambar

1. Jalankan development server: `npm run dev`
2. Buka browser di `http://localhost:3000`
3. Login ke dashboard
4. Di form "Buat Note", ada input baru untuk gambar
5. Upload gambar dan lihat preview
6. Klik "Simpan Note"
7. Gambar akan ditampilkan di daftar note

## Fitur Upload Gambar

✅ **Preview sebelum upload** - Lihat gambar sebelum disimpan
✅ **Validasi file** - Hanya gambar yang diperbolehkan (JPG, PNG, GIF)
✅ **Validasi ukuran** - Max 5MB per gambar
✅ **Secure storage** - Gambar tersimpan di Supabase Storage dengan RLS
✅ **Auto delete** - Gambar ikut terhapus saat note dihapus (sesuaikan jika perlu)

## Tips

- Gunakan gambar berkualitas tapi ukuran file tidak terlalu besar
- Format terbaik: JPG (untuk foto), PNG (untuk screenshot)
- Jika error "bucket not found", pastikan bucket sudah dibuat dengan nama yang benar
- Jika error RLS, jalankan ulang SQL dari `SETUP_STORAGE.sql`

---

**Catatan**: Gambar disimpan di Supabase Storage, bukan di database. Database hanya menyimpan URL link-nya.
