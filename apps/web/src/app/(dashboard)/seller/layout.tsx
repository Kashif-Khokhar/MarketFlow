"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { Store, LayoutDashboard, Package, ShoppingBag, Settings } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  const navItems = [
    { name: 'Overview', href: '/seller', icon: LayoutDashboard },
    { name: 'Products', href: '/seller/products', icon: Package },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 sm:px-6 lg:px-8 pb-16">
      {/* Seller Sidebar Navigation */}
      {isSeller && (
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-[#FAF8F2] border border-border/50 rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/40">
              <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-inner">
                <Store size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#166534] leading-tight">Store Manager</h3>
                <p className="text-xs text-muted-foreground font-medium">Seller Dashboard</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/seller' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#166534] text-white shadow-md shadow-[#166534]/20 translate-x-1' 
                        : 'text-muted-foreground hover:bg-[#166534]/5 hover:text-[#166534] hover:translate-x-1'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-[#E08A3E]'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
