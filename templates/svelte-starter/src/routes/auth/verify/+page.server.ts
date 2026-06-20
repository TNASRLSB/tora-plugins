import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/db/client';
import { hashToken } from '$lib/auth/token';
import { createSession, SESSION_COOKIE } from '$lib/auth/sessions';
import { magicLinkTokens } from '$lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
  const token = url.searchParams.get('token');
  if (!token) throw error(400, 'Token mancante.');

  const db = createDb(platform!.env.DB);
  const tokenHash = await hashToken(token);
  const now = Date.now();

  const row = await db.query.magicLinkTokens.findFirst({
    where: and(eq(magicLinkTokens.tokenHash, tokenHash), isNull(magicLinkTokens.usedAt)),
    with: { user: true },
  });

  if (!row || row.expiresAt < now) throw error(400, 'Link non valido o scaduto.');

  // Consume token — second request won't find it due to isNull(usedAt) check
  await db
    .update(magicLinkTokens)
    .set({ usedAt: now })
    .where(and(eq(magicLinkTokens.tokenHash, tokenHash), isNull(magicLinkTokens.usedAt)));

  const secret = platform?.env?.HMAC_SECRET;
  if (!secret) throw error(500, 'HMAC_SECRET is not configured');
  const sessionCookie = await createSession(db, row.userId, secret);

  cookies.set(SESSION_COOKIE, sessionCookie, {
    path: '/',
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });

  throw redirect(302, '/');
};
