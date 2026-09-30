"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await api.get('/sellers/store/public');
        setSellers(res.data.data.stores || res.data.data);
      } catch (err) {
        console.error('Failed to fetch sellers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  return (
    <main className="flex-1 container py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-heading font-bold mb-4">Our Sellers</h1>
      <p className="text-muted-foreground max-w-lg mx-auto mb-10">
        Browse our network of trusted sellers and independent creators.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={i} className="border-border/50 rounded-2xl bg-white h-full">
              <CardContent className="p-5">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-6" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          sellers.map((seller) => (
            <Card key={seller._id} className="group hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-white flex flex-col h-full">
              <CardContent className="p-5 flex-grow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    {seller.logoUrl && <AvatarImage src={seller.logoUrl} alt={seller.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {seller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">{seller.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span className="text-sm font-medium ml-1">{seller.rating?.toFixed(1) || 5.0}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm truncate">
                        {seller.totalReviews} reviews
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{seller.description}</p>
                <Button variant="outline" className="w-full mt-auto rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-colors h-10 text-sm" asChild>
                  <Link href={`/sellers/${seller._id}`}>
                    Visit Store
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
