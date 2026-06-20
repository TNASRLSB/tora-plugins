/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface Locals {
      user: import('$lib/auth/sessions').SessionUser | null;
    }
    interface Platform {
      env: {
        DB: D1Database;
        HMAC_SECRET: string;
        RESEND_API_KEY?: string;
        RESEND_FROM?: string;
        PUBLIC_URL: string;
      };
    }
  }
}

export {};
