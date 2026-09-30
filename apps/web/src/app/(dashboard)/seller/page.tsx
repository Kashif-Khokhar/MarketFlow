"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Store, ArrowRight, TrendingUp } from 'lucide-react';

export default function SellerPage() {
  const { user } = useAuth();
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  // State for store creation
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // State for stats
  const [stats, setStats] = useState<{ totalRevenue: number, pendingOrders: number } | null>(null);

  useEffect(() => {
    if (isSeller) {
      api.get('/dashboard/seller')
        .then(res => {
          setStats({
            totalRevenue: res.data.data.totalRevenue || 0,
            pendingOrders: res.data.data.pendingOrders || 0,
          });
        })
        .catch(err => console.error('Failed to fetch stats', err));
    }
  }, [isSeller]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/sellers/store', { name, description });
      // Reload page to refresh role from AuthContext/Session
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (!isSeller) {
    return (
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-[#FAF8F2] border-b border-border/40 pb-6 text-center">
              <div className="w-16 h-16 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Store size={32} className="text-white" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold text-[#166534]">
                Open Your Store
              </CardTitle>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Ready to start selling? Create your store to upgrade your account to a Seller.
              </p>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateStore} className="space-y-6">
                <Input 
                  label="Store Name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
                  placeholder="E.g., Tech Haven"
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Store Description</label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#166534] transition-colors resize-none" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required
                    placeholder="Tell customers what your store is about..."
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full bg-[#166534] hover:bg-[#14532D] text-white shadow-sm font-semibold h-11 rounded-xl flex items-center gap-2">
                    {loading ? 'Creating Store...' : (
                      <>Create Store <ArrowRight size={18} /></>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your store manager. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Sales Card */}
        <Card className="rounded-2xl border-none bg-gradient-to-br from-[#166534] to-[#0f4624] text-white shadow-md relative overflow-hidden group">
          <div className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <DollarSign size={24} className="text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                <TrendingUp size={12} /> +12%
              </div>
            </div>
            <h3 className="text-white/80 font-medium mb-1">Total Sales</h3>
            <p className="text-4xl font-bold">
              ${stats ? stats.totalRevenue.toFixed(2) : '0.00'}
            </p>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
        </Card>

        {/* Pending Orders Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden group bg-white">
          <div className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#E08A3E]/10 rounded-xl flex items-center justify-center border border-[#E08A3E]/20">
                <ShoppingBag size={24} className="text-[#E08A3E]" />
              </div>
            </div>
            <h3 className="text-muted-foreground font-medium mb-1">Pending Orders</h3>
            <p className="text-4xl font-bold text-foreground">
              {stats ? stats.pendingOrders : '0'}
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
