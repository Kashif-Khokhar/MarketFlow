export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'Category';
  
  return (
    <main className="flex-1 container py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-heading font-bold mb-4 capitalize">
        {slug.replace(/-/g, ' ')}
      </h1>
      <p className="text-muted-foreground max-w-lg mx-auto">
        You are viewing the category page for {slug.replace(/-/g, ' ')}. We are currently building this section and adding amazing products!
      </p>
    </main>
  );
}
