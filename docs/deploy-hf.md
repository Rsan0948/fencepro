# Deploying to Hugging Face Spaces

FencePro ships as a static SPA. The live demo runs on a HF Space at
[huggingface.co/spaces/Rsan0948/FencePro](https://huggingface.co/spaces/Rsan0948/FencePro)
using HF's [static SDK](https://huggingface.co/docs/hub/spaces-sdks-static):
HF serves the repo root as a static site, no server runtime, no
container.

The deploy is a manual operator step, not a CI workflow. One command:

```bash
npm run deploy:hf
```

## Prerequisites

You only need to do these once.

### 1. The HF Space exists

Create it manually via the HF web UI before the first deploy.

- Go to [huggingface.co/new-space](https://huggingface.co/new-space).
- **Owner:** `Rsan0948`. **Space name:** `FencePro`.
- **SDK:** Static. (Not Docker, not Streamlit, not Gradio.)
- License: Apache 2.0.
- Public visibility.

The script clones from
`https://huggingface.co/spaces/Rsan0948/FencePro` — if the Space does
not exist, the clone fails before anything else runs.

### 2. The Hugging Face CLI is installed and logged in

```bash
pip install -U "huggingface_hub[cli]"
huggingface-cli login
```

Paste a User Access Token (with `write` scope) from
[huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
when prompted. The script verifies `huggingface-cli whoami` returns 0
before doing any work and bails with a clear error otherwise. Auth is
your local concern; nothing about the token is committed to either repo.

### 3. Working tree is clean

The deploy commit message tags the HF deploy with the short SHA of
FencePro's `HEAD` so the HF history points back at a real commit. Make
sure `git status` is clean and you are on the commit you want to ship.

## What the script does

`scripts/deploy-hf.sh` is idempotent. Run it as often as you like.

1. Verifies `huggingface-cli` is installed and logged in.
2. Runs `npm run build` to produce `dist/` with `index.html`,
   `_redirects` (for SPA deep-link fallback), and the asset bundles.
3. Clones the HF Space into `.hf-deploy/` (gitignored) on first run, or
   `git fetch && reset --hard origin/main` on subsequent runs.
4. Empties the working tree (preserving `.git`) so stale assets from a
   previous build do not linger when filenames change.
5. Copies `dist/*` into the HF clone, then `cp deploy/hf/README.md
README.md` over the top so the landing-page metadata frontmatter
   wins (HF reads that for the Space's title, emoji, theme colors).
6. If anything changed, `git commit -m "deploy: <fencepro-sha>" &&
git push` to HF.

The HF Space rebuilds itself on every push.

## Post-deploy verification

After the script reports `==> done`:

- [ ] Open
      [huggingface.co/spaces/Rsan0948/FencePro](https://huggingface.co/spaces/Rsan0948/FencePro)
      — title, emoji, and theme colors come from
      `deploy/hf/README.md`'s frontmatter. The Space should rebuild
      within ~30s.
- [ ] Click into the demo. The dashboard loads with the default seed
      projects (Acme Fence Co. branding).
- [ ] Drive the chat once: New Estimate → county → fence type →
      dimensions → crew → fill in name + email → Send Estimate. Toast
      surfaces, preview opens, deposit link goes to
      `/checkout/cs_mock_*`.
- [ ] **Refresh on a `/checkout/cs_mock_*` URL.** Without
      `_redirects`, HF returns 404. With it, `index.html` serves and
      the SPA renders MockCheckout's expired panel (the in-memory
      session was lost on refresh — that is expected and not a deploy
      bug).
- [ ] Open the HF Space's "Files" tab. The committed tree is the
      contents of `dist/` plus the HF README — no `src/`, no
      `node_modules`, no `.helicops/`.

## Troubleshooting

**`error: huggingface-cli is not logged in`** — run
`huggingface-cli login`.

**`fatal: Authentication failed`** during `git push` — the HF token
has expired or lacks `write` scope. Regenerate at
[huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
and re-run `huggingface-cli login`.

**Space shows the right files but a blank page** — open the browser
devtools console. Most likely a Vite asset-path issue; verify
`vite.config.ts` does not set a non-`/` `base`. The default works for
HF root-served static.

**Deep-link refresh 404s** — confirm `dist/_redirects` exists after
build and was copied into the HF clone. The file is generated from
`public/_redirects`; Vite copies `public/` contents verbatim into
`dist/` on build.

## Why manual instead of CI

Per-release manual deploys are cheap (one command, one minute) and the
operator chooses when to flip the live demo. A GitHub Actions
auto-deploy workflow would need an HF token committed as a repository
secret, and would deploy every merge to `main` — both undesirable for
a portfolio template where the orchestrator wants explicit control
over what reviewers see at any given moment.
