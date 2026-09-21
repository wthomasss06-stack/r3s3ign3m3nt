#!/usr/bin/env bash
set -Eeuo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"
DUMP_FILE="${1:?Usage: DATABASE_URL=... $0 backup.dump}"

sha256sum --check "$DUMP_FILE.sha256"
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "$DUMP_FILE"
printf 'Restore completed from: %s\n' "$DUMP_FILE"
