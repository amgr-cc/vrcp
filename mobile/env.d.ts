// env.d.ts 
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_DISCORD_WEBHOOK_URL: string;
    }
  }
}

export {};