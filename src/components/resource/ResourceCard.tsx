'use client';

import Link from 'next/link';
import { MessageSquare, ExternalLink, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import UpvoteButton from './UpvoteButton';
import { getTierFromPoints } from '@/lib/utils/tiers';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export type Resource = {
  id: string;
  title: string;
  url: string;
  description: string;
  resource_type: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All';
  category: string;
  tech_stack_tags: string[];
  user_id: string;
  submitted_by: {
    username: string;
    avatar_url?: string;
    reputation?: number;
  };
  score: number;
  comment_count: number;
  created_at: string;
  has_voted?: boolean;
};

export default function ResourceCard({ resource, canDelete }: { resource: Resource, canDelete?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  
  let domain = 'link';
  try {
    domain = new URL(resource.url).hostname.replace('www.', '');
  } catch (e) {
    // Fallback if URL is invalid
  }

  const username = resource.submitted_by?.username || 'anonim';
  const userTier = getTierFromPoints(resource.submitted_by?.reputation || 0);

  const handleDelete = async () => {
    if (!confirm('Apakah kamu yakin ingin menghapus resource ini?')) return;
    
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resource.id);
      
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      alert('Berhasil dihapus!');
      router.refresh();
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-brand-surface border border-brand-border rounded-md hover:border-brand-primary/30 transition-colors group relative">
      {/* Upvote Column */}
      <UpvoteButton 
        resourceId={resource.id} 
        initialScore={resource.score} 
        initialHasVoted={resource.has_voted} 
      />

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] sm:text-xs text-brand-muted font-mono bg-brand-bg px-2 py-0.5 rounded-sm border border-brand-border/50">
            {domain}
          </span>
          <div className="flex items-center gap-1.5">
            <Link href={`/user/${username}`} className="text-[10px] sm:text-xs hover:text-brand-primary font-medium text-brand-muted">{username}</Link>
            <span className={`text-[9px] sm:text-[10px] font-bold ${userTier.color}`}>
              [{userTier.name}]
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-brand-muted hidden sm:inline">•</span>
          <span className="text-[10px] sm:text-xs text-brand-muted">
            {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true, locale: id })}
          </span>
        </div>

        <Link href={`/resource/${resource.id}`} className="block group/title mb-2">
          <h2 className="text-base sm:text-lg font-bold text-brand-text leading-tight group-hover/title:text-brand-primary transition-colors flex items-center gap-2 line-clamp-2">
            {resource.title}
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {resource.resource_type}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {resource.tech_stack_tags.slice(0, 3).map((tag: string) => (
              <Link 
                key={tag} 
                href={`/stack/${tag.toLowerCase()}`}
                className="text-[10px] sm:text-xs font-mono text-brand-muted bg-brand-code px-2 py-0.5 rounded-md hover:bg-brand-border transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="flex-grow sm:flex-grow-0 ml-auto flex items-center gap-3 sm:gap-4 justify-end">
            <Link 
              href={`/resource/${resource.id}#comments`}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              <MessageSquare size={14} className="sm:w-4 sm:h-4" />
              <span className="font-medium">{resource.comment_count}</span>
            </Link>
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-muted hover:text-brand-primary transition-colors"
            >
              <ExternalLink size={14} className="sm:w-4 sm:h-4" />
              <span className="font-medium hidden sm:inline">Kunjungi</span>
            </a>
            
            {canDelete && (
              <button 
                onClick={handleDelete}
                className="p-1 text-brand-muted hover:text-brand-accent transition-colors"
                title="Hapus Resource"
              >
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
