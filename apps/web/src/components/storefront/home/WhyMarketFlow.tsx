import React from 'react';
import { ShieldCheck, Truck, RefreshCcw, Award } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Your information is safe',
  },
  {
    icon: Award,
    title: 'Verified Sellers',
    description: 'Only trusted brands & sellers',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your orders on time',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    description: 'Hassle free returns',
  },
];

export function WhyMarketFlow() {
  return (
    <section className="py-10 bg-white border-t border-border/50 relative overflow-hidden">
      {/* Decorative leaf shapes */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-32 bg-[#166534] rounded-r-full opacity-10"></div>
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-32 bg-[#166534] rounded-l-full opacity-10"></div>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="lg:w-1/4 text-center lg:text-left">
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-foreground mb-1">Why MarketFlow?</h2>
            <p className="text-sm text-muted-foreground">
              A better way to shop, built for you.
            </p>
          </div>

          <div className="lg:w-3/4 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                  <div className="p-3 bg-[#FAF8F2] border border-border/50 rounded-full text-primary shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
