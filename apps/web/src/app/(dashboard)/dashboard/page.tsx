"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Package, ShieldCheck, Wallet, Activity, CreditCard, Store, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="space-y-6 py-8 px-4 sm:px-6 lg:px-8 pb-16 w-full max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="relative overflow-hidden border-border/50 shadow-sm bg-gradient-to-br from-[#166534] to-[#0f4624] text-white rounded-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Store size={200} className="transform rotate-12 translate-x-12 -translate-y-12" />
          </div>
          
          <div className="relative z-10 p-8 md:p-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-6 backdrop-blur-sm">
              Dashboard Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3 tracking-tight">
              Welcome back, <span className="text-[#E08A3E]">{user?.name || 'Shopper'}</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
              Here's what's happening with your account today. You can manage your profile, view recent activity, or upgrade to a Seller account.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/profile" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-[#166534] font-semibold text-sm hover:bg-[#FAF8F2] transition-colors shadow-sm">
                Manage Profile <ArrowRight size={16} className="ml-2" />
              </Link>
              {user?.role !== 'SELLER' && (
                <Link href="/seller" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 backdrop-blur-sm transition-colors">
                  <Store size={16} className="mr-2" /> Become a Seller
                </Link>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial="hidden" animate="visible" variants={staggerContainer}
      >
        <motion.div variants={fadeIn}>
          <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow group bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <div className="p-2.5 bg-[#E08A3E]/10 rounded-xl text-[#E08A3E] group-hover:scale-110 transition-transform">
                  <Wallet size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">$0.00</h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow group bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                <div className="p-2.5 bg-[#166534]/10 rounded-xl text-[#166534] group-hover:scale-110 transition-transform">
                  <CreditCard size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">$0.00</h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow group bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-muted-foreground">Activity Status</p>
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Low</h3>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial="hidden" animate="visible" variants={staggerContainer}
      >
        {/* Recent Orders - 2/3 width */}
        <motion.div variants={fadeIn} className="lg:col-span-2">
          <Card className="h-full rounded-2xl border-border/50 shadow-sm bg-white overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-[#FAF8F2]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Package size={20} />
                </div>
                <h3 className="font-semibold text-lg">Recent Orders</h3>
              </div>
              <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#FAF8F2] flex items-center justify-center mb-6 text-muted-foreground">
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">No recent orders</h4>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't placed any orders yet. Discover our premium selection and find something you love.
              </p>
              <Link href="/categories" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                Start Shopping
              </Link>
            </div>
          </Card>
        </motion.div>
        
        {/* Account Details - 1/3 width */}
        <motion.div variants={fadeIn}>
          <Card className="h-full rounded-2xl border-border/50 shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-[#FAF8F2]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E08A3E]/10 rounded-lg text-[#E08A3E]">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-semibold text-lg">Account</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#FAF8F2] rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#166534] to-[#E08A3E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Status</p>
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-foreground">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Role</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {user?.role || 'USER'}
                  </span>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
                  Update Settings <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
