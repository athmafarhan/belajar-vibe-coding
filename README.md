# Belajar Vibe Coding (User Authentication API)

Aplikasi ini adalah sebuah backend *Web API* yang menyediakan fungsionalitas manajemen pengguna dan autentikasi dasar (*Registrasi, Login, Profil Current User, dan Logout*). Proyek ini difokuskan pada penggunaan runtime modern dengan performa tinggi yang diintegrasikan dengan RDBMS konvensional.

## 🚀 Technology Stack & Libraries

### Core Stack
- **Bun** (v1.x): Runtime JavaScript/TypeScript yang ditujukan sebagai pengganti Node.js untuk eksekusi yang lebih cepat, manajemen dependensi, dan *test runner*.
- **ElysiaJS**: Framework web modern yang sangat cepat khusus untuk ekosistem Bun, menyediakan dukungan *TypeBox* untuk kemudahan validasi tipe serta performa tinggi.
- **MySQL**: Relational Database Management System untuk menyimpan data pengguna secara persisten.
- **Drizzle ORM**: Object-Relational Mapper yang murni ditulis dalam TypeScript dengan dukungan deklarasi skema tabel dan tipe *safety* secara langsung untuk melakukan transaksi kepada database MySQL.

### Libraries Utama
- `drizzle-orm` & `drizzle-kit`: Pustaka utama untuk kueri ORM dan automasi *migration/push* schema database.
- `mysql2`: Driver SQL standar untuk mengkoneksikan backend ke server MySQL.
- `bcrypt`: Digunakan memecah/men-hash password *plain-text* agar diamankan sebelum tersimpan ke dalam database.

---

## 📂 Arsitektur dan Struktur File

Proyek ini dibangun menggunakan konsep **Layered Architecture** di mana antarmuka masuk API dan urusan *business rules* sengaja dipisah (Routes vs Services).

```text
📁 belajar-vibe-coding/
├── 📁 src/
│   ├── 📁 db/                # Konfigurasi dan Skema Database
│   │   ├── index.ts          # Setup koneksi Drizzle ORM ke pool MySQL.
│   │   └── schema.ts         # Deklarasi tabel/skema Drizzle untuk tabel 'users' & 'sessions'.
│   ├── 📁 routes/            # Lapisan Pengendali Endpoint (Router)
│   │   └── users-route.ts    # Mengatur validasi URL, Body/Headers Elysia, serta kode respons HTTP.
│   ├── 📁 services/          # Lapisan Business Logic
│   │   └── users-service.ts  # Mengandung algoritma proses seperti hashing, insert data pengguna, validasi sesi.
│   └── index.ts              # Entry point utama aplikasi meregistrasikan app Elysia dan export app-nya.
├── 📁 tests/                 # Folder Integrasi & Unit Testing
│   └── users.test.ts         # Skenario eksekusi pengujian API (bun:test).
├── drizzle.config.ts         # Berkas konfigurasi Drizzle kit untuk sinkronisasi Database.
├── package.json              # Definisi project, scripts dev/test, dan library package npm/bun.
└── .env                      # Pengaturan Environment Variables rahasia (DB host, user, password).
```

---

## 🗄️ Skema Database (Database Schema)

Saat ini, sistem ini bekerja di atas 2 buah tabel skema basis data di bawah relasi `1-to-many` (Satu User bisa memiliki Banyak Sesi Aktif).

1.  **Tabel `users`**
    *   `id`: `serial` (Primary Key, Auto-increment)
    *   `name`: `varchar(255)` (Nama penguna)
    *   `email`: `varchar(255)` (Alamat email, bernilai **Unique**)
    *   `password`: `varchar(255)` (Kata sandi terenkripsi hash)
    *   `createdAt`: `timestamp` (Terisi otomatis saat didaftarkan)

