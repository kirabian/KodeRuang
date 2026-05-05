import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function createClient() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch (e: any) {
    // During static generation, cookies() might throw. 
    // We must rethrow if it's a Next.js dynamic error.
    if (e.digest === 'DYNAMIC_SERVER_USAGE') {
      throw e;
    }
    // Otherwise ignore or handle
  }

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Try to get from Cloudflare bindings if process.env is empty
  try {
    const cf = getCloudflareContext();
    if (cf?.env) {
      supabaseUrl = (cf.env as any).NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
      supabaseAnonKey = (cf.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
    }
  } catch (e) {
    // Ignore error when not in CF context
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    // Don't throw, just return a client that will fail on use to avoid crashing the whole worker on boot
    return createServerClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder',
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll() ?? []
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore?.set(name, value, options)
            )
          } catch {
            // Ignore cookie setting errors in server components
          }
        },
      },
    }
  )
}
