const { App, LogLevel } = require('@slack/bolt');
const config = require('./config');
const logger = require('./logger');

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
  const cleanedText = text.replace(/<([^>|]+)(?:\|[^>]+)?>/g, '$1');
  const matches = cleanedText.match(LINK_PATTERN);
  return matches ? matches[0] : null;
}

function formatForwardMessage({ link, message, sender, channel }) {
  return `
          :link: *Link detected*
          • *Link:* ${link}
          • *Message:* ${message}
          • *Sender:* ${sender}
          • *Channel:* <#${channel}>
`;
}

async function getUserDetails(client, userId) {
  try {
    const { user } = await client.users.info({ user: userId });
    const profile = user?.profile || {};
    return {
      name: profile.real_name || user.real_name || user.name || 'Unnamed User',
      email: profile.email || 'No email available',
      isBot: user.is_bot || false,
    };
  } catch (error) {
    logger.warn(`Could not fetch user info for ${userId}:`, error.data?.error || error.message);
    return { name: 'Unknown User', email: 'Unknown Email', isBot: false };
  }
}

app.event('message', async ({ event, client }) => {
  try {
    if (!event.text || event.subtype === 'bot_message') return;
    const foundLink = extractRelevantLink(event.text);
    if (!foundLink) return;

    if (recentLinks.has(foundLink)) return;

    const { name: userName } = await getUserDetails(client, event.user);

    await client.chat.postMessage({
      channel: config.targetChannel,
      text: formatForwardMessage({
        link: foundLink,
        message: event.text,
        sender: userName,
        channel: event.channel,
      }),
    });
    logger.info(`Forwarded link: ${foundLink}`);

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
  logger.info(' Link Tracking Bot is running...');
})();
