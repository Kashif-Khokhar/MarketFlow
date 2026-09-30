import React from 'react';
import Link from 'next/link';
import { Smartphone, Shirt, Sofa, Flower, Dumbbell, Gamepad2, ShoppingBasket, LayoutGrid } from 'lucide-react';

const categories = [
  { id: '1', name: 'Electronics', icon: Smartphone, items: '1.2k+', slug: 'electronics' },
  { id: '2', name: 'Fashion', icon: Shirt, items: '2.4k+', slug: 'fashion' },
  { id: '3', name: 'Home & Living', icon: Sofa, items: '980+', slug: 'home-and-living' },
  { id: '4', name: 'Beauty', icon: Flower, items: '760+', slug: 'beauty' },
  { id: '5', name: 'Sports', icon: Dumbbell, items: '540+', slug: 'sports' },
  { id: '6', name: 'Toys & Games', icon: Gamepad2, items: '420+', slug: 'toys-and-games' },
  { id: '7', name: 'Groceries', icon: ShoppingBasket, items: '1.1k+', slug: 'groceries' },
  { id: '8', name: 'More', icon: LayoutGrid, items: '3.5k+', slug: 'categories' },
];

export function CategorySection({ dbCategories = [], loading = false }: { dbCategories?: any[], loading?: boolean }) {
  return (
    <section className="py-10 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground tracking-tight">Shop by Category</h2>
          <Link href="/categories" className="hidden sm:inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6">
          {categories.map((category) => {
            let displayItems = category.items;
            
            if (category.name === 'More') {
              const totalProducts = dbCategories.reduce((acc, c) => acc + (c.productCount || 0), 0);
              displayItems = `${totalProducts}+ items`;
            } else {
              const dbCat = dbCategories.find(c => c.name.toLowerCase() === category.name.toLowerCase());
              if (dbCat && dbCat.productCount !== undefined) {
                displayItems = `${dbCat.productCount}+ items`;
              }
            }

            return (
              <Link 
                key={category.id} 
                href={`/${category.slug === 'categories' ? 'categories' : 'categories/' + category.slug}`}
                className="flex flex-col items-center group text-center"
              >
                <div className="w-full aspect-square rounded-2xl bg-[#FAF8F2] flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-border/50">
                  <category.icon className="w-10 h-10 text-primary stroke-[1.5]" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : displayItems}
                </p>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
