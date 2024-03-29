import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    DOMAIN: z.string().min(1),
    AFTER_SIGN_IN: z.string(),
    PROTOCOL: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    UPLOADTHING_SECRET: z.string().min(1),
    UPLOADTHING_APP_ID: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    OPENAI_KEY: z.string().min(1),
    REPLICATE_API_TOKEN: z.string().min(1),
    CHROMA_URL: z.string().min(1),
    NODE_ENV: z.string().optional(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {},
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DOMAIN: process.env.DOMAIN,
    AFTER_SIGN_IN: process.env.AFTER_SIGN_IN,
    PROTOCOL: process.env.PROTOCOL,
    DATABASE_URL: process.env.DATABASE_URL,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    OPENAI_KEY: process.env.OPENAI_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    CHROMA_URL: process.env.CHROMA_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
});
