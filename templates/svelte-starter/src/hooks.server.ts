import type { Handle } from '@sveltejs/kit';
import { createDb } from '$lib/db/client';
import { resolveSession, SESSION_COOKIE } from '$lib/auth/sessions';

export const handle: Handle = async ({ event, resolve }) => {
  const env = event.platform?.env;
  if (env?.DB && env.HMAC_SECRET) {
    const db = createDb(env.DB);
    event.locals.user = await resolveSession(
      db,
      event.cookies.get(SESSION_COOKIE),
      env.HMAC_SECRET,
    );
  } else {
    event.locals.user = null;
  }
  return resolve(event);
};
