export const dynamic = force-dynamic;

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-text mb-6">Profile: {username}</h1>
      <div className="bg-brand-surface border border-brand-border rounded-md p-8 text-center text-brand-muted">
        Halaman profil sedang dalam pengembangan.
      </div>
    </div>
  );
}
