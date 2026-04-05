# [Bug] Handle Error Saat Registrasi dengan Karakter Terlalu Panjang

**Deskripsi Bug:**
Saat pengguna mencoba meregistrasi akun baru (pada endpoint `POST /api/users`) menggunakan isian `name` dengan string yang di atas 255 karakter, sistem mengalami *crash* sehingga memunculkan error database (*500 Internal Server Error*). 

**Penyebab (Root Cause):**
Pada skema database MySQL (`schema.ts`), kita sudah mendefinisikan batas limit panjang untuk kolom `name` maksimal sebesar `varchar(255)`. Sayangnya, pada sisi *routing layer* Elysia (`users-route.ts`), validasi input (tipe data) masih mengatur secara generik (`t.String()`) tanpa menyatakan pembatasan batas atas panjang jumlah string. 

Akibatnya, respon JSON dengan payload kepanjangan lolos di pengecekan API. Request itu kemudian dilempar masuk ke logic Service lalu dieksekusi menembus Drizzle ORM yang mengakibatkan penolakan keras oleh basis data (_SQL Error: Data too long for column 'name'_). Kegagalan query inilah penyebab timbulnya 500 Error.

**Expected Behavior (Output yang Seharusnya):**
Sistem seharusnya menolak payload masukan langsung di pertahanan level pertama (*routing* & *validator* API) tanpa berlanjut membebani Query MySQL. Layanan API harus mampu memberitahukan masalah panjang ketidakcocokan data dengan mengembalikan status HTTP `400 Bad Request` menggunakan format laporan *standard-error* validator balasan framework itu sendiri.

---

## Tahapan-Tahapan Perbaikan (Untuk Implementator)

Bagi rekan Junior Engineer, Programmer, ataupun model AI yang mendelegasikan perbaikan tiket ini, panduan di bawah berguna menyegerakan dan mengisolasi permasalahan. Anda hanya diminta memperbarui layer verifikator rute, bukan skema databasenya!

1. **Akses Berkas Target**: Buka file tempat mendefinisikan rute API untuk user pada jalur `src/routes/users-route.ts`.
2. **Cari Blok Validasi Registrasi**: Temukan blok pendaftaran rute `app.post('/', ...)` (endpoint untuk Registrasi). Silakan perhatikan parameter terakhir (opsi metadata parameter ke-3) objek *body*.
3. **Penyisipan Batasan Parameter (Elysia Validation)**:
   Pada definisi input payload yang menangani formattype `name`, gantikan pemakaian `t.String()` agar memuat object option constraint `maxLength` bawaan spesifikasi perpustakaan *TypeBox*. Jadikan seperti berikut:
   ```typescript
   name: t.String({ maxLength: 255 })
   ```
4. **Validasi Merata Seragam (Sangat Direkomendasikan)**:
   Mengingat bahwa field `email` dan `password` juga diset dengan limitasi `varchar(255)` secara *database schema level*, terapkan pengamanan lapis *maxLength* tersebut kepada entri lain di form POST itu juga demi keamanan *rate/sizing* input.
   Sehingga menjadi lengkapnya:
   ```typescript
   body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
   })
   ```
5. **Testing Integritas Akhir**:
   - Pastikan local test server menyala (`bun run dev`).
   - Eksekusi tembakan URL/CURL memuat test request string pendaftaran yang salah satu datanya dipanjang-panjangkan lebih daripada 300 huruf karakter (*a... dst*).
   - **Indikator Sukses Perbaikan**: Elysia secara otomatis telah menahan _bad format_ payload tersebut di front door (di rute) sembari mengembalikan Object struktur JSON peringatan validasi: `"Expected string length less or equal to 255"` lengkap disertai HTTP Code 400 Bad Request. Tidak boleh ada lagi pesan "Failed Query SQL".