2.  **Tabel `sessions`**
    *   `id`: `serial` (Primary Key, Auto-increment)
    *   `token`: `varchar(255)` (Token *Bearer* format UUID, bernilai **Unique**)
    *   `userId`: `bigint unsigned` (Foreign Key, terhubung ke kolom `users.id`)
    *   `createdAt`: `timestamp` (Terisi otomatis saat sesi dicipatakan / waktu login)

---

## 🌐 Available APIs

Aplikasi mendukung 4 *Endpoint* utama (di-_prefix_ dengan `/api/users`):

| Method | Endpoint | Fungsi | Headers Wajib | Body Payload (JSON) | Responses (Sukses/Gagal) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/` | Registrasi akun pengguna baru | - | `name`, `email`, `password` (Maks 255 Karakter) | **201:** `{"data": "OK"}`<br>**400:** Validasi, atau Email Terdaftar |
| **POST** | `/login` | Membuka sesi & menghasilkan Token | - | `email`, `password` | **200:** `{"data": "UUID-TOKEN"}`<br>**401:** Kredensial Salah |
| **GET** | `/current`| Memperoleh riwayat Profil pengguna | `Authorization: Bearer <token>` | - | **200:** `{"data": {id, name, email...}}`<br>**401:** Unauthorized |
| **DELETE**| `/logout` | Memusnahkan Token Sesi agar tak bisa dipakai lagi | `Authorization: Bearer <token>` | - | **200:** `{"data": "OK"}`<br>**401:** Unauthorized / Invalid Token |

---

## 🛠️ Cara Setup Project

1.  **Cloning Repositori:** Tarik seluruh berkas *sorce code* ke environment lokal milik Anda.
2.  **Persiapan Database:**
    *   Pastikan Anda sudah menghidupkan server servis MySQL lokal Anda (seperti XAMPP / Laragon).
    *   Buatlah sebuah skema database kosong di _MySQL Workbench / phpMyAdmin_. (Contoh: `vibe_test`).
3.  **Pengaturan Variabel Lingkungan (`.env`):**
    *   Bikin satu file baru tanpa nama, cukup ketik eksistensinya `.env` sejejer dengan file package.
    *   Isi kredensial DB sesuai instalasi MySQL Anda, misal:
        ```env
        DB_HOST=localhost
        DB_PORT=3306
        DB_USER=root
        DB_PASSWORD=
        DB_NAME=vibe_test
        ```
4.  **Install Modul Dependensi**:
    Buka Terminal dan eksekusi komando untuk bun memasangkan package yang dibutuhkan:
    ```bash
    bun install
    ```
5.  **Migrasi / Sinkronisasi Basis Data**: Pulas dan tempakan struktur Schema dari `src/db/schema.ts` secara sungguhan menuju skema MySQL Anda:
    ```bash
    bun run db:push
    ```

---

## 🚀 Cara Menjalankan Aplikasi (Run App)

Untuk menaikkan server dalam mode *Developer* (*Hot-reloading* setiap Anda mengubah baris kodenya), jalankan:

```bash
bun run dev
```

Jika sukses berjalan tanpa *error connection string*, baris keluaran akan menampilkan tulisan: `🦊 Elysia is running at localhost:3000`.

---

## 🧪 Cara Melakukan Testing Aplikasi

Proyek ini telah dikawal oleh otomatisasi fungsi pelaporan *Bug/Test Scenario Coverage* pada kerangka framework `bun:test` yang mencakup manipulasi alur sesi serta perlakuan validasi payloadnya secara rekam total. 

Cukup ketik langkah ini pada Root path aplikasi untuk menjalankan pengujian otomatisnya:
```bash
bun test
```
**Catatan Penting Mekanisme Test:** Runtime dari kode `users.test.ts` telah diatur untuk mereset dan membinasakan isi _table_ `sessions` maupun _table_ `users` setiap kali Test diunggah ulang agar pengetesan selalu bersifat *clean environment* terisolasi dan deterministik tanpa polusi sampah memori riwayat testing sebelum-sebelumnya.
