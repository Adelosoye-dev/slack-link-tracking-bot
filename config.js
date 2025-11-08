require('dotenv').config();

module.exports = {
  botToken: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  targetChannel: process.env.TARGET_CHANNEL_ID,
  port: process.env.PORT || 3000
};