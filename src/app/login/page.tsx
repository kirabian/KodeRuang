import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SubmitButton from '@/components/ui/SubmitButton';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  const login = async (formData: FormData) => {
    'use server';
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;
    
    const supabase = await createClient();

    let loginEmail = identifier;

    // Jika identifier bukan email (tidak mengandung @), cari email berdasarkan username
    if (!identifier.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

      if (profile?.email) {
        loginEmail = profile.email;
      } else {
        return redirect('/login?error=Username tidak ditemukan.');
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      // Terjemahkan error umum agar lebih user-friendly
      let message = error.message;
      if (message === 'Invalid login credentials') {
        message = 'Username atau Password salah.';
      }
      return redirect(`/login?error=${encodeURIComponent(message)}`);
    }

    return redirect('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-brand-surface border border-brand-border rounded-md p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-brand-text mb-2 text-center">Masuk ke KodeRuang</h1>
        <p className="text-brand-muted text-sm text-center mb-8">
          Gunakan username dan password kamu untuk masuk.
        </p>

        {error && (
          <div className="bg-brand-accent/10 text-brand-accent px-4 py-3 rounded-md text-sm mb-6 border border-brand-accent/20">
            {error}
          </div>
        )}

        <form action={login} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Username</label>
            <input 
              name="identifier"
              type="text" 
              required
              placeholder="Username kamu"
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text transition-all"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-brand-text">Password</label>
            </div>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text transition-all"
            />
          </div>
          <SubmitButton className="bg-brand-primary text-brand-surface hover:bg-brand-primary/90 mt-2 py-2.5">
            Masuk Sekarang
          </SubmitButton>
        </form>

        <p className="text-sm text-brand-muted text-center mt-8 pt-6 border-t border-brand-border">
          Belum punya akun? <Link href="/register" className="text-brand-primary font-medium hover:underline">Daftar komunitas</Link>
        </p>
      </div>
    </div>
  );
}
