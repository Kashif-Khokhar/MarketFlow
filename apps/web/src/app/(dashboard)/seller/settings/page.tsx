"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Settings, UploadCloud, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function StoreSettingsPage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStore = async () => {
    try {
      const res = await api.get('/sellers/store');
      setStore(res.data.data.store);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('logo', file);

    setUploading(true);

    try {
      const res = await api.patch('/sellers/store/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStore(res.data.data.store);
      toast.success('Store logo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#166534] font-medium animate-pulse">Loading settings...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Store not found. Please create a store first.
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl mx-auto">
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#FAF8F2] border-b border-border/40 pb-6 text-center md:text-left">
          <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-inner">
              <Settings size={20} />
            </div>
            <CardTitle className="text-3xl font-heading font-bold text-[#166534]">
              Store Settings
            </CardTitle>
          </div>
          <p className="text-muted-foreground ml-0 md:ml-13">
            Manage your store's profile, branding, and details.
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="w-32 h-32 shrink-0 rounded-2xl bg-muted/30 border border-border/60 shadow-inner overflow-hidden flex items-center justify-center relative group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-muted-foreground/50 flex flex-col items-center">
                  <Store size={40} className="mb-2" />
                  <span className="text-xs font-semibold uppercase tracking-wider">No Logo</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={24} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-lg">{store.name}</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-1 leading-relaxed">
                  {store.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="pt-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="bg-[#E08A3E] hover:bg-[#C27330] text-white shadow-sm font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Change Store Logo'}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground font-medium">
                  Recommended size: 500x500px (JPG, PNG)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
