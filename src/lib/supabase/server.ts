import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Hardcoded fallbacks for reliability on Cloudflare
const FB_URL = 'https://qryzmmcwswxqmjtdphtm.supabase.co';
const FB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyeXptbWN3c3d4cW1qdGRwaHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTE2MzQsImV4cCI6MjA5MzQ4NzYzNH0.JVE3uyg0zwMfkmn2-WcjN1c7X5BbmgaQy-Okbzvd6Bc';

export async function createClient() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch (e: any) {
    if (e.digest === 'DYNAMIC_SERVER_USAGE') {
      throw e;
    }
  }

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FB_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FB_ANON;

  try {
    const cf = getCloudflareContext();
    if (cf?.env) {
      supabaseUrl = (cf.env as any).NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
      supabaseAnonKey = (cf.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
    }
  } catch (e) {
    // Not in CF
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
            // Ignore cookie errors
          }
        },
      },
    }
  )
}
