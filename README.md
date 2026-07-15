# NusaArtha

> Platform investasi ekosistem UMKM Indonesia berbasis Stellar Blockchain

NusaArtha menghubungkan **pemilik brand UMKM**, **investor**, **operator outlet**, dan **platform admin** dalam satu ekosistem terintegrasi — memungkinkan brand lokal berkembang melalui pendanaan transparan, token-based ownership, dan revenue sharing otomatis di atas Stellar Soroban.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Demo & Screenshot](#demo--screenshot)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Smart Contracts](#smart-contracts)
- [Alur Bisnis](#alur-bisnis)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Deploy Smart Contracts](#deploy-smart-contracts)
- [Akun Seed (Development)](#akun-seed-development)
- [API Endpoints](#api-endpoints)
- [Kontribusi](#kontribusi)

---

## Gambaran Umum

UMKM Indonesia menghadapi tantangan besar dalam ekspansi: keterbatasan modal, sulitnya mencari operator terpercaya, dan kurangnya transparansi kepada investor. NusaArtha menjawab ketiganya sekaligus.

**Bagaimana cara kerjanya:**
1. Brand owner mendaftarkan bisnis mereka dan melengkapi profil + dokumen legal
2. Admin melakukan due diligence dan menilai readiness score & risk level
3. Brand yang disetujui membuat *investment pool* — outlet baru yang akan didanai secara kolektif
4. Investor membeli token pool menggunakan Stellar, mendapatkan hak revenue sharing
5. Operator mengelola outlet fisik dan mencatat transaksi POS
6. Revenue didistribusikan otomatis sesuai proporsi: Investor 40% · Brand 30% · Operator 20% · Platform 10%
7. Pemegang token berpartisipasi dalam governance melalui voting proposal on-chain

Seluruh alur dicatat secara immutable di Stellar Soroban melalui empat smart contract.

---

## Demo & Screenshot

> Jalankan server lokal untuk melihat tampilan lengkap: `npm run dev` → http://localhost:3000

### Landing Page
Menampilkan hero section, penjelasan masalah & solusi, fitur platform, cara kerja, statistik, preview dashboard untuk setiap role, dan marketplace investment.

### Dashboard Brand Owner (`/dashboard`)
Monitoring outlet, manajemen paket outlet (investment package), dan progress pendanaan secara real-time.

### Investor Marketplace (`/investor/dashboard/marketplace`)
Daftar pool aktif dengan detail ROI estimasi, BEP, progress funding, dan tombol beli token langsung via Freighter wallet.

### Admin Panel (`/admin`)
Manajemen brand, kampanye, operator, outlet, distribusi revenue, dan analytics platform.

### Operator Dashboard (`/operator`)
Overview outlet, input transaksi POS, monitoring performa harian.

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                │
│  Landing  │  Brand Dashboard  │  Investor  │  Operator  │
│                    Admin Panel                           │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (Next.js Route Handlers)
┌────────────────────────▼────────────────────────────────┐
│               Backend (Next.js API Routes)               │
│  Auth (JWT)  │  Brand  │  Pools  │  Investments  │  POS │
│  Revenue     │  KYC    │  Upload │  Operators    │  ...  │
└────┬──────────────────────────────────────┬─────────────┘
     │                                       │
┌────▼──────┐                      ┌─────────▼───────────┐
│  SQLite   │                      │   Stellar Soroban   │
│  (Prisma) │                      │   Testnet/Mainnet   │
│  dev.db   │                      │                     │
└───────────┘              ┌───────┴───────┐    ┌────────┴──────┐
                           │ brand_registry│    │investment_pool│
                           │  governance   │    │  audit_trail  │
                           └───────────────┘    └───────────────┘
                                      │
                           ┌──────────▼──────────┐
                           │    IPFS (Pinata)     │
                           │  Legal docs, SOP,    │
                           │  Disclosure docs,    │
                           │  Audit event data    │
                           └─────────────────────┘
```

---

## Fitur Utama

### 🏢 Brand Owner
- Registrasi brand dan onboarding multi-step
- Pengisian profil bisnis lengkap: deskripsi, visi-misi, data finansial, informasi legal (NIB, NPWP)
- Upload dokumen legal dan SOP ke IPFS
- Brand readiness scoring otomatis
- Dashboard monitoring performa outlet
- Manajemen paket outlet (investment packages)
- Koneksi wallet Stellar via Freighter

### 💰 Investor
- Registrasi & verifikasi KYC
- Marketplace investment pool dengan filter dan sorting
- Detail pool: target funding, progress, ROI estimasi, BEP, disclosure document
- Pembelian token pool langsung via Stellar wallet
- Dashboard portfolio dengan tracking nilai investasi
- Monitoring revenue yang diterima
- Partisipasi governance — buat dan vote proposal on-chain

### 🏪 Operator
- Dashboard outlet yang dikelola
- Input dan sinkronisasi transaksi POS harian
- Monitoring performa outlet (omzet, jumlah transaksi, rata-rata order)
- Revenue tracking

### 🔧 Admin
- Due diligence brand: approve/reject dengan readiness score dan risk level
- Manajemen kampanye (investment pool): publish, update status
- Manajemen operator dan outlet
- Distribusi revenue ke semua pihak
- Analytics platform: total dana terkumpul, jumlah brand aktif, outlet beroperasi
- Monitoring on-chain via audit trail

### 🔗 Blockchain & Transparency
- Seluruh event penting dicatat on-chain via Audit Trail contract
- Token ownership tercatat immutable di Investment Pool contract
- Governance voting dengan bobot token
- Dokumen dapat diverifikasi via IPFS CID

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Language | TypeScript 5 |
| Auth | JWT (jose), bcryptjs |
| ORM | Prisma 5 |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Blockchain | Stellar Soroban Testnet |
| Wallet | Freighter API v6 |
| SDK | @stellar/stellar-sdk v12 |
| Smart Contracts | Rust / Soroban SDK |
| IPFS | Pinata |
| Icons | Lucide React |
| UI Primitives | Radix UI |

---

## Smart Contracts

Empat smart contract Soroban ditulis dalam Rust, berlokasi di folder `contracts/`:

### `brand_registry`
Mendaftarkan dan memverifikasi brand di blockchain.
| Fungsi | Deskripsi |
|--------|-----------|
| `register_brand(owner, name, business_type)` | Daftarkan brand baru, status "Pending" |
| `approve_brand(admin, owner, name, score, risk)` | Admin approve brand setelah due diligence |
| `reject_brand(admin, owner, name)` | Admin reject brand |
| `get_brand(owner, name)` | Query brand by owner |
| `get_all_brands()` | Ambil semua brand |
| `get_brands_by_status(status)` | Filter brand berdasarkan status |

### `investment_pool`
Mengelola pool investasi dan pembelian token.
| Fungsi | Deskripsi |
|--------|-----------|
| `publish_pool(admin, brand_owner, pool_id, ..., disclosure_cid)` | Publish pool (revenue shares harus total 100) |
| `record_investment(investor, pool_id, tokens, tx_hash)` | Catat pembelian token, auto-transisi ke ACTIVE |
| `set_operating(admin, pool_id)` | Tandai pool sebagai beroperasi |
| `get_pool(pool_id)` | Query detail pool |
| `tokens_available(pool_id)` | Sisa token tersedia |

Revenue shares default: Investor **40%** · Brand **30%** · Operator **20%** · Platform **10%**

### `governance`
Voting proposal berbobot token untuk keputusan pool.
| Fungsi | Deskripsi |
|--------|-----------|
| `create_proposal(creator, pool_id, title, description_cid, options, duration_days)` | Buat proposal baru |
| `vote(voter, proposal_id, option_id, vote_weight)` | Cast vote (bobot = jumlah token) |
| `execute_proposal(executor, proposal_id)` | Eksekusi hasil voting setelah periode selesai |
| `has_voted(voter, proposal_id)` | Cek apakah address sudah vote |
| `get_proposals_by_pool(pool_id)` | Ambil semua proposal sebuah pool |

### `audit_trail`
Log immutable untuk seluruh event penting platform.
| Event Type | Deskripsi |
|------------|-----------|
| `BrandApproved / BrandRejected` | Hasil due diligence brand |
| `PoolPublished` | Pool diterbitkan |
| `InvestmentMade` | Pembelian token |
| `RevenueDistributed` | Distribusi revenue |
| `GovernanceVote / GovernanceExecuted` | Aktivitas voting |
| `OutletStatusChanged` | Perubahan status outlet |
| `KycVerified` | Verifikasi KYC investor |

Data event disimpan di IPFS (full detail), hanya CID yang di-log on-chain.

---

## Alur Bisnis

```
Brand Owner                Admin                    Investor             Operator
     │                       │                          │                    │
     │── Daftar & Onboarding ─►│                          │                    │
     │── Upload Legal Docs ───►│                          │                    │
     │                       │── Due Diligence           │                    │
     │                       │── Approve Brand ─────────►│                    │
     │                       │                          │                    │
     │── Buat Investment Pool►│                          │                    │
     │                       │── Publish Pool ──────────►│                    │
     │                       │                          │── Beli Token        │
     │                       │                          │── Record On-Chain   │
     │                       │                          │                    │
     │                       │── Assign Operator ───────────────────────────►│
     │                       │── Set Outlet OPERATING                        │
     │                       │                          │                    │
     │◄── Monitor Outlet ────────────────────────────────────────────────────│
     │                       │◄── Distribusi Revenue ───│◄── Revenue Share   │
     │                       │                          │                    │
     │                       │                          │◄── Governance Vote  │
     │◄── Revenue Share ─────│                          │                    │
```

Pool status flow: `DRAFT → PUBLISHED → ACTIVE → OPERATING → COMPLETED`

---

## Struktur Proyek

```
NusaArtha/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login & Register (brand owner)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                # Admin panel
│   │   │   ├── analytics/
│   │   │   ├── brands/[id]/
│   │   │   ├── campaigns/[id]/
│   │   │   ├── operators/[id]/
│   │   │   ├── outlets/[id]/
│   │   │   └── revenue/
│   │   ├── api/                  # REST API routes
│   │   │   ├── admin/            # due-diligence, pool management
│   │   │   ├── auth/             # login, register, logout, me, wallet
│   │   │   ├── brands/           # CRUD brand, profile, register
│   │   │   ├── investments/      # investments + mint (token purchase)
│   │   │   ├── investor/         # investor monitoring
│   │   │   ├── kyc/              # KYC verification
│   │   │   ├── operator/         # operator outlets & performance
│   │   │   ├── pools/[id]/       # pool CRUD + publish
│   │   │   ├── pos/sync/         # POS transaction sync
│   │   │   ├── revenue/          # distribute revenue
│   │   │   └── upload/           # IPFS file upload
│   │   ├── dashboard/            # Brand owner dashboard
│   │   │   ├── monitoring/
│   │   │   ├── outlet/
│   │   │   ├── paket-outlet/[id]/
│   │   │   └── settings/
│   │   ├── investor/             # Investor flow
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify/           # KYC
│   │   │   └── dashboard/
│   │   │       ├── marketplace/  # Browse & beli token pool
│   │   │       ├── portfolio/[id]/
│   │   │       ├── monitoring/
│   │   │       ├── revenue/
│   │   │       └── governance/
│   │   ├── operator/             # Operator dashboard
│   │   │   ├── outlet/
│   │   │   ├── performance/
│   │   │   └── pos/
│   │   ├── profile/complete/     # Brand profile completion
│   │   ├── register-brand/       # Brand registration
│   │   └── review/               # Pending & success review pages
│   │       ├── pending/
│   │       └── success/
│   ├── components/
│   │   ├── ui/                   # Button, Card, Badge, Tabs, Accordion, WalletButton
│   │   └── sections/             # Landing page sections (Hero, Problem, Feature, dll)
│   └── lib/
│       ├── auth.ts               # JWT helpers
│       ├── prisma.ts             # Prisma client singleton
│       ├── ipfs.ts               # Pinata upload
│       ├── utils.ts              # General utilities
│       ├── language-context.tsx  # i18n context
│       ├── scoring/              # Brand readiness, operator & outlet performance scoring
│       ├── pos/                  # Distributable cash calculation
│       └── stellar/              # Stellar integration (wallet, Soroban, Horizon, governance, audit)
├── contracts/
│   ├── brand_registry/           # Rust/Soroban smart contract
│   ├── investment_pool/
│   ├── governance/
│   └── audit_trail/
├── prisma/
│   ├── schema.prisma             # Data models
│   └── migrations/
├── public/                       # Static assets, illustrations, logo
├── seed.mjs                      # Database seed script
├── .env.example                  # Template environment variables
└── next.config.ts
```

---

## Prasyarat

Pastikan sistem Anda sudah memiliki:

- **Node.js** 20+ (rekomendasi 22.x) — [nodejs.org](https://nodejs.org)
- **npm** 10+
- **Rust** + **Cargo** (untuk build smart contracts) — [rustup.rs](https://rustup.rs)
- **Soroban CLI** (untuk deploy contracts) — `cargo install --locked soroban-cli`
- **Git**

---

## Instalasi & Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd NusaArtha
```

### 2. Install dependencies

```bash
npm install
```

### 3. Salin file environment

```bash
# CMD
copy .env.example .env.local

# PowerShell
Copy-Item .env.example .env.local
```

### 4. Setup database

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev

# (Opsional) Isi data contoh untuk development
node seed.mjs
```

---

## Konfigurasi Environment

Edit `.env.local` dan sesuaikan nilai-nilai berikut:

```env
# ── Database ──────────────────────────────────────────────
DATABASE_URL="file:./dev.db"              # SQLite untuk dev

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET_KEY="ganti-dengan-secret-key-yang-kuat"

# ── Pinata IPFS ───────────────────────────────────────────
# Dapatkan dari https://app.pinata.cloud
PINATA_JWT=""
PINATA_API_KEY=""
PINATA_SECRET_API_KEY=""
NEXT_PUBLIC_PINATA_GATEWAY="https://gateway.pinata.cloud/ipfs"

# ── Stellar Network ───────────────────────────────────────
NEXT_PUBLIC_STELLAR_NETWORK="TESTNET"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Smart Contract Addresses – isi setelah deploy contracts
NEXT_PUBLIC_BRAND_REGISTRY_CONTRACT_ID=""
NEXT_PUBLIC_FACTORY_CONTRACT_ID=""
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID=""
NEXT_PUBLIC_AUDIT_CONTRACT_ID=""

# ── Platform Stellar Account (server-side only) ───────────
STELLAR_PLATFORM_SECRET_KEY=""
STELLAR_PLATFORM_PUBLIC_KEY=""

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> ⚠️ Variabel tanpa prefix `NEXT_PUBLIC_` tidak pernah di-expose ke browser — simpan `STELLAR_PLATFORM_SECRET_KEY` dengan aman dan jangan commit ke repository.

---

## Menjalankan Aplikasi

```bash
# Development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

```bash
# Build production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Prisma Studio (visual database explorer)
npx prisma studio
```

---

## Deploy Smart Contracts

Pastikan Soroban CLI sudah terinstall dan Anda memiliki akun Stellar testnet dengan XLM.

```bash
cd contracts

# Jalankan script deploy (memerlukan konfigurasi Soroban CLI)
bash deploy.sh
```

Setelah deploy, isi contract addresses yang didapat ke `.env.local`:

```env
NEXT_PUBLIC_BRAND_REGISTRY_CONTRACT_ID="C..."
NEXT_PUBLIC_FACTORY_CONTRACT_ID="C..."
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID="C..."
NEXT_PUBLIC_AUDIT_CONTRACT_ID="C..."
```

Untuk mendapatkan XLM testnet: [https://laboratory.stellar.org/#account-creator](https://laboratory.stellar.org/#account-creator)

---

## Akun Seed (Development)

Setelah menjalankan `node seed.mjs`, berikut akun contoh yang tersedia:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nusaartha.id | (lihat seed.mjs) |
| Brand Owner | brand@nusaartha.id | (lihat seed.mjs) |
| Operator | operator@nusaartha.id | (lihat seed.mjs) |
| Investor | investor@nusaartha.id | (lihat seed.mjs) |

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| GET | `/api/auth/me` | User yang sedang login |
| POST | `/api/auth/wallet` | Link wallet address |
| GET/POST | `/api/brands` | List/create brand |
| GET/PATCH | `/api/brands/[id]` | Detail/update brand |
| POST | `/api/brands/register` | Registrasi brand on-chain |
| PATCH | `/api/brands/profile` | Update profil brand |
| GET/POST | `/api/pools` | List/create investment pool |
| GET/PATCH | `/api/pools/[id]` | Detail/update pool |
| POST | `/api/pools/[id]/publish` | Publish pool |
| GET/POST | `/api/investments` | List/create investment |
| POST | `/api/investments/mint` | Mint token (pembelian investor) |
| POST | `/api/pos/sync` | Sync transaksi POS |
| POST | `/api/revenue/distribute` | Distribusi revenue |
| POST | `/api/kyc` | Verifikasi KYC |
| POST | `/api/upload` | Upload file ke IPFS |
| POST | `/api/admin/due-diligence` | Admin approve/reject brand |
| PATCH | `/api/admin/pools` | Admin update pool status |

---

## Kontribusi

1. Fork repository ini
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "feat: deskripsi singkat"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

Pastikan tidak ada secret atau kredensial yang ikut ter-commit.

---

## Catatan Pengembangan

- Database default SQLite hanya untuk development. Production disarankan migrasi ke **PostgreSQL**.
- Smart contracts perlu di-deploy ke Stellar testnet sebelum fitur blockchain aktif sepenuhnya.
- Untuk Windows development, Next.js config otomatis disable TLS verification saat connect ke Stellar testnet. Jangan gunakan setting ini di production.
- Integrasi Freighter wallet memerlukan extension browser [Freighter](https://www.freighter.app/) terinstall.

---

<div align="center">
  <p>Dibangun dengan ❤️ untuk UMKM Indonesia</p>
  <p>Powered by <strong>Stellar Soroban</strong> · <strong>Next.js</strong> · <strong>Prisma</strong></p>
</div>
