# Slack Link Tracking Bot

A Slack bot built with Node.js and [Bolt](https://slack.dev/bolt/) that automatically detects links in messages and forwards them to a dedicated tracking channel.

---

## Features

- Detects links in messages across channels where the bot is invited.
- Logs link information including:
  - User who posted it
  - User email (if available)
  - Original message
  - Channel
  - Timestamp
- Forwards the formatted log to a designated tracking channel.
- Lightweight and easy to deploy locally or on a server.

---

## Prerequisites

- Node.js v20+
- Slack workspace and Slack App with the following:
  - Bot token (`xoxb-...`)
  - App-level token for Socket Mode (`xapp-...`)
  - Signing secret

---

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/adelosoye-dev/slack-link-bot.git
cd slack-link-bot

2. **Install dependencies**
3. **Create a .env file in the root and add your credencials**
- SLACK_BOT_TOKEN=xoxb-your-bot-token
-SLACK_APP_TOKEN=xapp-your-app-level-token
-SLACK_SIGNING_SECRET=your-signing-secret
-TARGET_CHANNEL_ID=C0123456789
-PORT=3000
to be continued....


