# [Feature] Integrasi Swagger UI untuk Dokumentasi API

**Tujuan:**
Menambahkan fitur dokumentasi API interaktif secara otomatis menggunakan integrasi resmi Swagger (OAS - OpenAPI Specification) pada framework ElysiaJS. Fitur ini bertujuan agar *developer/client* (*frontend engineer*, dll.) dapat dengan mudah melihat kontrak data, deskripsi endpoint, dan melakukan uji coba API langsung melalui peramban (browser) tanpa harus menggunakan Postman atau alat eksternal lainnya.

## Spesifikasi Kebutuhan (Requirements)
Proyek ini berjalan di atas instance ElysiaJS. Oleh karena itu, *plugin* yang paling tepat untuk menangani ini adalah pustaka resmi dari *ecosystem* mereka yakni `@elysiajs/swagger`.

---

## Tahapan Implementasi (Panduan untuk Junior Programmer / AI)

Ikuti langkah-langkah detail di bawah ini untuk mencapai *Goal* tersebut dengan aman dan terstruktur. Harap eksekusi berurutan.

### Tahap 1: Instalasi Pustaka (Library)
1. Buka terminal (console) pada root direktori project (`belajar-vibe-coding`).
2. Ketikkan dan jalankan instruksi pemasangan paket dependensi untuk mengekspor plugin ke *node_modules*:
   ```bash
   bun add @elysiajs/swagger
   ```

### Tahap 2: Mendaftarkan Plugin ke Entry File
Setelah dependensi terinstal, pasang plugin Swagger tersebut agar dikenali oleh inti aplikasi (Global App Route).
1. Buka file **`src/index.ts`**.
2. Di bagian paling atas file, *import* fungsi pluginnya:
   ```typescript
   import { swagger } from '@elysiajs/swagger';
   ```
3. Di dalam rantai deklarasi konstan `app`, masukkan *.use(swagger(...))* sebelum Anda memuat route apa pun atau menancapkan `.listen()`. Disarankan untuk mengkonfigurasi info dasarnya juga.
   Contoh bentuk jadinya di `src/index.ts`:
   ```typescript
   export const app = new Elysia()
     .use(swagger({
       documentation: {
         info: {
           title: 'Belajar Vibe Coding API',
           version: '1.0.0',
           description: 'Dokumentasi untuk User Authentication API'
         }
       }
     }))
     .get('/', () => 'Hello from Elysia, Drizzle, and MySQL!')
     .use(usersRoute)
     // ... sisa kode lainnya
   ```

### Tahap 3: Memberikan Dekorasi/Deskripsi pada Masing-Masing Route (Opsional namun Wajib untuk Kerapian Dokumen)
Meski otomatis mengenali validasi payload (*TypeBox*), *Swagger UI* akan jauh lebih komunikatif bila tiap layanan rute disertakan _Metadata_ (seperti `Tags` agar ter-submateri atau `Summary` untuk sub-judul rute).
1. Buka **`src/routes/users-route.ts`**.
2. Di setiap endpoint (`.post('/', ...)`, `.post('/login', ...)`, `.get('/current', ...)`, dan `.delete('/logout', ...)`), *inject* properti `detail` pada parameter opsi terakhir (tepat setelah / berdampingan dengan balok konfigurasi `body:` atau sendirian jika tak punya body).
   *Contoh untuk rute Registrasi (`POST /`):*
   ```typescript
   .post('/', async ({ body, set }) => {
     // logic
   }, {
     body: t.Object({ /* konfigurasi varchar(limit) kemarin */ }),
     detail: {
       tags: ['Auth'],
       summary: 'Mendaftarkan Akun Pengguna Baru',
       description: 'Fungsi ini digunakan untuk meracik dan melakukan insert ke dalam basis data.'
     }
   })
   ```
3. Ulangi penyematan label *detail metadata* serupa (Gunakan nilai blok `tags: ['Auth']` agar mereka berkumpul di satu kategori folder Auth pada halaman UI nantinya) kepada sisi bawah kode Route *Login*, *Get Current Profil*, dan *Logout*.

### Tahap 4: Verifikasi & Uji Coba UI (Testing)
1. Nyalakan peladen (server) dengan perintah: `bun run dev`
2. Buka browser internet *(Chrome/Firefox/Safari)*.
3. Ketikkan URL host bawaan yang disertakan ekor swagger: `http://localhost:3000/swagger`
4. **Indikator Sukses:** Browser harus merender halaman UI Swagger OpenAPI standar secara utuh, mendaftarkan secara visual keempat rute `/api/users/*` dengan warna-warni spesifik *GET/POST/DELETE*, serta pengguna bisa menekan tombol "*Try it out*" untuk melempar tembakan uji HTTP Request melaluinya.

---
**Catatan Penting:** 
Jangan menghapus ataupun merusak blok _unit testing_ sebelumnya. Penambahan _extension/plugin_ ini tak akan mengganggu skenario unit-test `bun test` milik kita karena plugin murni bersifat kosmetika presentasi sisi terdepan. Selamat Mengkoding!
