import ResourceCard from "@/components/resource/ResourceCard";
import { Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ verified?: string, sort?: string }> }) {
  try {
    const { verified, sort = 'latest' } = await searchParams;
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    
    // Fetch user profile for role and reputation
    let userProfile = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, reputation')
        .eq('id', user.id)
        .single();
      userProfile = profile;
    }

    // Get resources with real vote & comment counts
    const { data: resources, error: fetchError } = await supabase
      .from('resources')
      .select(`
        *,
        submitted_by:profiles(username, avatar_url, reputation),
        votes(count),
        comments(count)
      `)
      .order('created_at', { ascending: false });

    if (fetchError) throw new Error(`Database error: ${fetchError.message}`);

    // Get user votes if logged in
    let userVotes: string[] = [];
    if (user && resources && resources.length > 0) {
      const { data: votes } = await supabase
        .from('votes')
        .select('resource_id')
        .eq('user_id', user.id)
        .in('resource_id', resources.map((r: any) => r.id));

      if (votes) {
        userVotes = votes.map((v: any) => v.resource_id);
      }
    }

    // Build display resources with real counts
    let displayResources = (resources || []).map((r: any) => {
      const realScore = r.votes?.[0]?.count ?? r.score ?? 0;
      const realCommentCount = r.comments?.[0]?.count ?? r.comment_count ?? 0;
      return {
        ...r,
        score: realScore,
        comment_count: realCommentCount,
        has_voted: userVotes.includes(r.id)
      };
    });

    // Apply sorting on the computed data
    if (sort === 'trending' || sort === 'top') {
      displayResources = displayResources.sort((a: any, b: any) => b.score - a.score);
    } else if (sort === 'discussed') {
      displayResources = displayResources.sort((a: any, b: any) => b.comment_count - a.comment_count);
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {verified === 'true' && (
            <div className="mb-6 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-md flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-brand-text">Akun Berhasil Diverifikasi!</h3>
                <p className="text-sm text-brand-muted">Selamat datang di komunitas KodeRuang. Sekarang kamu bisa berbagi resource dan berdiskusi.</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-brand-text">Resource Feed</h1>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <Link
                href="/?sort=latest"
                className={`px-3 py-1.5 text-sm font-medium rounded-md shrink-0 transition-colors ${
                  sort === 'latest' ? 'bg-brand-primary text-brand-surface' : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                }`}
              >
                Latest
              </Link>
              <Link
                href="/?sort=trending"
                className={`px-3 py-1.5 text-sm font-medium rounded-md shrink-0 transition-colors ${
                  sort === 'trending' ? 'bg-brand-primary text-brand-surface' : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                }`}
              >
                Trending
              </Link>
              <Link
                href="/?sort=top"
                className={`px-3 py-1.5 text-sm font-medium rounded-md shrink-0 transition-colors ${
                  sort === 'top' ? 'bg-brand-primary text-brand-surface' : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                }`}
              >
                Top Week
              </Link>
              <Link
                href="/?sort=discussed"
                className={`px-3 py-1.5 text-sm font-medium rounded-md shrink-0 transition-colors ${
                  sort === 'discussed' ? 'bg-brand-primary text-brand-surface' : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                }`}
              >
                Most Discussed
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {displayResources.length === 0 && (
              <div className="p-8 text-center bg-brand-surface border border-brand-border rounded-md text-brand-muted">
                Belum ada resource. Jadilah yang pertama submit!
              </div>
            )}

            {displayResources.map((resource: any) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                canDelete={userProfile?.role === 'admin' || userProfile?.role === 'moderator' || user?.id === resource.user_id}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {/* User Profile / Community Info */}
          <div className="bg-brand-surface border border-brand-border rounded-md p-5">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-bg rounded-full border border-brand-border flex items-center justify-center text-xl font-bold text-brand-primary uppercase">
                    {user.email?.[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-brand-text leading-tight">{user.email?.split('@')[0]}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-brand-primary/10 text-brand-primary">
                        {userProfile?.role || 'User'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-3 border-t border-brand-border/50">
                   <div className="flex justify-between items-center text-sm">
                    <span className="text-brand-muted">Reputation</span>
                    <span className="font-bold text-brand-text">{userProfile?.reputation || 0} Rep</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-bold text-brand-text mb-2">Tentang KodeRuang</h2>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Platform komunitas untuk developer Indonesia berbagi resource bermanfaat seperti artikel teknis, repository, library, dan tools.
                </p>
              </>
            )}
            
            <div className="mt-4 pt-4 border-t border-brand-border flex flex-col gap-2">
              <div className="justify-between flex items-center text-sm">
                <span className="text-brand-muted">Total Resource</span>
                <span className="font-bold text-brand-text">{displayResources.length}</span>
              </div>
              <div className="justify-between flex items-center text-sm">
                <span className="text-brand-muted">Active Member</span>
                <span className="font-bold text-brand-text">
                  {/* Fetch real member count */}
                  {await (async () => {
                    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                    return count || 0;
                  })()}
                </span>
              </div>
            </div>
            
            {!user && (
              <Link href="/register" className="mt-5 block w-full py-2 bg-brand-primary text-brand-surface text-center rounded-md font-bold text-sm hover:bg-brand-primary/90 transition-colors">
                Gabung Komunitas
              </Link>
            )}
          </div>

          {/* Popular Categories */}
          <div className="bg-brand-surface border border-brand-border rounded-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-brand-muted" />
              <h2 className="font-bold text-brand-text">Kategori Populer</h2>
            </div>
            <div className="flex flex-col gap-2">
              {["Frontend", "Backend", "Fullstack", "UI/UX", "Database", "AI/ML"].map((cat: string) => (
                <a key={cat} href={`/category/${cat.toLowerCase()}`} className="flex justify-between items-center text-sm py-1.5 px-2 -mx-2 hover:bg-brand-bg rounded-md transition-colors group">
                  <span className="text-brand-text group-hover:text-brand-primary">{cat}</span>
                  <span className="text-xs text-brand-muted bg-brand-code px-1.5 py-0.5 rounded-sm">
                    {displayResources.filter(r => r.category === cat).length}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Trending Stacks */}
          <div className="bg-brand-surface border border-brand-border rounded-md p-5">
            <h2 className="font-bold text-brand-text mb-4">Trending Stacks</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "TypeScript", "Tailwind", "React", "Supabase", "PostgreSQL", "Node.js"].map((stack: string) => (
                <a key={stack} href={`/stack/${stack.toLowerCase()}`} className="text-xs font-mono text-brand-muted bg-brand-code px-2 py-1 rounded-md hover:bg-brand-border transition-colors">
                  #{stack}
                </a>
              ))}
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
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
        <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-lg p-6 shadow-xl">
          <h1 className="text-xl font-bold text-brand-accent mb-4">Terjadi Kesalahan (500)</h1>
          <p className="text-sm text-brand-text mb-6">
            Aplikasi mengalami kendala saat memuat data.
          </p>
          <div className="bg-brand-bg p-3 rounded font-mono text-[10px] text-brand-muted break-all">
            {error.message || 'Unknown Error'}
          </div>
        </div>
      </div>
    );
  }
}
