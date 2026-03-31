#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  if [[ -n "${PID_OLLAMA:-}" ]]; then
    kill "${PID_OLLAMA}" 2>/dev/null || true
  fi
  if [[ -n "${PID_NGROK_BACKEND:-}" ]]; then
    kill "${PID_NGROK_BACKEND}" 2>/dev/null || true
  fi
  if [[ -n "${PID_BACKEND_APP:-}" ]]; then
    kill "${PID_BACKEND_APP}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "[backend] API baslatiliyor: localhost:3001"
(cd backend && npm run dev) &
PID_BACKEND_APP=$!

sleep 2

echo "[ngrok] Ollama tunnel baslatiliyor: localhost:11434"
ngrok http 11434 --host-header="localhost:11434" &
PID_OLLAMA=$!

echo "[ngrok] Backend tunnel baslatiliyor: ollama.ngrok.app -> localhost:3001"
ngrok http --url=ollama.ngrok.app 3001 &
PID_NGROK_BACKEND=$!

echo "[ngrok] Backend + tunneller calisiyor. Cikmak icin Ctrl+C."
wait
