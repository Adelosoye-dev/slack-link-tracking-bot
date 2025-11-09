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
  /(https?:\/\/(?:chat\.whatsapp\.com|wa\.me|meet\.google\.com|zoom\.us|teams\.microsoft\.com)[^\s]*)/gi;

const recentLinks = new Set();
const MAX_CACHE_SIZE = 200; 
/**
 * Extracts the first relevant meeting/messaging link from text.
 * @param {string} text
 * @returns {string|null}
 */
function extractRelevantLink(text) {
  if (!text) return null;
  const matches = text.match(LINK_PATTERN);
  return matches ? matches[0] : null;
}

/**
 * Fetches user details safely.
 * @param {object} client
 * @param {string} userId
 */
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
    console.warn(`Could not fetch user info for ${userId}:`, error.data?.error || error.message);
    return { name: 'Unknown User', email: 'Unknown Email', isBot: false };
  }
}

function formatForwardMessage({ link, userName, userEmail, text, channelId, timestamp }) {
  return `
🔗 *Link Detected!*
• *Link:* ${link}
• *Shared By:* ${userName} (${userEmail})
• *Message:* "${text}"
• *Channel:* <#${channelId}>
• *Time:* ${timestamp}
`;
}

app.event('message', async ({ event, client }) => {
  try {

    if (!event.text || event.subtype === 'bot_message') return;

    const foundLink = extractRelevantLink(event.text);
    if (!foundLink) return;

    if (recentLinks.has(foundLink)) {
      console.log(`Duplicate link ignored: ${foundLink}`);
      return;
    }

    const { name: userName, email: userEmail, isBot } = await getUserDetails(client, event.user);

    if (isBot) {
      console.log(`Ignored link from bot user: ${userName}`);
      return;
    }

    const formattedMessage = formatForwardMessage({
      link: foundLink,
      userName,
      userEmail,
      text: event.text,
      channelId: event.channel,
      timestamp: new Date().toLocaleString(),
    });

    await client.chat.postMessage({
      channel: config.targetChannel,
      text: formattedMessage,
    });

    console.log(`Forwarded link from ${userName}: ${foundLink}`);

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
  console.log('Link Tracking Bot is running...');
})();
