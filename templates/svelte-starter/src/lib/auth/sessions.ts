import { eq } from 'drizzle-orm';
import type { DB } from '../db/client';
import { sessions, users } from '../db/schema';
import { generateToken, hashToken, signHmac, verifyHmac } from './token';

export type SessionUser = typeof users.$inferSelect;

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RENEWAL_MS = 24 * 60 * 60 * 1000;
export const SESSION_COOKIE = 'session';

export async function createSession(db: DB, userId: string, secret: string): Promise<string> {
  const token = generateToken();
  const hash = await hashToken(token);
  const now = Date.now();
  await db.insert(sessions).values({
    id: hash,
    userId,
    expiresAt: now + SESSION_TTL_MS,
    lastSeenAt: now,
  });
  const sig = await signHmac(secret, token);
  return `${token}.${sig}`;
}

export async function resolveSession(
  db: DB,
  cookie: string | null | undefined,
  secret: string
): Promise<SessionUser | null> {
  if (!cookie) return null;
  const dot = cookie.lastIndexOf('.');
  if (dot === -1) return null;
  const token = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  if (!(await verifyHmac(secret, token, sig))) return null;

  const hash = await hashToken(token);
  const now = Date.now();

  const row = await db.query.sessions.findFirst({
    where: eq(sessions.id, hash),
    with: { user: true },
  });

  if (!row || row.expiresAt < now) {
    if (row) await db.delete(sessions).where(eq(sessions.id, hash));
    return null;
  }

  if (now - row.lastSeenAt > RENEWAL_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: now + SESSION_TTL_MS, lastSeenAt: now })
      .where(eq(sessions.id, hash));
  }

  return row.user;
}

export async function destroySession(
  db: DB,
  cookie: string | null | undefined,
  secret: string
): Promise<void> {
  if (!cookie) return;
  const dot = cookie.lastIndexOf('.');
  if (dot === -1) return;
  const token = cookie.slice(0, dot);
  if (!(await verifyHmac(secret, token, cookie.slice(dot + 1)))) return;
  await db.delete(sessions).where(eq(sessions.id, await hashToken(token)));
}
