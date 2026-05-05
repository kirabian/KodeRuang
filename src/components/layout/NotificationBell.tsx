'use client'

import { useState } from 'react'
import { Bell, MessageSquare, ArrowBigUp } from 'lucide-react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

export default function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications(userId)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-brand-muted hover:text-brand-primary transition-colors bg-brand-bg border border-brand-border rounded-full hover:border-brand-primary/50"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-brand-surface border border-brand-border rounded-md shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">Notifikasi</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] text-brand-primary hover:underline font-medium"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="divide-y divide-brand-border/50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-brand-muted">
                  Belum ada notifikasi.
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/resource/${notif.resource_id}`}
                    onClick={() => {
                      markAsRead(notif.id)
                      setIsOpen(false)
                    }}
                    className={`flex items-start gap-3 p-3 hover:bg-brand-bg transition-colors ${!notif.is_read ? 'bg-brand-primary/5' : ''}`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-full ${notif.type === 'upvote' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {notif.type === 'upvote' ? <ArrowBigUp size={14} /> : <MessageSquare size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-text leading-snug">
                        <span className="font-bold">@{notif.actor?.username || 'user'}</span> {notif.message}
                      </p>
                      <span className="text-[10px] text-brand-muted mt-1 block">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                    {!notif.is_read && (
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
