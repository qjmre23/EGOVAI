import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const configSchema = z.object({
  ABSK_API_KEY: z.string().optional(),
  ABSK_BASE_URL: z.string().url().default('https://bedrock-mantle.us-east-1.api.aws/v1'),
  ABSK_MODEL: z.string().default('qwen.qwen3-vl-235b-a22b-instruct'),
  WEB_ORIGIN: z.string().default('http://localhost:5000'),
  PORT: z.coerce.number().int().positive().default(3001),
});

export const config = configSchema.parse(process.env);
