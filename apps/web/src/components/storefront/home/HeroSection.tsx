import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, RefreshCcw, Tag } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 md:pt-10 pb-20 bg-[#FAF8F2]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 animate-in fade-in slide-in-from-left-8 duration-700">
            <p className="text-accent font-semibold tracking-wider text-xs md:text-sm uppercase mb-4">
              Welcome to MarketFlow
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-4">
              Discover Amazing <br className="hidden md:block" /> Products, All in One Place
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed max-w-lg">
              Shop from trusted sellers across multiple categories and enjoy a seamless shopping experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button size="default" className="w-full sm:w-auto font-medium shadow-md transition-transform hover:-translate-y-0.5 rounded-full px-8 bg-primary hover:bg-primary/90 text-sm h-11" asChild>
                <Link href="/products">
                  Shop Now &rarr;
                </Link>
              </Button>
              <Button size="default" variant="outline" className="w-full sm:w-auto font-medium transition-transform hover:-translate-y-0.5 rounded-full px-8 bg-white border-border hover:bg-muted text-sm h-11" asChild>
                <Link href="/categories">
                  Explore Categories
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Best Prices</h4>
                  <p className="text-xs text-muted-foreground">Great deals every day</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Verified Sellers</h4>
                  <p className="text-xs text-muted-foreground">Shop with confidence</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Fast Delivery</h4>
                  <p className="text-xs text-muted-foreground">Across Pakistan</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <RefreshCcw className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Easy Returns</h4>
                  <p className="text-xs text-muted-foreground">Hassle free returns</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="w-full lg:w-1/2 relative animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] max-h-[450px] w-full bg-white/50">
              <img 
                src="/hero_multi_device.jpg" 
                alt="Laptop, headphones, and smartphone" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              
              {/* 50% OFF Badge */}
              <div className="absolute top-4 right-4 lg:top-6 lg:right-6 w-16 h-16 lg:w-20 lg:h-20 bg-accent text-accent-foreground rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 hover:scale-110 transition-transform">
                <span className="text-[9px] lg:text-[10px] uppercase tracking-wider font-semibold opacity-90">Up to</span>
                <span className="text-xl lg:text-2xl font-extrabold leading-none mt-0.5">50%</span>
                <span className="text-[10px] lg:text-xs font-semibold opacity-90">OFF</span>
              </div>

              {/* Carousel Controls */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white rounded-full p-1.5 shadow-md">
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-1 h-1 rounded-full bg-primary/20"></div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Curved bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }}></div>
    </section>
  );
}
