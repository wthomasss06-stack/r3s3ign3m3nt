#!/usr/bin/env bash
set -Eeuo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTPUT="$BACKUP_DIR/qr-register-$STAMP.dump"

pg_dump "$DATABASE_URL" --format=custom --file="$OUTPUT"
sha256sum "$OUTPUT" > "$OUTPUT.sha256"
printf 'Backup created: %s\nChecksum: %s\n' "$OUTPUT" "$OUTPUT.sha256"
