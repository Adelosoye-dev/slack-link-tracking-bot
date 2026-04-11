# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Slack bot (TypeScript + Bolt framework) that monitors channels for links (WhatsApp, Google Meet, Zoom, Microsoft Teams) and forwards them to a designated tracking channel. Uses Socket Mode for connectivity.

## Commands

- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run the compiled bot (`node dist/app.js`)
- `pnpm dev` — run directly via ts-node
- No test suite configured yet

## Architecture

- **app.ts** — Entry point. Sets up Bolt app, listens for `message` events, extracts links via regex (`LINK_PATTERN`), deduplicates with an in-memory Set (`recentLinks`, max 200), fetches sender info, and posts formatted messages to the target channel.
- **config.ts** — Validates env vars with zod schema, exports typed config. Required: `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`, `TARGET_CHANNEL_ID`. Optional: `PORT` (default 3000).
- **logger.ts** — Winston logger with console transport, configurable via `LOG_LEVEL` env var.

## Environment Variables

Required in `.env`: `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`, `TARGET_CHANNEL_ID`. Optional: `PORT` (default 3000), `LOG_LEVEL` (default info). Validated at startup via zod — app crashes immediately on missing required vars.

## Deployment

CI/CD via GitHub Actions (`.github/workflows/deploy.yml`). On merged PR to `main`, deploys via SSH and restarts with `pm2`. Uses pnpm.
