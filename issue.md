# [Feature] API Login User dan Pembuatan Token Sesi

**Tujuan:**
Mengimplementasikan fungsionalitas login bagi pengguna yang sudah terdaftar. Fitur ini meliputi pembuatan tabel `sessions` di database untuk menyimpan token login berdasarkan UUID, memverifikasi email beserta password (melalui algoritma bcrypt), serta membuat endpoint API `POST /api/users/login`.

## 1. Skema Database (Drizzle ORM)
Perbarui file skema database (contoh: `src/db/schema.ts`) dengan menambahkan tabel baru bernama `sessions`. Struktur tabel tersebut harus seperti ini:
- `id` : integer, auto increment (primary key)
- `token` : varchar 255, not null (Penting: Field ini akan diisi dengan UUID saat user berhasil login)
- `user_id` : integer (Foreign Key yang merujuk pada kolom `id` dari tabel `users`)
- `created_at` : timestamp, default current_timestamp

*(Catatan: Setelah memperbarui skema Drizzle, pastikan selalu menjalankan push migrasi seperti `bun run db:push` agar perubahan ini tersinkronisasi ke tabel sistem MySQL Anda).*

## 2. Struktur Folder & Arsitektur
Gunakan struktur kode di direktori `src/` berdasarkan standardisasi yang sudah berjalan:
- `routes/` : Perbarui file `users-route.ts`. Definisikan *routing endpoint* API logika *login* untuk ElysiaJS di file ini.
- `services/` : Tambahkan fungsi baru (method `login`) di dalam file `users-service.ts` untuk menangani *business logic* proses otentikasi login.

## 3. Spesifikasi Definisi API Login

**Endpoint:**
`POST /api/users/login`

**Request Body Payload:**
```json
{
    "email": "indra@gmail.com",
    "password": "password"
}
```

**Aturan Business Logic (Di dalam Service):**
1. **Cari User:** Lakukan operasi `SELECT` ke tabel `users` berdasarkan input `email`.
2. **Handle Error (Email):** Jika *email* tidak ditemukan di data, maka batalkan proses dan kembalikan response *Error*.
3. **Verifikasi Password:** Jika email ditemukan, cocokkan input field `password` dari Request dengan sekumpulan token hash bcrypt yang ada di baris database record tersebut menggunakan lib `bcrypt`.
4. **Handle Error (Password):** Jika hasil perbandingan *password* menunjukan nilai salah (*false*), maka kembalikan response *Error*.
5. **Buat Sesi Login:** Jika email dan password valid/cocok, minta generator untuk membuat string *token* baru format *UUID* secara *random*.
6. **Simpan Session:** Lakukan *insert* *token* (dari langkah ke-5) beserta data *foreign-key* `user_id` milik user ke dalam tabel `sessions` melalui ORM Drizzle.
7. **Skenario Sukses:** Setelah tersimpan, kembalikan teks token yang tadi dibuat agar diubah ke response.

**Response Body (Skenario Sukses):**
```json
{
    "data": "b1b11ca3-xxxx-4fc1-xxxx-xxxxxxxxxxxx"
}
```

**Response Body (Skenario Error - Kombinasi Email/Password Salah):**
Untuk alasan privasi keamanan data, gunakan teks *error* yang seragam meskipun kesalahannya asalnya karena "data email tak ditemukan" ataupun karena "password yang salah":
```json
{
    "error": "Email atau password salah"
}
```

---

## 4. Tahapan-Tahapan Eksekusi (Untuk Implementator)
Bagi Programmer / AI Model / Junior Engineer yang bertugas mengerjakan tiket fitur ini, harap jalankan seluruh tahapan implementasinya secara sekuensial (berurutan) seperti berikut:

1. **Instalasi UUID**: Jika aplikasi belum memiliki fungsi pembuat token UUID otomatis, pastikan meng-import fitur bawaan JS (`crypto.randomUUID()`) atau meng-install via bun (`bun add uuid` & tipe deklarasinya).
2. **Setup Skema DB**: Buka file `src/db/schema.ts`, tambah blok inisialisasi tabel `sessions` di sana dengan struktur fields persis seperti rancangan. Hubungkan parameter *Foreign-Key* dari `session.user_id` ke kolom `users.id`.
3. **Penyelarasan Drizzle DB**: Eksekusi perintah `bun run db:push` dari area terminal (*console*) agar sistem memberitahukan ke server MySQL bahwa tabel *sessions* perlu dibentuk sekarang.
4. **Pemrograman Algoritma Service**: Navigasikan kursor ke `src/services/users-service.ts`. Bangun *method / function* baru untuk eksekusi skenario logic *login* dengan tepat sesuai 7 Skenario Logika Bisnis di Bab 3.
5. **Penyambungan Endpoint**: Menuju ke `src/routes/users-route.ts`, pasang dekorator atau skema validator (dari library `Elysia/t`) untuk method `POST /login` baru dengan memastikan tipe body `email` & `password` tak lolos jika formatnya kosong. 
6. **Validasi Akhir**: Aktifkan *development server* (`bun run dev`) dan lakukan uji-test dengan `curl` dari berbagai respon: Tes kombinasi sukses, tes password salah, dan tes email kosongan, lalu periksa konsistensi format data HTTP-nya.
