'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SubmitButton from '@/components/ui/SubmitButton';

export default function SubmitPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    resource_type: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    // Process tags
    const tagsArray = formData.tags 
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '').slice(0, 5)
      : [];

    try {
      const { error } = await supabase
        .from('resources')
        .insert([
          {
            title: formData.title,
            url: formData.url,
            description: formData.description,
            resource_type: formData.resource_type,
            category: formData.category,
            tech_stack_tags: tagsArray,
            user_id: user.id,
            status: 'published'
          }
        ]);

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting resource:', error.message);
      alert('Gagal mengirim resource: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen text-brand-text">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-brand-surface border border-brand-border rounded-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-brand-text mb-2">Submit Resource</h1>
        <p className="text-brand-muted text-sm mb-8">
          Bagikan resource bermanfaat yang kamu temukan kepada komunitas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">URL <span className="text-brand-accent">*</span></label>
              <input 
                name="url"
                type="url" 
                value={formData.url}
                onChange={handleChange}
                placeholder="https://" 
                className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Judul <span className="text-brand-accent">*</span></label>
              <input 
                name="title"
                type="text" 
                value={formData.title}
                onChange={handleChange}
                placeholder="Judul yang deskriptif dan jelas" 
                className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Deskripsi Singkat</label>
              <textarea 
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan mengapa resource ini bermanfaat (opsional tapi disarankan)" 
                className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Tipe Resource <span className="text-brand-accent">*</span></label>
                <select 
                  name="resource_type"
                  value={formData.resource_type}
                  onChange={handleChange}
                  className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text appearance-none"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="Article">Article</option>
                  <option value="GitHub Repo">GitHub Repo</option>
                  <option value="Tool">Tool</option>
                  <option value="Library">Library</option>
                  <option value="Boilerplate">Boilerplate</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Video">Video</option>
                  <option value="Documentation">Documentation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Kategori <span className="text-brand-accent">*</span></label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text appearance-none"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Fullstack">Fullstack</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Database">Database</option>
                  <option value="AI/ML">AI/ML</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Tags (Tech Stack)</label>
              <input 
                name="tags"
                type="text" 
                value={formData.tags}
                onChange={handleChange}
                placeholder="Misal: react, typescript, tailwind (pisahkan dengan koma)" 
                className="w-full bg-brand-bg border border-brand-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-brand-text"
              />
              <p className="text-xs text-brand-muted mt-1.5">Maksimal 5 tags.</p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-brand-border">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-brand-text transition-colors"
            >
              Batal
            </button>
            <SubmitButton 
              className="bg-brand-primary text-brand-surface hover:bg-brand-primary/90 px-8"
            >
              Submit Resource
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
