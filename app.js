const { App } = require('@slack/bolt');
const config = require('./config');

// Initialize the Bolt app
const app = new App({
  token: config.botToken,
  signingSecret: config.signingSecret,
  appToken: config.appToken,
  socketMode: true
});

// Helper function to detect links
function extractLink(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex);
  return links ? links[0] : null;
}

// Listen for all messages
app.event('message', async ({ event, client }) => {
  // Ignore bot messages
  if (event.subtype === 'bot_message') return;

  const messageText = event.text;
  const foundLink = extractLink(messageText);

  if (!foundLink) return; // no link found

  try {
    // Get user info
    const userInfo = await client.users.info({ user: event.user });

    const userName = userInfo.user.real_name || userInfo.user.name;
    const userEmail = userInfo.user.profile.email || "Unknown email";
    const channelId = event.channel;
    const timestamp = new Date().toLocaleString();

    // Format the tracking message
    const formattedMessage = `
🔗 Link Detected
• Link: ${foundLink}
• By: ${userName} (${userEmail})
• Original Message: "${messageText}"
• Channel: <#${channelId}>
• Time: ${timestamp}
    `;

    // Forward to tracking channel
    await client.chat.postMessage({
      channel: config.targetChannel,
      text: formattedMessage
    });

    console.log(`Logged link from ${userName}: ${foundLink}`);
  } catch (err) {
    console.error("❌ Error logging link:", err);
  }
});

// Start the app
(async () => {
  await app.start(config.port);
  console.log("✅ Link Tracking Bot is Running...");
})();