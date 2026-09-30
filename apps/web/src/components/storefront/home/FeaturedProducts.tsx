import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export interface FeaturedProductsProps {
  products: any[];
  loading: boolean;
  title?: string;
  description?: string;
  viewAllLink?: string;
}

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

export function FeaturedProducts({ 
  products, 
  loading, 
  title = "Trending Products", 
  description = "Most loved products by our customers",
  viewAllLink = "/products"
}: FeaturedProductsProps) {
  return (
    <section className="py-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-foreground mb-1">{title}</h2>
            {description && <p className="text-xs md:text-sm text-muted-foreground">{description}</p>}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-xs md:text-sm font-medium text-primary hover:underline underline-offset-4 whitespace-nowrap">
              View All &rarr;
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
