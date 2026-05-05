import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-text mb-6">Profil Saya</h1>
      
      <div className="bg-brand-surface border border-brand-border rounded-md p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-brand-bg border border-brand-border rounded-full flex items-center justify-center text-3xl font-bold text-brand-primary">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-text">{profile?.full_name || 'Developer'}</h2>
            <p className="text-brand-muted">@{profile?.username || 'user'}</p>
            <p className="text-sm text-brand-muted mt-1">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-brand-text border-b border-brand-border pb-2">Resource Saya</h3>
          <p className="text-brand-muted text-sm">Belum ada resource yang di-submit.</p>
        </div>
      </div>
    </div>
  );
}
