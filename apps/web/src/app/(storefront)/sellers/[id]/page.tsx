export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || 'Unknown';

  return (
    <main className="flex-1 container py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-heading font-bold mb-4">Seller Storefront</h1>
      <p className="text-muted-foreground max-w-lg mx-auto">
        You are viewing the storefront for Seller ID: {id}. We are currently building this section!
      </p>
    </main>
  );
}
