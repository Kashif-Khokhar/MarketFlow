export default function GenericPlaceholderPage({ params }: { params?: any }) {
  return (
    <main className="flex-1 container py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-heading font-bold mb-4">Coming Soon</h1>
      <p className="text-muted-foreground max-w-lg mx-auto">
        We are actively building this page. Check back soon for updates!
      </p>
    </main>
  );
}
