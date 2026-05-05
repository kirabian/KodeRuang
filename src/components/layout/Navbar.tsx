import Link from 'next/link';
import { Search, PlusCircle, User, Terminal, LogOut, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import NotificationBell from '@/components/layout/NotificationBell';

export default async function Navbar() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user;
  } catch (e: any) {
    if (e.digest === 'DYNAMIC_SERVER_USAGE') {
      throw e;
    }
    console.error("Navbar auth error:", e);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-brand-surface border-b border-brand-border z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-text">
          <div className="bg-brand-primary text-brand-surface p-1.5 rounded-sm">
            <Terminal size={20} strokeWidth={2.5} />
          </div>
          <span className="hidden sm:inline">KodeRuang</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-brand-text hover:text-brand-primary transition-colors">Explore</Link>
          <Link href="/trending" className="text-brand-muted hover:text-brand-text transition-colors">Trending</Link>
          <Link href="/stack/all" className="text-brand-muted hover:text-brand-text transition-colors">Stacks</Link>
          <Link href="/saved" className="text-brand-muted hover:text-brand-text transition-colors">Collections</Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari resource, library, atau artikel..." 
              className="w-full bg-brand-bg border border-brand-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted/70 text-brand-text"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link 
                href="/submit" 
                className="hidden md:flex items-center gap-2 bg-brand-primary text-brand-surface px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-primary/90 transition-colors"
              >
                <PlusCircle size={16} />
                <span>Submit</span>
              </Link>
              
              <NotificationBell userId={user.id} />

              <Link 
                href="/user/me" 
                className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-bg border border-brand-border text-brand-primary font-bold text-sm hover:border-brand-primary transition-colors"
              >
                {user.email?.[0].toUpperCase()}
              </Link>
              <form action="/auth/signout" method="post">
                <button 
                  type="submit"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-bg border border-brand-border text-brand-muted hover:text-brand-accent hover:border-brand-accent transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-brand-text hover:text-brand-primary transition-colors px-2"
              >
                Masuk
              </Link>
              <Link 
                href="/register" 
                className="text-sm font-medium bg-brand-text text-brand-surface px-4 py-2 rounded-md hover:bg-brand-text/90 transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
