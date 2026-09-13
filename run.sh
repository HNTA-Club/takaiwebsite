#!/usr/bin/env bash
set -euo pipefail

cd /home/auto-deploy/takaiwebsite

echo "=== 1. Building image in background (old container stays live) ==="
docker compose build web

echo "=== 2. Recreating container instantly ==="
docker compose up -d --no-deps web

echo "=== 3. Cleaning up old images ==="
docker image prune -f
