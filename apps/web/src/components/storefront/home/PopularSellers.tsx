import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const mockSellers = [
  { id: '1', name: 'TechStore', rating: 4.8, reviews: '12.4k', feedback: '98%', color: 'bg-[#0B3D2B]', initial: 'TS' },
  { id: '2', name: 'FashionHub', rating: 4.7, reviews: '8.0k', feedback: '96%', color: 'bg-[#E08A3E]', initial: 'FH' },
  { id: '3', name: 'HomeEssentials', rating: 4.6, reviews: '5.3k', feedback: '94%', color: 'bg-[#D77C38]', initial: 'HE' },
  { id: '4', name: 'BeautyWorld', rating: 4.8, reviews: '5.7k', feedback: '97%', color: 'bg-[#E298B0]', initial: 'BW' },
  { id: '5', name: 'SportsZone', rating: 4.5, reviews: '4.2k', feedback: '92%', color: 'bg-[#C76426]', initial: 'SZ' },
];

export function PopularSellers({ dbSellers = [], loading = false }: { dbSellers?: any[], loading?: boolean }) {
  return (
    <section className="py-10 bg-[#FAF8F2]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-foreground mb-1">Popular Sellers</h2>
            <p className="text-sm text-muted-foreground">Top rated and most trusted sellers on MarketFlow</p>
          </div>
          <Link href="/sellers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {mockSellers.map((seller) => {
            const dbSeller = dbSellers.find(s => s.name.toLowerCase() === seller.name.toLowerCase());
            
            const displayRating = dbSeller ? dbSeller.rating.toFixed(1) : seller.rating;
            const displayReviews = dbSeller ? `${dbSeller.totalReviews}` : seller.reviews;

            return (
              <Card key={seller.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-white flex flex-col h-full">
                <CardContent className="p-5 flex-grow flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                      <AvatarFallback className={`${seller.color} text-white font-bold text-sm md:text-base`}>
                        {seller.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors">
                        {seller.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-accent text-accent shrink-0" />
                        <span className="text-xs font-bold text-foreground">
                          {loading ? '...' : displayRating}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          ({loading ? '...' : displayReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground mb-4">
                    <span className="font-medium text-foreground">{seller.feedback}</span> positive feedback
                  </div>
                  
                  <div className="mt-auto">
                    <Button variant="default" size="sm" className="w-full rounded-full bg-primary hover:bg-primary/90 text-xs font-medium h-8" asChild>
                      <Link href={`/sellers/${seller.id}`}>
                        View Store &rarr;
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
