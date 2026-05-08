#!/usr/bin/env bash
#
# Deploy the FencePro static bundle to the HF Space at
# https://huggingface.co/spaces/Rsan0948/fencepro.
#
# Idempotent — re-runnable for every release. The HF Space must already
# exist (create it once via the HF web UI with the static SDK). See
# docs/deploy-hf.md for prerequisites and post-deploy verification.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

HF_SPACE_URL="https://huggingface.co/spaces/Rsan0948/fencepro"
DEPLOY_DIR=".hf-deploy"

# 1. Verify the HF CLI is installed and authenticated. Bail clearly if not.
if ! command -v huggingface-cli >/dev/null 2>&1; then
  echo "error: huggingface-cli not found on PATH." >&2
  echo "       install with: pip install -U \"huggingface_hub[cli]\"" >&2
  exit 1
fi

if ! huggingface-cli whoami >/dev/null 2>&1; then
  echo "error: huggingface-cli is not logged in." >&2
  echo "       run: huggingface-cli login" >&2
  exit 1
fi

# 2. Build the production static bundle into dist/.
echo "==> npm run build"
npm run build

# 3. Sync the local HF Space working clone. Reuse if present; reset to
#    origin/main so any local edits are wiped before we copy in the new
#    bundle. Clone fresh otherwise.
if [ -d "$DEPLOY_DIR/.git" ]; then
  echo "==> updating existing $DEPLOY_DIR clone"
  git -C "$DEPLOY_DIR" fetch origin
  git -C "$DEPLOY_DIR" reset --hard origin/main
else
  echo "==> cloning $HF_SPACE_URL into $DEPLOY_DIR"
  rm -rf "$DEPLOY_DIR"
  git clone "$HF_SPACE_URL" "$DEPLOY_DIR"
fi

# 4. Empty the working tree (preserve .git) so stale assets from a
#    previous build do not linger when filenames change.
echo "==> emptying $DEPLOY_DIR working tree"
( cd "$DEPLOY_DIR" && find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} + )

# 5. Copy the build output, then drop the HF Space README on top so the
#    landing-page metadata frontmatter wins.
echo "==> copying dist/ + deploy/hf/README.md"
cp -R dist/. "$DEPLOY_DIR/"
cp deploy/hf/README.md "$DEPLOY_DIR/README.md"

# 6. Commit + push if there is anything to ship. Tag the deploy commit
#    with the FencePro repo's short SHA so the HF history points back.
SHA="$(git rev-parse --short HEAD)"
cd "$DEPLOY_DIR"
git add -A
if git diff --cached --quiet; then
  echo "==> no changes to deploy"
else
  git commit -m "deploy: $SHA"
  git push
  echo "==> pushed deploy commit for $SHA"
fi

echo "==> done — visit $HF_SPACE_URL to verify"
