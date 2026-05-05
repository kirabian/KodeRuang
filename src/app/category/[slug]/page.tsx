export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-text mb-6 capitalize">Category: {slug}</h1>
      <div className="bg-brand-surface border border-brand-border rounded-md p-8 text-center text-brand-muted">
        Halaman kategori sedang dalam pengembangan.
      </div>
    </div>
  );
}
