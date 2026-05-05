'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Notification = {
  id: string
  user_id: string
  actor_id: string | null
  resource_id: string | null
  type: string
  message: string
  is_read: boolean
  created_at: string
  actor?: {
    username: string
  }
}

export function useRealtimeNotifications(userId?: string) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    async function loadNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles!notifications_actor_id_fkey(username)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      const list = (data as any) || []
      setNotifications(list)
      setUnreadCount(list.filter((item: any) => !item.is_read).length)
    }

    loadNotifications()

    // Subscribe ke perubahan notifikasi
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const newNotif = payload.new as Notification
          
          // Ambil data actor secara manual karena realtime payload terbatas
          const { data: actorData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', newNotif.actor_id)
            .single()

          const fullNotif = { ...newNotif, actor: actorData } as Notification

          setNotifications((current) => [fullNotif, ...current])
          setUnreadCount((count) => count + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  async function markAsRead(id: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    if (!userId) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications((current) =>
      current.map((item) => ({ ...item, is_read: true }))
    )
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
