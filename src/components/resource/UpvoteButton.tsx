'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UpvoteButtonProps {
  resourceId: string;
  initialScore: number;
  initialHasVoted?: boolean;
}

export default function UpvoteButton({ resourceId, initialScore, initialHasVoted = false }: UpvoteButtonProps) {
  const [score, setScore] = useState(initialScore);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (hasVoted) {
        // Remove vote
        const { error: voteError } = await supabase
          .from('votes')
          .delete()
          .match({ user_id: user.id, resource_id: resourceId });

        if (voteError) throw voteError;

        // Decrement score (UI only for now, real app should use RPC)
        setScore(prev => prev - 1);
        setHasVoted(false);
      } else {
        // Add vote
        const { error: voteError } = await supabase
          .from('votes')
          .insert({ user_id: user.id, resource_id: resourceId, vote_type: 1 });

        if (voteError) throw voteError;

        setScore(prev => prev + 1);
        setHasVoted(true);
      }
      
      router.refresh();
    } catch (error: any) {
      console.error('Error voting:', error.message);
      // Rollback UI state if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <button 
        onClick={handleVote}
        disabled={loading}
        className={`p-1 rounded-md transition-colors group/vote ${
          hasVoted 
            ? 'text-brand-primary bg-brand-primary/10' 
            : 'text-brand-muted hover:text-brand-primary hover:bg-brand-bg'
        }`}
      >
        <ArrowUp 
          size={24} 
          className={`${hasVoted ? 'fill-current' : ''} group-hover/vote:-translate-y-0.5 transition-transform`} 
        />
      </button>
      <span className={`font-bold text-sm ${hasVoted ? 'text-brand-primary' : 'text-brand-text'}`}>
        {score}
      </span>
    </div>
  );
}
