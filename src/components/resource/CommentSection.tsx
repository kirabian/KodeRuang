'use client';

import { useState } from 'react';
import { Terminal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface CommentSectionProps {
  resourceId: string;
  initialComments: Comment[];
  commentCount: number;
}

export default function CommentSection({ resourceId, initialComments, commentCount }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Insert comment
      const { data, error } = await supabase
        .from('comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // 2. Update resource comment count
      await supabase.from('resources').update({ 
        comment_count: comments.length + 1 
      }).eq('id', resourceId);

      setComments(prev => [data, ...prev]);
      setNewComment('');
      router.refresh();
    } catch (error: any) {
      console.error('Error posting comment:', error.message);
      alert('Gagal mengirim komentar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-md p-6 sm:p-8">
      <h2 className="text-xl font-bold text-brand-text mb-6">Komentar ({comments.length})</h2>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
          <Terminal size={20} className="text-brand-muted" />
        </div>
        <div className="flex-1">
          <textarea 
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar. Mendukung Markdown (```) dan link..." 
            className="w-full bg-brand-bg border border-brand-border rounded-md py-3 px-4 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text resize-y font-mono mb-3"
            required
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-brand-muted">
              Tip: Gunakan triple backtick (```) untuk menulis kode.
            </span>
            <button 
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-5 py-2 text-sm font-medium bg-brand-primary text-brand-surface rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-brand-muted border-t border-brand-border border-dashed">
            <p>Belum ada komentar untuk resource ini. Jadilah yang pertama!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                <span className="text-brand-primary font-bold">
                  {comment.profiles?.username?.substring(0, 2).toUpperCase() || '??'}
                </span>
              </div>
              <div className="flex-1">
                <div className="bg-brand-bg border border-brand-border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-brand-text">{comment.profiles?.username}</span>
                    <span className="text-xs text-brand-muted">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: idLocale })}
                    </span>
                  </div>
                  <div className="text-sm text-brand-text leading-relaxed prose prose-invert prose-sm max-w-none prose-pre:bg-brand-code prose-pre:border prose-pre:border-brand-border">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
