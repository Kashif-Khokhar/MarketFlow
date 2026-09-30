"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { HeroSection } from '@/components/storefront/home/HeroSection';
import { CategorySection } from '@/components/storefront/home/CategorySection';
import { FeaturedProducts } from '@/components/storefront/home/FeaturedProducts';
import { DealsSection } from '@/components/storefront/home/DealsSection';
import { PopularSellers } from '@/components/storefront/home/PopularSellers';
import { WhyMarketFlow } from '@/components/storefront/home/WhyMarketFlow';

const SectionDivider = () => (
  <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <hr className="border-border/40" />
  </div>
);

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbSellers, setDbSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, selRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/sellers/store/public')
        ]);
        setProducts(prodRes.data.data.products);
        setDbCategories(catRes.data.data.categories || catRes.data.data);
        setDbSellers(selRes.data.data.stores || selRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="flex-1 flex flex-col w-full bg-white">
      <HeroSection />
      
      <CategorySection dbCategories={dbCategories} loading={loading} />
      
      <SectionDivider />
      
      <FeaturedProducts 
        products={products} 
        loading={loading} 
        title="Trending Products"
        description="Most loved products by our customers"
      />
      
      <SectionDivider />
      
      <DealsSection />
      
      <PopularSellers dbSellers={dbSellers} loading={loading} />
      
      <WhyMarketFlow />
      
      <FeaturedProducts 
        products={products ? [...products].reverse() : []} 
        loading={loading} 
        title="Recommended for You"
        description="Handpicked products based on your interests"
        viewAllLink="/products"
      />
    </main>
  );
}
