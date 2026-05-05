import ResourceCard from "@/components/resource/ResourceCard";
import { Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0; // Disable static caching for MVP

export default async function Home({ searchParams }: { searchParams: Promise<{ verified?: string, sort?: string }> }) {
  const { verified, sort = 'latest' } = await searchParams;
  const supabase = await createClient();
  
  // Base query
  let query = supabase
    .from('resources')
    .select(`
      *,
      submitted_by:profiles!inner(username, avatar_url)
    `);

  // Apply sorting
  if (sort === 'trending' || sort === 'top') {
    query = query.order('score', { ascending: false });
  } else if (sort === 'discussed') {
    query = query.order('comment_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: resources, error } = await query;

  // For testing, if Supabase is empty, we fallback to an empty array
  // If there's an error, maybe the table isn't created yet
  const displayResources = resources || [];

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
          {error && (
            <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-md text-brand-accent text-sm">
              Error loading resources: {error.message}
            </div>
          )}
          
          {!error && displayResources.length === 0 && (
            <div className="p-8 text-center bg-brand-surface border border-brand-border rounded-md text-brand-muted">
              Belum ada resource. Jadilah yang pertama submit!
            </div>
          )}

          {displayResources.map((resource: any) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        {/* About Community */}
        <div className="bg-brand-surface border border-brand-border rounded-md p-5">
          <h2 className="font-bold text-brand-text mb-2">Tentang KodeRuang</h2>
          <p className="text-sm text-brand-muted leading-relaxed">
            Platform komunitas untuk developer Indonesia berbagi resource bermanfaat seperti artikel teknis, repository, library, dan tools.
          </p>
          <div className="mt-4 pt-4 border-t border-brand-border flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-muted">Total Resource</span>
              <span className="font-bold text-brand-text">{displayResources.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-muted">Active Developer</span>
              <span className="font-bold text-brand-text">1</span>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="bg-brand-surface border border-brand-border rounded-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-brand-muted" />
            <h2 className="font-bold text-brand-text">Kategori Populer</h2>
          </div>
          <div className="flex flex-col gap-2">
            {["Frontend", "Backend", "Fullstack", "UI/UX", "Database", "AI/ML"].map((cat) => (
              <a key={cat} href={`/category/${cat.toLowerCase()}`} className="flex justify-between items-center text-sm py-1.5 px-2 -mx-2 hover:bg-brand-bg rounded-md transition-colors group">
                <span className="text-brand-text group-hover:text-brand-primary">{cat}</span>
                <span className="text-xs text-brand-muted bg-brand-code px-1.5 py-0.5 rounded-sm">
                  -
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Trending Stacks */}
        <div className="bg-brand-surface border border-brand-border rounded-md p-5">
          <h2 className="font-bold text-brand-text mb-4">Trending Stacks</h2>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Tailwind", "React", "Supabase", "PostgreSQL", "Node.js"].map((stack) => (
              <a key={stack} href={`/stack/${stack.toLowerCase()}`} className="text-xs font-mono text-brand-muted bg-brand-code px-2 py-1 rounded-md hover:bg-brand-border transition-colors">
                #{stack}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
