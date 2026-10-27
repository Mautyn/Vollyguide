#!/bin/bash
# Installs dependencies at the start of cloud sessions only.
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 1
[ -f package.json ] || exit 0

hashes=node_modules/.install_pkgs.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  if npm ci || npm install; then
    sha256sum scripts/install_pkgs.sh package.json package-lock.json > "$hashes" || rm -f "$hashes"
  fi
fi

npx playwright install chromium >/dev/null 2>&1 \
  || echo "Playwright browser not installed; E2E tests will run in CI only."
exit 0
