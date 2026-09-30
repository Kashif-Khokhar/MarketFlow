import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/api';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  // Mock data for UI fidelity if missing from API
  const discount = product.discount || Math.floor(Math.random() * 30) + 10;
  const originalPrice = product.originalPrice || (product.basePrice * (1 + discount / 100));
  const rating = product.rating || (4 + Math.random()).toFixed(1);
  const reviewsCount = product.reviewsCount || Math.floor(Math.random() * 500) + 50;
  const sellerName = product.seller?.storeName || 'TechStore';

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl flex flex-col h-full bg-white">
      <div className="relative aspect-square overflow-hidden bg-[#FAF8F2]">
        <Link href={`/product/${product.slug || product._id}`} className="w-full h-full block">
          {product.images && product.images.length > 0 ? (
            <img 
              src={getImageUrl(product.images[0])} 
              alt={product.name} 
              className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/30">
              No Image
            </div>
          )}
        </Link>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock === 0 ? (
            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-[10px] uppercase font-bold tracking-wider rounded-md">
              Out of Stock
            </Badge>
          ) : (
            <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground text-[10px] font-bold rounded-md px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
        </div>
        
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
        <Link href={`/product/${product.slug || product._id}`} className="group-hover:text-primary transition-colors block mb-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground leading-snug">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span className="text-xs font-bold text-foreground">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewsCount})</span>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-lg text-foreground">
              ${product.basePrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              ${originalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Sold by <span className="font-medium text-foreground">{sellerName}</span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
        <Button className="w-full font-medium rounded-xl gap-2 shadow-sm hover:shadow-md transition-all group-hover:bg-primary/90" size="sm">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
