import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function DealsSection() {
  return (
    <section className="py-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#D77C38] to-[#C76426] overflow-hidden shadow-md relative">
          
          {/* Background decorative leaves (optional, using CSS shapes for now) */}
          <div className="absolute right-[40%] top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-10 bottom-0 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-stretch">
            <div className="p-6 md:p-8 flex flex-col justify-center items-start w-full md:w-1/2 z-10 relative">
              <div className="text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
                Limited Time Offer
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2 lg:mb-3 leading-tight">
                Up to 50% Off <br /> Top Brands
              </h2>
              <p className="text-white/90 text-xs md:text-sm mb-5 max-w-sm leading-relaxed">
                Don't miss out on amazing deals from our trusted sellers.
              </p>
              <Button size="default" className="font-semibold bg-white text-[#C76426] hover:bg-white/90 rounded-full px-6 h-10" asChild>
                <Link href="/deals">
                  Shop Deals &rarr;
                </Link>
              </Button>
            </div>
            
            <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-[380px] flex items-end justify-end">
              {/* Promo Image */}
              <div className="absolute inset-0 w-full h-full z-10">
                <img 
                  src="/promo_sneaker_bag.jpg" 
                  alt="Promo items: sneaker, backpack, smartwatch" 
                  className="w-full h-full object-cover object-[center_70%] mix-blend-multiply"
                />
              </div>

              {/* Save Big Badge */}
              <div className="absolute top-4 right-4 md:top-6 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-[#C76426] border-[3px] border-[#D77C38] text-white rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 z-20">
                <span className="text-[10px] md:text-xs font-bold leading-none">Save</span>
                <span className="text-sm md:text-base font-extrabold leading-none">Big</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
