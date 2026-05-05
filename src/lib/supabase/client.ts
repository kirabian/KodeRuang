import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qryzmmcwswxqmjtdphtm.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyeXptbWN3c3d4cW1qdGRwaHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTE2MzQsImV4cCI6MjA5MzQ4NzYzNH0.JVE3uyg0zwMfkmn2-WcjN1c7X5BbmgaQy-Okbzvd6Bc';

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
