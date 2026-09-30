import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export const StorefrontFooter = () => {
  return (
    <footer className="bg-[#0f4624] text-white border-t-4 border-[#E08A3E] mt-auto">
      <div className="container max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 pr-4">
            <Link href="/" className="flex items-center mb-8 mt-2 group overflow-visible">
              <img 
                src="/logo.png" 
                alt="MarketFlow" 
                className="h-14 lg:h-16 w-auto object-contain scale-[1.5] lg:scale-[1.8] origin-left transition-all duration-300" 
                style={{ filter: 'drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.9)) drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.6))' }}
              />
            </Link>
            <p className="text-white/70 mb-8 text-sm leading-relaxed max-w-sm">
              MarketFlow is your premium destination for the finest products. We believe in connecting quality sellers with discerning buyers in a seamless marketplace. More Choices, Better Living.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E08A3E] border border-white/10 hover:border-[#E08A3E] flex items-center justify-center transition-all duration-300">
                <Facebook size={18} className="text-white/80" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E08A3E] border border-white/10 hover:border-[#E08A3E] flex items-center justify-center transition-all duration-300">
                <Instagram size={18} className="text-white/80" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E08A3E] border border-white/10 hover:border-[#E08A3E] flex items-center justify-center transition-all duration-300">
                <Twitter size={18} className="text-white/80" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E08A3E] border border-white/10 hover:border-[#E08A3E] flex items-center justify-center transition-all duration-300">
                <Linkedin size={18} className="text-white/80" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-white mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#E08A3E]"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center"><ArrowRight size={14} className="mr-2 text-[#E08A3E] opacity-0 -ml-6 transition-all" /> Home</Link></li>
              <li><Link href="/categories" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center"><ArrowRight size={14} className="mr-2 text-[#E08A3E] opacity-0 -ml-6 transition-all" /> Categories</Link></li>
              <li><Link href="/deals" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center"><ArrowRight size={14} className="mr-2 text-[#E08A3E] opacity-0 -ml-6 transition-all" /> Deals</Link></li>
              <li><Link href="/new-arrivals" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center"><ArrowRight size={14} className="mr-2 text-[#E08A3E] opacity-0 -ml-6 transition-all" /> New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-white mb-6 relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#E08A3E]"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/help" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Help Center</Link></li>
              <li><Link href="/shipping" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Contact Us</Link></li>
            </ul>
          </div>

          {/* Join Our Newsletter */}
          <div className="lg:col-span-4">
             <h3 className="font-heading font-bold text-lg text-white mb-6 relative inline-block">
               Newsletter
               <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#E08A3E]"></span>
             </h3>
             <p className="text-sm text-white/70 mb-6 leading-relaxed">
               Subscribe to our newsletter to get the latest updates, exclusive deals, and special offers directly in your inbox.
             </p>
             <form className="relative flex items-center">
               <Input 
                 type="email" 
                 placeholder="Your email address" 
                 className="pr-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#E08A3E] focus-visible:border-transparent rounded-xl h-12 w-full shadow-inner" 
               />
               <Button type="submit" size="icon" className="absolute right-1.5 h-9 w-9 rounded-lg bg-[#E08A3E] hover:bg-[#C27330] text-white transition-colors">
                 <ArrowRight className="h-4 w-4" />
               </Button>
             </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>
            &copy; {new Date().getFullYear()} MarketFlow. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
