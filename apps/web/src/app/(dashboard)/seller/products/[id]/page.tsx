"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Package, Trash2, Link as LinkIcon, UploadCloud, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  
  // Image URL import state
  const [importUrl, setImportUrl] = useState('');

  const fetchData = async () => {
    try {
      const catRes = await api.get('/categories');
      setCategories(catRes.data.data.categories);

      const res = await api.get(`/products/id/${productId}`);
      const found = res.data.data.product;
      const variants = res.data.data.variants;
      
      if (found) {
        setProduct(found);
        setName(found.name);
        setDescription(found.description);
        setBasePrice(found.basePrice.toString());
        setCategoryId(found.category?._id || found.category);
        
        if (variants && variants.length > 0) {
          setStock(variants[0].stock.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleUpdateDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUpdating(true);

    try {
      await api.patch(`/products/${productId}`, {
        name,
        description,
        basePrice: parseFloat(basePrice),
        category: categoryId,
      });

      await api.patch(`/products/${productId}/stock`, {
        stock: parseInt(stock, 10)
      });
      
      toast.success('Product details updated successfully!');
      fetchData(); // refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update details');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }

    setUploading(true);

    try {
      await api.patch(`/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Images uploaded successfully!');
      fetchData(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleImportImage = async () => {
    if (!importUrl) return;
    try {
      const newImages = [...(product.images || []), importUrl];
      await api.patch(`/products/${productId}`, { images: newImages });
      toast.success('Image imported successfully!');
      setImportUrl('');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to import image URL.');
    }
  };

  const handleDeleteImage = async (indexToDelete: number) => {
    if (!product.images) return;
    try {
      const newImages = product.images.filter((_: string, i: number) => i !== indexToDelete);
      await api.patch(`/products/${productId}`, { images: newImages });
      toast.success('Image deleted successfully!');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete image.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#166534] font-medium animate-pulse">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Product not found.
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-inner">
                <Package size={20} />
              </div>
              <CardTitle className="text-3xl font-heading font-bold text-[#166534]">
                Manage {product.name}
              </CardTitle>
            </div>
            <Button variant="ghost" onClick={() => router.push('/seller/products')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} className="mr-2" /> Back to Products
            </Button>
          </div>
          <p className="text-muted-foreground ml-0 md:ml-13">
            Update product details and manage the image gallery.
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-10">
          
          {/* Image Grid Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-[#166534]" /> Product Images
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {product.images?.map((img: string, i: number) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-white">
                  <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleDeleteImage(i)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {(!product.images || product.images.length === 0) && (
                <div className="col-span-full py-12 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                  <ImageIcon size={32} className="mb-2 text-border" />
                  <p>No images uploaded yet.</p>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex flex-col sm:flex-row gap-6 pt-6 mt-6 border-t border-border/50">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <UploadCloud size={16} className="text-[#166534]" /> Upload from Device
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload} 
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="w-full">
                    <Button variant="outline" className="w-full h-11 border-dashed border-2 hover:bg-[#FAF8F2] hover:text-[#166534] hover:border-[#166534] transition-colors cursor-pointer" style={{ pointerEvents: 'none' }} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Browse Files (Max 5)'}
                    </Button>
                  </label>
                </div>
              </div>

              <div className="hidden sm:block w-px bg-border/50"></div>

              <div className="flex-1 space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <LinkIcon size={16} className="text-[#E08A3E]" /> Import from URL
                </label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-11 bg-muted/30 border-border/60 focus-visible:ring-[#E08A3E]"
                  />
                  <Button onClick={handleImportImage} disabled={!importUrl} className="h-11 bg-[#E08A3E] hover:bg-[#C27330] text-white">
                    Import
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="pt-8 border-t border-border/50">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Package size={20} className="text-[#166534]" /> Edit Details
            </h3>
            
            <form onSubmit={handleUpdateDetails} className="space-y-6">
              <Input 
                label="Product Name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#166534] transition-colors resize-none" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                  label="Base Price ($)" 
                  type="number" 
                  step="0.01" 
                  value={basePrice} 
                  onChange={(e) => setBasePrice(e.target.value)} 
                  required 
                  className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
                />
                
                <Input 
                  label="Stock Quantity" 
                  type="number" 
                  step="1" 
                  min="0"
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)} 
                  required 
                  className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger className="bg-muted/30 border-border/60 focus:ring-[#166534] w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <Button type="submit" disabled={updating} className="w-full sm:w-auto bg-[#166534] hover:bg-[#14532D] text-white shadow-sm font-semibold h-11 px-8 rounded-xl flex items-center justify-center gap-2">
                  {updating ? 'Saving...' : (
                    <>Save Changes <Save size={18} /></>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
