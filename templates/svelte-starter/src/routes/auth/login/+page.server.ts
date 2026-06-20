import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createDb } from '$lib/db/client';
import { generateToken, hashToken } from '$lib/auth/token';
import { sendMagicLink } from '$lib/auth/email';
import { magicLinkTokens, users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

const TOKEN_TTL_MS = 10 * 60 * 1000;

export const actions: Actions = {
  default: async ({ request, platform, url }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    if (!email || !email.includes('@')) return fail(400, { error: 'Email non valida.' });

    const db = createDb(platform!.env.DB);
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    // Always return ok to avoid email enumeration
    if (!user) return { sent: true };

    const token = generateToken();
    const tokenHash = await hashToken(token);
    await db.insert(magicLinkTokens).values({
      tokenHash,
      userId: user.id,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });

    const baseUrl = platform?.env?.PUBLIC_URL ?? url.origin;
    const link = `${baseUrl}/auth/verify?token=${token}`;

    if (platform?.env?.RESEND_API_KEY) {
      await sendMagicLink({
        apiKey: platform.env.RESEND_API_KEY,
        from: platform.env.RESEND_FROM ?? 'noreply@example.com',
        to: email,
        link,
        appName: url.hostname,
      });
    } else {
      console.log(`[DEV] Magic link per ${email}: ${link}`);
    }

    return { sent: true };
  },
};
