# NusaArtha

NusaArtha adalah platform digital untuk mempercepat ekspansi UMKM Indonesia melalui ekosistem kemitraan yang terintegrasi antara pemilik brand, investor, operator outlet, dan platform. Aplikasi ini menggabungkan pengalaman landing page modern, sistem autentikasi, onboarding brand, marketplace investasi, serta integrasi wallet dan smart contract berbasis Stellar.

## Preview Aplikasi

Saat dijalankan secara lokal, aplikasi menampilkan landing page utama dengan alur berikut:

- Hero section untuk brand onboarding dan marketplace investor
- Penjelasan masalah dan solusi ekspansi UMKM
- Fitur utama platform
- Preview dashboard untuk brand, investor, dan operator
- CTA untuk mendaftar brand dan masuk ke dashboard

Akses aplikasi lokal di:

- http://localhost:3000

## Fitur Utama

- Landing page responsif dan modern untuk mempromosikan platform
- Autentikasi pengguna dengan JWT
- Role-based access untuk admin, brand owner, investor, dan operator
- Onboarding brand dan profil bisnis
- Manajemen investasi dan pool pendanaan
- Monitoring outlet dan transaksi POS
- Integrasi wallet Stellar/Freighter
- Dukungan smart contract dan audit trail melalui modul kontrak di folder contracts
- Penyimpanan dokumen dan metadata melalui IPFS-ready flow

## Stack Teknologi

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Prisma ORM dengan SQLite untuk development
- JWT (jose)
- Stellar SDK + Freighter API
- Rust smart contracts di folder contracts

## Prasyarat

Pastikan sistem Anda sudah memiliki:

- Node.js 20+ (direkomendasikan 22.x)
- npm
- Git

## Instalasi

1. Clone repository

   ```bash
   git clone <repo-url>
   cd NusaArtha
   ```

2. Install dependency

   ```bash
   npm install
   ```

3. Salin file environment

   ```bash
   copy .env.example .env.local
   ```

   atau jika menggunakan PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Sesuaikan nilai environment sesuai kebutuhan Anda, terutama:
   - DATABASE_URL
   - JWT_SECRET_KEY
   - PINATA\_\* jika ingin mengaktifkan upload IPFS
   - NEXT*PUBLIC*\* untuk konfigurasi Stellar

## Setup Database

Generate Prisma client dan jalankan migrasi:

```bash
npx prisma generate
npx prisma migrate dev
```

Jika ingin mengisi data contoh untuk development:

```bash
node seed.mjs
```

Seed script akan membuat akun contoh:

- admin@nusaartha.id
- brand@nusaartha.id
- operator@nusaartha.id
- investor@nusaartha.id

## Menjalankan Aplikasi

Jalankan server pengembangan:

```bash
npm run dev
```

Buka http://localhost:3000 untuk melihat aplikasi.

## Perintah Berguna

```bash
npm run build
npm run lint
npx prisma studio
```

## Struktur Proyek

```text
src/
  app/                # Routing Next.js App Router
  components/         # UI components dan section landing page
  lib/                # Auth, Prisma, Stellar, utilities, scoring
  app/api/            # API routes untuk admin, brand, investor, operator, outlet, pool, POS, revenue
contracts/            # Smart contract Rust untuk brand registry, governance, investment pool, audit trail
prisma/               # Schema Prisma dan migrasi database
public/               # Asset statis
```

## Konfigurasi Environment

File [.env.example](.env.example) berisi contoh variabel yang diperlukan. Beberapa variabel penting:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET_KEY="ganti-dengan-secret-key-yang-kuat"
NEXT_PUBLIC_STELLAR_NETWORK="TESTNET"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_BRAND_REGISTRY_CONTRACT_ID=""
NEXT_PUBLIC_FACTORY_CONTRACT_ID=""
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID=""
NEXT_PUBLIC_AUDIT_CONTRACT_ID=""
```

## Alur Bisnis yang Didukung

Aplikasi ini mendukung alur ekspansi UMKM dari awal sampai operasional:

1. Pendaftaran brand dan onboarding
2. Evaluasi readiness dan risk scoring
3. Due diligence dan pengumpulan dokumen
4. Pembuatan investment pool
5. Pendanaan investor
6. Pembukaan outlet baru
7. Monitoring kinerja outlet dan POS
8. Distribusi revenue sharing

## Catatan Pengembangan

- Database default untuk development menggunakan SQLite.
- Untuk environment production, pertimbangkan migrasi ke PostgreSQL atau database lain yang lebih cocok.
- Integrasi Stellar dan IPFS memerlukan konfigurasi kunci dan credential yang aman.
- Smart contract masih perlu di-deploy sebelum beberapa fitur blockchain dapat digunakan penuh.

## Kontribusi

Jika Anda ingin berkontribusi, silakan buat branch baru, lakukan perubahan, lalu kirim pull request.
