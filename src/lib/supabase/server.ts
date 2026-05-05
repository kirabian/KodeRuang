import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCloudflareContext } from '@opennextjs/cloudflare'

function cleanEnvValue(value?: string) {
  if (!value) return undefined

  return value
    .trim()
    .replace(/^NEXT_PUBLIC_SUPABASE_URL=/, '')
    .replace(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/, '')
    .replace(/^["']|["']$/g, '')
    .trim()
}

function isValidHttpUrl(value?: string): value is string {
  if (!value) return false

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  let supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
  let supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  try {
    const cf = await getCloudflareContext({ async: true })
    const env = cf.env as Record<string, string | undefined>

    supabaseUrl = cleanEnvValue(env.NEXT_PUBLIC_SUPABASE_URL) || supabaseUrl
    supabaseAnonKey = cleanEnvValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || supabaseAnonKey
  } catch {
    // Ignore kalau bukan di Cloudflare runtime
  }

  if (!isValidHttpUrl(supabaseUrl)) {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const validSupabaseUrl: string = supabaseUrl
  const validSupabaseAnonKey: string = supabaseAnonKey

  return createServerClient(validSupabaseUrl, validSupabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },

      setAll(
        cookiesToSet: {
          name: string
          value: string
          options: CookieOptions
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Aman diabaikan kalau dipanggil dari Server Component
        }
      },
    },
  })
}