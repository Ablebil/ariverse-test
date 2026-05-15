# GameVault

Platform katalog game berbasis web untuk gamer Indonesia. User dapat menjelajahi koleksi game, melihat detail lengkap, dan menyimpan game favorit ke wishlist. Tersedia panel admin untuk mengelola seluruh konten katalog.

---

## Daftar Isi

- [Cara Menjalankan Lokal](#cara-menjalankan-lokal)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)

---

## Cara Menjalankan Lokal

### Prasyarat

- Node.js 20+
- PostgreSQL (berjalan secara lokal atau remote)
- npm
- Docker (opsional, untuk Swagger UI)

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd ariverse-test
   ```

2. **Salin file environment dan isi variabelnya**

   ```bash
   cp .env.example .env
   ```

   Isi `.env` dengan nilai yang sesuai:

   | Variabel | Contoh | Keterangan |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://user:pass@localhost:5432/gamevault` | Connection string PostgreSQL |
   | `JWT_ACCESS_SECRET` | *(random string panjang)* | Secret untuk signing access token |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` | Masa berlaku access token |
   | `REFRESH_TOKEN_EXPIRES_DAYS` | `7` | Masa berlaku refresh token (hari) |

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Jalankan migrasi database**

   ```bash
   npx prisma migrate dev
   ```

5. **Seed database**

   Perintah ini akan mengisi database dengan 30 game, 10 genre, 8 platform, dan 1 akun admin dummy.

   ```bash
   npx prisma db seed
   ```

   Kredensial admin setelah seed:

   | Field | Value |
   |---|---|
   | Email | `admin@gamevault.com` |
   | Password | `admin123456` |

6. **Jalankan development server**

   ```bash
   npm run dev
   ```

   Aplikasi dapat diakses di `http://localhost:3000`.

7. ***(Opsional)* Jalankan Swagger UI**

   ```bash
   docker compose up -d
   ```

   Dokumentasi API dapat diakses di `http://localhost:8081/api-docs`.

---

## Tech Stack

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| Runtime | React | 19.2.4 |
| Database | PostgreSQL | — |
| ORM | Prisma | ^7.8.0 |
| Validasi | Zod | ^4.4.3 |
| HTTP Client | Axios | ^1.16.1 |
| Server State | TanStack Query | ^5.100.10 |
| Client State | Zustand | ^5.0.13 |
| Styling | Tailwind CSS + shadcn/ui | ^4 |
| Language | TypeScript | ^5 |
| API Docs | OpenAPI 3.1 + Swagger UI | — |
| CI | GitHub Actions | — |

### Alasan Pemilihan

**Next.js App Router**: Memungkinkan frontend dan backend berjalan dalam satu repo (fullstack monorepo) tanpa setup terpisah. Server Components mengurangi JavaScript yang dikirim ke client, dan API Routes menyediakan backend layer tanpa perlu server tambahan.

**PostgreSQL + Prisma**: Data katalog game memiliki relasi yang jelas (game → genre, game → platform, user → wishlist), sehingga relational database adalah pilihan yang tepat. Prisma memberikan type-safety end-to-end antara schema database dan kode TypeScript, sekaligus mempermudah migrasi.

**JWT**: Implementasi manual dipilih karena butuh kontrol penuh atas mekanisme refresh token multi-device. Library seperti NextAuth terlalu opinionated dan mengabstraksi terlalu banyak untuk kebutuhan ini. Access token dikirim via `Authorization: Bearer` header, sementara refresh token disimpan sebagai opaque random hex (bukan JWT) di database dan dikirim via httpOnly cookie — karena refresh token tidak perlu membawa claims, cukup sebagai identifier unik yang di-lookup ke database.

**Zustand**: Dipilih untuk client state (auth session, guest wishlist) karena API-nya minimal dan tidak membutuhkan boilerplate seperti Redux. Cocok untuk state yang sederhana namun perlu persisten di localStorage.

**TanStack Query**: Menangani seluruh server state (fetching, caching, background refetch, loading/error state) secara otomatis. Menghindari kebutuhan mengelola state `isLoading`, `isError`, dan cache secara manual.

---

## Struktur Folder

```
├── prisma/
│   ├── migrations/         # Riwayat migrasi database
│   ├── schema.prisma       # Schema Prisma
│   └── seed.ts             # Script seed data
│
├── docs/                   # Dokumentasi OpenAPI (Swagger)
│
└── src/
    ├── app/
    │   ├── api/v1/         # API Routes (backend)
    │   │   ├── auth/       # Register, login, logout, refresh, me
    │   │   ├── games/      # CRUD game + public catalog
    │   │   ├── genres/     # CRUD genre
    │   │   ├── platforms/  # CRUD platform
    │   │   └── wishlist/   # Add, remove, list, merge
    │   │
    │   ├── (main)/         # Halaman publik (layout dengan Navbar + Footer)
    │   │   ├── games/      # Halaman list & detail game
    │   │   └── wishlist/   # Halaman wishlist user
    │   │
    │   ├── (auth)/         # Halaman guest-only (login, register)
    │   └── admin/          # Halaman admin-only (dashboard + CRUD)
    │
    ├── components/
    │   ├── ui/             # Komponen shadcn/ui
    │   ├── layout/         # Navbar, Footer
    │   ├── game/           # GameCard, GameGrid, GameFilter, dst.
    │   ├── wishlist/       # WishlistButton
    │   ├── admin/          # GameTable, GameFormSheet, DeleteGameDialog
    │   └── providers/      # QueryProvider (TanStack Query)
    │
    ├── hooks/
    │   ├── queries/        # TanStack Query hooks (useGames, useGame, dst.)
    │   ├── useAuth.ts      # Login, logout, register actions
    │   └── useWishlist.ts  # Toggle wishlist (guest & authenticated)
    │
    ├── stores/
    │   ├── auth.store.ts   # Zustand: user session & access token
    │   └── wishlist.store.ts # Zustand: guest wishlist (localStorage)
    │
    ├── lib/
    │   ├── axios.ts        # Axios instance + interceptor refresh token
    │   ├── auth.ts         # JWT sign/verify, token hashing
    │   ├── db.ts           # Prisma client instance
    │   ├── response.ts     # Helper HTTP response
    │   ├── validations/    # Zod schemas (auth, game, catalog, wishlist)
    │   └── ...
    │
    ├── repositories/       # Layer akses database (Prisma queries)
    ├── services/           # Layer business logic
    └── types/              # TypeScript type definitions
```
