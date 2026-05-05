import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTierFromPoints } from '@/lib/utils/tiers';
import { Award, Shield, Link as LinkIcon } from 'lucide-react';
import ResourceCard from '@/components/resource/ResourceCard';

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

    // Fetch user's resources
    const { data: resources } = await supabase
      .from('resources')
      .select(`
        *,
        submitted_by:profiles(username, avatar_url, reputation),
        votes(count),
        comments(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch user's votes to show vote state
    let userVotes: string[] = [];
    if (resources && resources.length > 0) {
      const { data: votes } = await supabase
        .from('votes')
        .select('resource_id')
        .eq('user_id', user.id)
        .in('resource_id', resources.map(r => r.id));
      if (votes) userVotes = votes.map(v => v.resource_id);
    }

    const displayResources = (resources || []).map(r => ({
      ...r,
      score: r.votes?.[0]?.count ?? r.score ?? 0,
      comment_count: r.comments?.[0]?.count ?? r.comment_count ?? 0,
      has_voted: userVotes.includes(r.id)
    }));

    const userTier = getTierFromPoints(profile?.reputation || 0);
    const canModerated = profile?.role === 'admin' || profile?.role === 'moderator';

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
                  Resource Saya ({displayResources.length})
                </h3>

                <div className="flex flex-col gap-4 mt-4">
                  {displayResources.length === 0 ? (
                    <p className="text-brand-muted text-sm text-center py-8 bg-brand-bg/50 rounded-md border border-dashed border-brand-border">
                      Belum ada resource yang di-submit.
                    </p>
                  ) : (
                    displayResources.map(resource => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource as any}
                        canDelete={canModerated}
                      />
                    ))
                  )}
                </div>
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
