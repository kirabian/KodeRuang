import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SubmitButton from '@/components/ui/SubmitButton';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  const login = async (formData: FormData) => {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    return redirect('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-brand-surface border border-brand-border rounded-md p-8">
        <h1 className="text-2xl font-bold text-brand-text mb-2 text-center">Masuk ke KodeRuang</h1>
        <p className="text-brand-muted text-sm text-center mb-8">
          Masuk untuk membagikan resource atau berdiskusi.
        </p>

        {error && (
          <div className="bg-brand-accent/10 text-brand-accent px-4 py-3 rounded-md text-sm mb-6 border border-brand-accent/20">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Email</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="developer@example.com"
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Password</label>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text"
            />
          </div>
          <SubmitButton className="bg-brand-primary text-brand-surface hover:bg-brand-primary/90 mt-2">
            Masuk
          </SubmitButton>
        </form>

        <p className="text-sm text-brand-muted text-center mt-6">
          Belum punya akun? <Link href="/register" className="text-brand-primary font-medium hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
