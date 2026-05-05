import { mockResources } from "@/lib/dummyData";
import { ArrowUp, MessageSquare, ExternalLink, Share2, Flag, Terminal } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function ResourceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = mockResources.find((r) => r.id === id) || mockResources[0];
  const domain = new URL(resource.url).hostname.replace('www.', '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Detail Card */}
      <div className="bg-brand-surface border border-brand-border rounded-md p-6 sm:p-8 flex gap-6">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-md transition-colors border border-transparent hover:border-brand-border group/vote">
            <ArrowUp size={28} className="group-hover/vote:-translate-y-1 transition-transform" />
          </button>
          <span className="font-bold text-brand-text text-lg">{resource.score}</span>
        </div>

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
            {resource.tech_stack_tags.map((tag) => (
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

      {/* Comments Section */}
      <div id="comments" className="bg-brand-surface border border-brand-border rounded-md p-6 sm:p-8">
        <h2 className="text-xl font-bold text-brand-text mb-6">Komentar ({resource.comment_count})</h2>
        
        {/* Comment Form */}
        <div className="mb-8 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
            <Terminal size={20} className="text-brand-muted" />
          </div>
          <div className="flex-1">
            <textarea 
              rows={4}
              placeholder="Tambahkan komentar. Mendukung Markdown dan code block..." 
              className="w-full bg-brand-bg border border-brand-border rounded-md py-3 px-4 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text resize-y font-mono mb-3"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-brand-muted">
                Tip: Gunakan ``` untuk menulis kode.
              </span>
              <button className="px-5 py-2 text-sm font-medium bg-brand-primary text-brand-surface rounded-md hover:bg-brand-primary/90 transition-colors">
                Kirim Komentar
              </button>
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-6">
          {/* Dummy Comment */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
              <span className="text-brand-text font-bold">AL</span>
            </div>
            <div className="flex-1">
              <div className="bg-brand-bg border border-brand-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-brand-text">alex_dev</span>
                  <span className="text-xs text-brand-muted">2 jam yang lalu</span>
                </div>
                <div className="text-sm text-brand-text leading-relaxed">
                  <p className="mb-2">Resource yang sangat bagus! Saya sudah mencobanya di project terbaru saya.</p>
                  <p>Ini contoh implementasinya jika menggunakan TypeScript:</p>
                  <pre className="bg-brand-code p-3 rounded-md mt-2 border border-brand-border overflow-x-auto">
                    <code className="text-xs font-mono text-brand-text">
{`interface User {
  id: string;
  name: string;
}

const getUser = async (id: string): Promise<User> => {
  // Fetch logic here
}`}
                    </code>
                  </pre>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 px-2">
                <button className="text-xs font-medium text-brand-muted hover:text-brand-text flex items-center gap-1">
                  <ArrowUp size={14} /> 12
                </button>
                <button className="text-xs font-medium text-brand-muted hover:text-brand-text">
                  Balas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
