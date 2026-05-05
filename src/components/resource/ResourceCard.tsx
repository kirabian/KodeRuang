import Link from 'next/link';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import UpvoteButton from './UpvoteButton';

export type Resource = {
  id: string;
  title: string;
  url: string;
  description: string;
  resource_type: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All';
  category: string;
  tech_stack_tags: string[];
  submitted_by: {
    username: string;
    avatar_url?: string;
  };
  score: number;
  comment_count: number;
  created_at: string;
};

export default function ResourceCard({ resource }: { resource: Resource }) {
  const domain = new URL(resource.url).hostname.replace('www.', '');

  return (
    <div className="flex gap-4 p-4 bg-brand-surface border border-brand-border rounded-md hover:border-brand-primary/30 transition-colors group">
      {/* Upvote Column */}
      <UpvoteButton resourceId={resource.id} initialScore={resource.score} />

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-brand-muted font-mono bg-brand-bg px-2 py-0.5 rounded-sm border border-brand-border/50">
            {domain}
          </span>
          <span className="text-xs text-brand-muted">•</span>
          <span className="text-xs text-brand-muted">
            oleh <Link href={`/user/${resource.submitted_by.username}`} className="hover:text-brand-primary font-medium">{resource.submitted_by.username}</Link>
          </span>
          <span className="text-xs text-brand-muted">•</span>
          <span className="text-xs text-brand-muted">
            {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true, locale: id })}
          </span>
        </div>

        <Link href={`/resource/${resource.id}`} className="block group/title mb-2">
          <h2 className="text-lg font-bold text-brand-text leading-tight group-hover/title:text-brand-primary transition-colors flex items-center gap-2">
            {resource.title}
          </h2>
          <p className="text-sm text-brand-muted mt-1 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {resource.resource_type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {resource.tech_stack_tags.map((tag) => (
              <Link 
                key={tag} 
                href={`/stack/${tag.toLowerCase()}`}
                className="text-xs font-mono text-brand-muted bg-brand-code px-2 py-0.5 rounded-md hover:bg-brand-border transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link 
              href={`/resource/${resource.id}#comments`}
              className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              <MessageSquare size={16} />
              <span className="font-medium">{resource.comment_count}</span>
            </Link>
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary transition-colors"
            >
              <ExternalLink size={16} />
              <span className="font-medium">Kunjungi</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
