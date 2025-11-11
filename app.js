const { App, LogLevel } = require('@slack/bolt');
const config = require('./config');
const app = new App({
  token: config.botToken,
  signingSecret: config.signingSecret,
  appToken: config.appToken,
  socketMode: true,
  logLevel: LogLevel.INFO,
});

const LINK_PATTERN =
  /(https?:\/\/(?:chat\.whatsapp\.com|wa\.me|meet\.google\.com|(?:[a-z0-9.-]+\.)?zoom\.us|teams\.microsoft\.com)[^\s]*)/gi;
const recentLinks = new Set();
const MAX_CACHE_SIZE = 200;
/**
Extract first relevant link
@param {string} text
*/
function extractRelevantLink(text) {
  if (!text) return null;
  const matches = text.match(LINK_PATTERN);
  return matches ? matches[0] : null;
}

async function getMessageLink(client, channel, ts) {
  const res = await client.chat.getPermalink({ channel, message_ts: ts });
  return res.permalink;
}

function formatForwardMessage({ link, messageLink }) {
  return `:link: *Link detected*
• *Link:* ${link}
• *Message:* ${messageLink}`;
}

app.event('message', async ({ event, client }) => {
  try {
    if (!event.text || event.subtype === 'bot_message') return;
    const foundLink = extractRelevantLink(event.text);
    if (!foundLink) return;
  
    if (recentLinks.has(foundLink)) return;
  
    const messagePermalink = await getMessageLink(client, event.channel, event.ts);
   
    await client.chat.postMessage({
      channel: config.targetChannel,
      text: formatForwardMessage({
        link: foundLink,
        messageLink: messagePermalink,
      }),
    });
    console.log(`Forwarded link: ${foundLink}`);
   
    recentLinks.add(foundLink);
    if (recentLinks.size > MAX_CACHE_SIZE) {
      const [oldest] = recentLinks;
      recentLinks.delete(oldest);
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
});
(async () => {
  await app.start(config.port || 3000);
  console.log(' Link Tracking Bot is running...');
})();