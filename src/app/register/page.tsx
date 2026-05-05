import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SubmitButton from '@/components/ui/SubmitButton';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const { error, message } = await searchParams;

  const register = async (formData: FormData) => {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const fullName = formData.get('fullName') as string;
    
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        }
      }
    });

    if (error) {
      return redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }

    return redirect('/register?message=Cek+email+anda+untuk+verifikasi+akun.');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-brand-surface border border-brand-border rounded-md p-8">
        <h1 className="text-2xl font-bold text-brand-text mb-2 text-center">Daftar Akun</h1>
        <p className="text-brand-muted text-sm text-center mb-8">
          Bergabunglah dengan ribuan developer lainnya.
        </p>

        {error && (
          <div className="bg-brand-accent/10 text-brand-accent px-4 py-3 rounded-md text-sm mb-6 border border-brand-accent/20">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-brand-primary/10 text-brand-primary px-4 py-3 rounded-md text-sm mb-6 border border-brand-primary/20">
            {message}
          </div>
        )}

        <form action={register} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Username</label>
            <input 
              name="username"
              type="text" 
              required
              placeholder="budi_dev"
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Nama Lengkap</label>
            <input 
              name="fullName"
              type="text" 
              required
              placeholder="Budi Santoso"
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text"
            />
          </div>
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
            Daftar Sekarang
          </SubmitButton>
        </form>

        <p className="text-sm text-brand-muted text-center mt-6">
          Sudah punya akun? <Link href="/login" className="text-brand-primary font-medium hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
