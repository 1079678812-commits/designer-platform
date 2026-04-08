#!/bin/bash
# Database backup script
# Usage: bash scripts/backup.sh
# For SQLite: copies the db file
# For PostgreSQL: uses pg_dump

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_URL="${DATABASE_URL:-file:./dev.db}"

mkdir -p "$BACKUP_DIR"

if [[ "$DB_URL" == file:* ]]; then
  # SQLite backup
  DB_PATH="${DB_URL#file:}"
  if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_DIR/dev_${TIMESTAMP}.db"
    echo "✅ SQLite backup: $BACKUP_DIR/dev_${TIMESTAMP}.db"
  else
    echo "❌ Database file not found: $DB_PATH"
    exit 1
  fi
elif [[ "$DB_URL" == postgres* ]]; then
  # PostgreSQL backup
  BACKUP_FILE="$BACKUP_DIR/pg_${TIMESTAMP}.sql.gz"
  pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"
  echo "✅ PostgreSQL backup: $BACKUP_FILE"
else
  echo "❌ Unsupported DATABASE_URL format"
  exit 1
fi

# Keep only last 30 backups
ls -t "$BACKUP_DIR"/*.db "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true

echo "📁 Total backups: $(ls "$BACKUP_DIR" | wc -l)"
