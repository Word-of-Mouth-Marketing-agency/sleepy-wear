# SleepyWear

Arabic-first custom e-commerce foundation for `sleepyweareg.com`.

## Stack

- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS, RTL by default
- `apps/api`: NestJS REST API with validation, CORS, `/api` prefix, admin guards, orders, coupons, static pages, and Paymob payments
- `packages/database`: Prisma schema, PostgreSQL models, seed data
- `packages/shared`: shared types/constants for web and API
- Docker Compose: PostgreSQL, Redis, API, web
- Local uploads under `/uploads`, exposed later as `/media`

## Setup

```bash
pnpm install
copy .env.example .env
```

Start local infrastructure:

```bash
docker compose up postgres redis
```

Run Prisma commands from the project root after `.env` exists:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Run apps:

```bash
pnpm --filter @sleepywear/api dev
pnpm --filter @sleepywear/web dev
```

Web runs on `http://localhost:3000`.
API runs on `http://localhost:4000/api`.
Health check: `http://localhost:4000/api/health`.
PostgreSQL is published on `127.0.0.1:5433` for local Prisma commands to avoid conflicts with any host PostgreSQL service on `5432`.

## Docker

Create `.env` from `.env.example`, then run:

```bash
docker compose up --build
```

Persistent Docker volumes are configured for PostgreSQL data and uploads.

## Project Structure

```text
apps/
  web/     Next.js storefront and starter admin pages
  api/     NestJS API modules, DTOs, guards, upload service
packages/
  database/ Prisma schema and seed script
  shared/   common commerce types and constants
docker/
  nginx/    placeholder production proxy config
uploads/    local media root ignored by Git except .gitkeep
```

## Notes

- Product stock lives on `ProductVariant`, not `Product`.
- `OrderItem` stores product, variant, SKU, price, and quantity snapshots.
- Uploads are stored locally and exposed through `/media`.
- Admin authentication uses JWT guards. Keep `JWT_SECRET` strong in production.
- Paymob Unified Checkout is supported alongside cash on delivery. Do not expose Paymob secret keys to the web app.

## Useful Commands

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Production Notes

For production deploys, run migrations only:

```bash
docker compose -f docker-compose.prod.yml exec api sh -lc "cd /app && pnpm --filter @sleepywear/database exec prisma migrate deploy"
```

Do not run `pnpm db:seed`, EasyOrders importers, database restores, or volume deletion in production unless explicitly planned with a fresh backup.

## Recommended Next Steps

1. Add real Prisma services to the Nest modules.
2. Implement admin authentication and role checks.
3. Add product image upload handling with Sharp.
4. Build product/admin UI once API contracts are stable.
5. Add checkout validation, order totals, and inventory reservation rules.
