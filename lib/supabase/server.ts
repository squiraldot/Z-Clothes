import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabaseEnv();
  if (!url || !publishableKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie writes can fail in Server Components; middleware/auth flows
          // will handle session refresh when authentication is introduced.
        }
      },
    },
  });
}
