import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function createClient() {
  const cookieStore = await cookies()
  
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const { env } = getCloudflareContext();
    if (env) {
      supabaseUrl = (env as any).NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
      supabaseAnonKey = (env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
    }
  } catch (e) {
    // Not in Cloudflare context
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing! Check Cloudflare Dashboard Settings.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
