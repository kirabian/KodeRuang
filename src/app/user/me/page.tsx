import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTierFromPoints } from '@/lib/utils/tiers';
import { Award, Shield, Link as LinkIcon } from 'lucide-react';

export default async function MyProfile() {
  try {
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

    const userTier = getTierFromPoints(profile?.reputation || 0);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-text mb-6">Profil Saya</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-brand-surface border border-brand-border rounded-md p-8 shadow-sm">
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
                <h3 className="font-bold text-brand-text border-b border-brand-border pb-2 flex items-center gap-2">
                  <LinkIcon size={18} className="text-brand-primary" />
                  Resource Saya
                </h3>
                <p className="text-brand-muted text-sm">Belum ada resource yang di-submit.</p>
              </div>
            </div>
          </div>

          {/* Ranking Sidebar */}
          <div className="space-y-6">
            <div className="bg-brand-surface border border-brand-border rounded-md p-6 shadow-sm">
              <h3 className="font-bold text-brand-text mb-4 flex items-center gap-2">
                <Award size={18} className="text-yellow-500" />
                Status Kurator
              </h3>
              
              <div className="text-center py-4 bg-brand-bg rounded-md border border-brand-border/50 mb-4">
                <div className={`text-lg font-black uppercase tracking-widest ${userTier.color}`}>
                  {userTier.name}
                </div>
                <div className="text-[10px] text-brand-muted mt-1 uppercase tracking-tighter">Level {userTier.level} Developer Tier</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Total Reputasi</span>
                  <span className="font-bold text-brand-text">{profile?.reputation || 0} Pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Role</span>
                  <span className="font-bold text-brand-primary capitalize flex items-center gap-1">
                    <Shield size={14} />
                    {profile?.role || 'User'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-border">
                <p className="text-[10px] text-brand-muted italic leading-relaxed">
                  Terus bagikan link bermanfaat dan berikan komentar untuk menaikkan reputasi Anda di komunitas KodeRuang.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-brand-accent mb-4">Waduh! Terjadi Kesalahan</h1>
        <p className="text-brand-muted mb-6">Gagal memuat profil kamu. Silakan coba refresh atau login kembali.</p>
        <div className="bg-brand-bg p-4 rounded-md border border-brand-border font-mono text-xs text-brand-muted">
          {error.message}
        </div>
      </div>
    );
  }
}
