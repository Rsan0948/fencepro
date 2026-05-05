# FencePro

Vertical SaaS prototype for Colorado fence contractors. Dashboard, project tracking,
chat-driven estimate builder, and invoice generation.

## Quick start

```bash
npm install
npm run dev
```

Or double-click `launch.command` in Finder.

The dev server runs on `http://localhost:3001`.

## Status

Prototype with mock data. The chat-driven estimate flow is currently scripted.
Next step: replace the scripted `STAGES` with LLM-driven natural-language extraction
(dynamic by default, scripted fallback when no API key is configured).
