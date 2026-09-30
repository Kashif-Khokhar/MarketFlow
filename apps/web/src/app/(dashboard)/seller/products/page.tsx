"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Package, Plus, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const storeRes = await api.get('/sellers/store');
        const storeId = storeRes.data.data.store._id;

        const prodRes = await api.get(`/products?store=${storeId}`);
        setProducts(prodRes.data.data.products);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'SELLER') fetchProducts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#166534] font-medium animate-pulse">Loading products...</div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-5xl mx-auto">
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#FAF8F2] border-b border-border/40 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-inner">
                <Package size={20} />
              </div>
              <CardTitle className="text-3xl font-heading font-bold text-[#166534]">
                Your Products
              </CardTitle>
            </div>
            <Link href="/seller/products/new">
              <Button className="bg-[#166534] hover:bg-[#14532D] text-white shadow-sm font-semibold rounded-xl flex items-center gap-2 h-11 px-6">
                <Plus size={18} /> Add Product
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground ml-0 md:ml-13 mt-2">
            Manage your store's inventory and view your active listings.
          </p>
        </CardHeader>
        
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                <Package size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Products Yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't listed any products. Add your first product to start selling.
              </p>
              <Link href="/seller/products/new">
                <Button className="bg-[#E08A3E] hover:bg-[#C27330] text-white rounded-xl shadow-sm">
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {products.map((product) => (
                <div key={product._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-6 gap-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted/30 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-semibold text-[#166534] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          ${product.basePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/seller/products/${product._id}`}>
                    <Button variant="outline" className="w-full sm:w-auto h-10 border-border/60 hover:bg-[#FAF8F2] hover:text-[#166534] hover:border-[#166534] transition-colors rounded-lg font-medium group">
                      Manage <ArrowRight size={16} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
