'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ResourceCard, { Resource } from '@/components/resource/ResourceCard'

export default function RealtimeResources({
  initialResources,
  userRole,
  currentUserId
}: {
  initialResources: Resource[],
  userRole: string,
  currentUserId?: string
}) {
  const supabase = createClient()
  const [resources, setResources] = useState<Resource[]>(initialResources)

  useEffect(() => {
    // Listen to changes in resources table
    const channel = supabase
      .channel('public-resources')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRes = payload.new as any;
            
            // Fetch profile info for the new resource
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, reputation')
              .eq('id', newRes.user_id)
              .single();

            const fullResource: Resource = {
              ...newRes,
              score: 0,
              comment_count: 0,
              submitted_by: profile || { username: 'anonim', reputation: 0 }
            };

            setResources((current) => [fullResource, ...current]);
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setResources((current) =>
              current.map((item) =>
                item.id === updated.id
                  ? { ...item, ...updated } // Ambil semua data terbaru termasuk score & comment_count
                  : item
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setResources((current) => current.filter((item) => item.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const canModerated = userRole === 'admin' || userRole === 'moderator';

  return (
    <div className="flex flex-col gap-4">
      {resources.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface border border-brand-border rounded-md">
          <p className="text-brand-muted">Belum ada resource untuk kategori ini.</p>
        </div>
      ) : (
        resources.map((resource) => (
          <ResourceCard 
            key={resource.id} 
            resource={resource} 
            canDelete={canModerated}
          />
        ))
      )}
    </div>
  )
}
