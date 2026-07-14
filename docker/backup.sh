#!/usr/bin/env sh
# SleepyWear backup script — read-only, no restore included.
# ⚠️  Never restore a backup to production without explicit approval.
#     Restoring overwrites all live orders, settings, and user data.
# Usage: sh docker/backup.sh [output-dir]
# Default output: /root/backups/sleepywear-YYYYMMDD-HHMMSS.dump (custom format)

set -e

COMPOSE_FILE="docker-compose.prod.yml"
OUTDIR="${1:-/root/backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_USER="${POSTGRES_USER:-sleepyweare}"
DB_NAME="${POSTGRES_DB:-sleepyweare}"

mkdir -p "$OUTDIR"

echo "[backup] backing up PostgreSQL..."
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom \
  > "$OUTDIR/sleepywear-$TIMESTAMP.dump"

echo "[backup] done: $OUTDIR/sleepywear-$TIMESTAMP.dump"

echo "[backup] backing up uploads volume..."
docker run --rm \
  -v uploads-data:/source \
  -v "$OUTDIR":/dest \
  alpine tar czf "/dest/uploads-$TIMESTAMP.tar.gz" -C /source .

echo "[backup] done: $OUTDIR/uploads-$TIMESTAMP.tar.gz"
