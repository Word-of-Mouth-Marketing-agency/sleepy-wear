# SleepyWear Deployment — CyberPanel / OpenLiteSpeed / AlmaLinux 9

## Overview

Deploy SleepyWear on a VPS running:
- **OS:** AlmaLinux 9.7
- **Panel:** CyberPanel (OpenLiteSpeed 1.8)
- **Docker:** must be installed (not present by default)
- **Domain:** sleepyweareg.com
- **SSL:** acme.sh (bundled with CyberPanel)

---

## 1. Prerequisites

- SSH access to `root@72.60.47.33` (port 2222)
- Domain `sleepyweareg.com` pointing to `72.60.47.33`
- GitHub repository (already created)
- Local project at `A:\Projects\sleepywear`

---

## 2. Push to GitHub

```bash
# On your local machine
cd A:\Projects\sleepywear

git remote add origin git@github.com:<your-org>/sleepywear.git
git push -u origin main
```

---

## 3. Clone on VPS

```bash
# On the VPS
ssh root@72.60.47.33 -p 2222

mkdir -p /var/www/sleepywear
cd /var/www/sleepywear
git clone git@github.com:<your-org>/sleepywear.git .
```

---

## 4. Install Docker Engine (AlmaLinux 9)

```bash
# On the VPS
dnf config-manager --add-repo https://download.docker.com/linux/almalinux/docker-ce.repo
dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker
docker --version
docker compose version
```

---

## 5. Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

---

## 6. Configure Environment

```bash
cd /var/www/sleepywear
cp .env.production.example .env.production
```

Edit `.env.production` and change secrets:
- `JWT_SECRET` — generate with `openssl rand -base64 32`
- `ADMIN_PASSWORD` — set a strong password
- `POSTGRES_PASSWORD` — set a strong password

---

## 7. Deploy with Docker Compose

```bash
cd /var/www/sleepywear
docker compose -f docker-compose.prod.yml up -d
```

Verify:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs
```

---

## 8. Run Database Migrations & Seed

```bash
# Run Prisma migrations inside the API container
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Seed initial data (admin user, etc.)
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

---

## 9. CyberPanel / OpenLiteSpeed Proxy Setup

### 9.1 Create the Website

1. Log in to **CyberPanel** admin panel
2. Go to **Websites → Create Website**
3. Domain: `sleepyweareg.com`
4. Package: select an existing one or create a new "sleepywear" package
5. PHP: not needed (we use Node.js)
6. Click **Create**

### 9.2 Add Reverse Proxy Rules

After the website is created, configure LiteSpeed virtual host:

1. Go to **Websites → List Websites → sleepyweareg.com**
2. Click **OpenLiteSpeed → Virtual Host**
3. Add the following **context / external app** rules:

#### Proxy configuration

| Context Path | Type    | Target                    |
|-------------|---------|---------------------------|
| `/`         | proxy   | `http://localhost:3001`   |
| `/api`      | proxy   | `http://localhost:4000`   |
| `/media`    | proxy   | `http://localhost:4000`   |

#### Details for each rule:

**External App (for Node.js proxy):**
- Type: **Web Proxy** (or "proxy" in LiteSpeed)
- Name: `sleepywear-node`
- Address: `http://localhost:3001`
- Max Connections: 100
- Keep-Alive Timeout: 30

**Context `/`:**
- URI: `/`
- Type: **proxy**
- Handler: `sleepywear-node`
- Add listening port: add `3001`

**External App (for API proxy):**
- Type: **Web Proxy**
- Name: `sleepywear-api`
- Address: `http://localhost:4000`
- Max Connections: 100

**Context `/api`:**
- URI: `/api`
- Type: **proxy**
- Handler: `sleepywear-api`

**Context `/media`:**
- URI: `/media`
- Type: **proxy**
- Handler: `sleepywear-api`

### 9.3 Graceful Restart

After adding all rules, restart LiteSpeed from CyberPanel or via:

```bash
systemctl restart lsws
```

---

## 10. SSL (acme.sh)

CyberPanel uses acme.sh for automatic SSL. To issue a certificate:

1. In CyberPanel, go to **SSL → Manage SSL**
2. Select `sleepyweareg.com`
3. Click **Issue SSL**

Or manually via acme.sh:

```bash
~/.acme.sh/acme.sh --issue -d sleepyweareg.com -d www.sleepyweareg.com \
  --webroot /home/sleepyweareg.com/public_html
```

SSL auto-renewal is handled by a cron job already configured by CyberPanel.

---

## 11. Service Management

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart a service
docker compose -f docker-compose.prod.yml restart api

# Rebuild and restart after code changes
docker compose -f docker-compose.prod.yml up -d --build

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: destroys data)
docker compose -f docker-compose.prod.yml down -v
```

---

## 12. Backups

### PostgreSQL

```bash
# Backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U sleepyweare sleepyweare > /root/backups/sleepywear-$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U sleepyweare -d sleepyweare
```

### Uploads

```bash
# Backup uploads volume
docker run --rm -v uploads-data:/source -v /root/backups:/dest alpine \
  tar czf /dest/uploads-$(date +%Y%m%d).tar.gz -C /source .

# Restore uploads
docker run --rm -v uploads-data:/dest -v /root/backups:/source alpine \
  tar xzf /source/uploads-20260101.tar.gz -C /dest
```

### Cron job for nightly backups

```bash
# Add to crontab (runs at 3 AM daily)
0 3 * * * docker compose -f /var/www/sleepywear/docker-compose.prod.yml exec -T postgres pg_dump -U sleepyweare sleepyweare > /root/backups/sleepywear-$(date +\%Y\%m\%d).sql
```

---

## 13. Production Port Reference

| Service       | Host Port | Container Port | Notes                          |
|---------------|-----------|----------------|--------------------------------|
| Web (Next.js) | 3001      | 3000           | Avoids conflict with Jelly     |
| API (NestJS)  | 4000      | 4000           |                                |
| PostgreSQL    | 5433      | 5432           | Avoids conflict with system PG |
| Redis         | 6380      | 6379           | Avoids conflict with system RD |

---

## 14. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `port is already allocated` | Port conflict | Check ports with `ss -tulpn \| grep -E '3001|4000|5433|6380'` |
| API can't connect to DB | Wrong DATABASE_URL | Ensure `.env.production` uses `postgres:5432` not `localhost` |
| Web shows blank page | Build-time NEXT_PUBLIC_API_URL missing | Rebuild with `docker compose up -d --build` |
| 502 Bad Gateway from LiteSpeed | Proxy target not reachable | Check `docker compose ps` — containers must be running |
| Media files not loading | Upload path mismatch | Check `UPLOAD_PATH` in `.env.production` matches `/app/uploads` |
