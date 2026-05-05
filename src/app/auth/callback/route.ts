import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalDevelopment = process.env.NODE_ENV === 'development';
      if (isLocalDevelopment) {
        // we can be sure that origin is localhost
        return NextResponse.redirect(`${origin}${next}?verified=true`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}?verified=true`);
      } else {
        return NextResponse.redirect(`${origin}${next}?verified=true`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
