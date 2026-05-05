import { createClient } from "@/lib/supabase/server";
import { MessageSquare, ExternalLink, Share2, Flag, Terminal } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { notFound } from "next/navigation";
import UpvoteButton from "@/components/resource/UpvoteButton";

export default async function ResourceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: resource, error } = await supabase
    .from('resources')
    .select(`
      *,
      submitted_by:profiles (
        username,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !resource) {
    return notFound();
  }

  // Check if user has voted
  let initialHasVoted = false;
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', id)
      .maybeSingle();
    
    initialHasVoted = !!vote;
  }

  const domain = new URL(resource.url).hostname.replace('www.', '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Detail Card */}
      <div className="bg-brand-surface border border-brand-border rounded-md p-6 sm:p-8 flex gap-6">
        <UpvoteButton 
          resourceId={resource.id} 
          initialScore={resource.score} 
          initialHasVoted={initialHasVoted} 
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold tracking-wide uppercase px-2 py-1 rounded-sm bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {resource.resource_type}
            </span>
            <span className="text-sm text-brand-muted font-mono bg-brand-bg px-2 py-1 rounded-sm border border-brand-border/50">
              {domain}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text leading-tight mb-4">
            {resource.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-brand-muted">
            <span className="flex items-center gap-1.5">
              Oleh <Link href={`/user/${resource.submitted_by.username}`} className="font-medium text-brand-text hover:text-brand-primary transition-colors">{resource.submitted_by.username}</Link>
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true, locale: idLocale })}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare size={16} /> {resource.comment_count} Komentar
            </span>
          </div>

          <p className="text-brand-text leading-relaxed text-lg mb-8">
            {resource.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-sm text-brand-muted mr-2">Tech Stack:</span>
            {resource.tech_stack_tags.map((tag: string) => (
              <Link 
                key={tag} 
                href={`/stack/${tag.toLowerCase()}`}
                className="text-sm font-mono text-brand-muted bg-brand-code px-2.5 py-1 rounded-md hover:bg-brand-border transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-brand-border">
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-brand-primary text-brand-surface px-6 py-2.5 rounded-md font-medium hover:bg-brand-primary/90 transition-colors"
            >
              Kunjungi Resource <ExternalLink size={18} />
            </a>
            
            <button className="flex items-center gap-2 px-4 py-2.5 text-brand-muted hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors font-medium">
              <Share2 size={18} /> Bagikan
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-brand-muted hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors font-medium">
              <Flag size={18} /> Laporkan
            </button>
          </div>
        </div>
      </div>

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('resource_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Detail Card ... (omitted for brevity) */}
      <div className="bg-brand-surface border border-brand-border rounded-md p-6 sm:p-8 flex gap-6">
        <UpvoteButton resourceId={resource.id} initialScore={resource.score} />
        {/* ... (rest of detail card) */}
      </div>

      <CommentSection 
        resourceId={resource.id} 
        initialComments={comments || []} 
        commentCount={resource.comment_count} 
      />
    </div>
  );
}
