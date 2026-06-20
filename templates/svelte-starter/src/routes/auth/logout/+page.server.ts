import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createDb } from '$lib/db/client';
import { destroySession, SESSION_COOKIE } from '$lib/auth/sessions';

export const actions: Actions = {
  default: async ({ platform, cookies }) => {
    const cookie = cookies.get(SESSION_COOKIE);
    const secret = platform?.env?.HMAC_SECRET;
    if (cookie && platform?.env?.DB && secret) {
      const db = createDb(platform.env.DB);
      await destroySession(db, cookie, secret);
    }
    cookies.delete(SESSION_COOKIE, { path: '/' });
    throw redirect(302, '/auth/login');
  },
};
