import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  SLACK_BOT_TOKEN: z.string(),
  SLACK_APP_TOKEN: z.string(),
  SLACK_SIGNING_SECRET: z.string(),
  TARGET_CHANNEL_ID: z.string(),
  PORT: z.coerce.number().default(3000),
});

const env = envSchema.parse(process.env);

const config = {
  botToken: env.SLACK_BOT_TOKEN,
  appToken: env.SLACK_APP_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
  targetChannel: env.TARGET_CHANNEL_ID,
  port: env.PORT,
};

export default config;
