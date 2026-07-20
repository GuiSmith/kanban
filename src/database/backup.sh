#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  log "ERRO: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório não encontrado: $1"
}

require_variable() {
  local variable_name="$1"

  if [[ -z "${!variable_name:-}" ]]; then
    fail "Variável obrigatória não definida: ${variable_name}"
  fi
}

[[ -f "${ENV_FILE}" ]] || fail "Arquivo de ambiente não encontrado: ${ENV_FILE}"

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

require_command docker
require_command zstd
require_command openssl

require_variable POSTGRES_HOST
require_variable POSTGRES_USER
require_variable POSTGRES_PASSWORD
require_variable POSTGRES_DB
require_variable BACKUP_PATH
require_variable BACKUP_ENCRYPTION_PASSWORD

if [[ -n "${BACKUP_RETENTION_DAYS:-}" && ! "${BACKUP_RETENTION_DAYS}" =~ ^[0-9]+$ ]]; then
  fail "BACKUP_RETENTION_DAYS deve ser um número inteiro maior ou igual a zero"
fi

if [[ "$(docker inspect --format '{{.State.Running}}' "${POSTGRES_HOST}" 2>/dev/null || true)" != "true" ]]; then
  fail "Container PostgreSQL não encontrado ou não está em execução: ${POSTGRES_HOST}"
fi

mkdir -p -- "${BACKUP_PATH}"
BACKUP_DIRECTORY="$(cd -- "${BACKUP_PATH}" && pwd -P)"

TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
BACKUP_NAME="${POSTGRES_DB}_${TIMESTAMP}.dump.zst.enc"
FINAL_PATH="${BACKUP_DIRECTORY}/${BACKUP_NAME}"
TEMP_PATH="$(mktemp "${BACKUP_DIRECTORY}/.${BACKUP_NAME}.tmp.XXXXXX")"

cleanup() {
  if [[ -n "${TEMP_PATH:-}" && -f "${TEMP_PATH}" ]]; then
    rm -f -- "${TEMP_PATH}"
  fi
}

trap cleanup EXIT
umask 077

log "Iniciando backup do banco ${POSTGRES_DB} no container ${POSTGRES_HOST}"

docker exec \
  --env PGPASSWORD="${POSTGRES_PASSWORD}" \
  "${POSTGRES_HOST}" \
  pg_dump \
  --username="${POSTGRES_USER}" \
  --dbname="${POSTGRES_DB}" \
  --format=custom \
  --compress=0 \
  --no-password \
  | zstd --stdout --quiet --threads=0 \
  | BACKUP_ENCRYPTION_PASSWORD="${BACKUP_ENCRYPTION_PASSWORD}" openssl enc \
      -aes-256-cbc \
      -salt \
      -pbkdf2 \
      -iter 200000 \
      -md sha256 \
      -pass env:BACKUP_ENCRYPTION_PASSWORD \
      -out "${TEMP_PATH}"

[[ -s "${TEMP_PATH}" ]] || fail "O arquivo de backup foi criado vazio"

chmod 600 "${TEMP_PATH}"
mv -- "${TEMP_PATH}" "${FINAL_PATH}"
TEMP_PATH=""

if [[ "${BACKUP_RETENTION_DAYS:-0}" -gt 0 ]]; then
  find "${BACKUP_DIRECTORY}" \
    -maxdepth 1 \
    -type f \
    -name "${POSTGRES_DB}_*.dump.zst.enc" \
    -mtime "+${BACKUP_RETENTION_DAYS}" \
    -delete
fi

log "Backup concluído: ${FINAL_PATH}"
