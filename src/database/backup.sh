#!/bin/bash
set -euao pipefail
source .env
set +a

BKP_DIR="${1:?Missing BKP_DIR as an argument}"

docker exec kanban-db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BKP_DIR/bkp.sql"
