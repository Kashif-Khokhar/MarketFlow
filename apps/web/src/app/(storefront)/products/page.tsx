"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter, SlidersHorizontal, ChevronRight, X, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductFilters } from '@/components/marketplace/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] max-w-full" />
        <Skeleton className="h-4 w-[200px] max-w-[80%]" />
      </div>
      <Skeleton className="h-6 w-[100px] mt-2" />
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        // Map 'q' to 'search' for the API
        if (params.has('q')) {
          params.set('search', params.get('q') as string);
          params.delete('q');
        }
        
        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.data.products || res.data.data);
        setTotal(res.data.data.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('sort', value);
    else params.delete('sort');
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="flex-1 container py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
        <span className="text-foreground font-medium">Products</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          {query ? `Search Results for "${query}"` : category ? `Shop ${category.replace(/-/g, ' ')}` : 'All Products'}
        </h1>
        <p className="text-muted-foreground">
          {loading ? 'Searching...' : `Showing ${products.length} of ${total} results`}
        </p>
      </div>

      {/* Active Filters Row */}
      {(query || category || searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('rating')) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground mr-2">Active Filters:</span>
          {query && (
            <div className="inline-flex items-center gap-1 bg-white border border-border/50 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              Search: {query}
              <button onClick={() => removeFilter('q')} className="hover:bg-muted p-0.5 rounded-full transition-colors ml-1"><X size={12} /></button>
            </div>
          )}
          {category && (
            <div className="inline-flex items-center gap-1 bg-white border border-border/50 px-3 py-1 rounded-full text-xs font-medium shadow-sm capitalize">
              Category: {category.replace(/-/g, ' ')}
              <button onClick={() => removeFilter('category')} className="hover:bg-muted p-0.5 rounded-full transition-colors ml-1"><X size={12} /></button>
            </div>
          )}
          {searchParams.get('minPrice') && (
            <div className="inline-flex items-center gap-1 bg-white border border-border/50 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              Min: ${searchParams.get('minPrice')}
              <button onClick={() => removeFilter('minPrice')} className="hover:bg-muted p-0.5 rounded-full transition-colors ml-1"><X size={12} /></button>
            </div>
          )}
          {searchParams.get('maxPrice') && (
            <div className="inline-flex items-center gap-1 bg-white border border-border/50 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              Max: ${searchParams.get('maxPrice')}
              <button onClick={() => removeFilter('maxPrice')} className="hover:bg-muted p-0.5 rounded-full transition-colors ml-1"><X size={12} /></button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <ProductFilters />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Controls Bar (Mobile Filter + Sort) */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/50">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter size={16} /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto pt-10">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left">Filter Products</SheetTitle>
                  </SheetHeader>
                  <ProductFilters />
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">Sort by:</span>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Recommended" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find anything matching your current filters. Try adjusting your search or clearing some filters.
              </p>
              <Button variant="outline" onClick={() => router.push('/products')}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {total > products.length && (
                <div className="flex justify-center mt-12 pt-8 border-t border-border/50">
                  <div className="flex gap-2">
                    <Button variant="outline" disabled>Previous</Button>
                    <Button variant="outline" className="bg-primary text-primary-foreground">1</Button>
                    <Button variant="outline">2</Button>
                    <Button variant="outline">3</Button>
                    <Button variant="outline">Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center text-muted-foreground">Loading marketplace...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
