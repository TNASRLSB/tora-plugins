import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user && !url.pathname.startsWith('/auth')) {
    throw redirect(302, '/auth/login');
  }
  return { user: locals.user };
};
