import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function createClient() {
  const cookieStore = await cookies()

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const cf = await getCloudflareContext({ async: true })
    const env = cf.env as Record<string, string | undefined>

    supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl
    supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey
  } catch {
    // Ignore kalau bukan di Cloudflare runtime
  }

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        } catch {
          // Aman diabaikan kalau dipanggil dari Server Component
        }
      },
    },
  })
}