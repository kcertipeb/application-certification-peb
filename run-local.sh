#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"

echo "Démarrage de l'application PEB Terrain sur http://localhost:${PORT}"
echo "(Arrêt: Ctrl+C)"
python3 -m http.server "${PORT}" --bind 0.0.0.0
