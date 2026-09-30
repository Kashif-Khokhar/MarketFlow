"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { PackagePlus, ArrowRight, Trash2, Link as LinkIcon, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importUrl, setImportUrl] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data.categories);
        if (res.data.data.categories.length > 0) {
          setCategoryId(res.data.data.categories[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleImportImage = () => {
    if (!importUrl) return;
    setImageUrls([...imageUrls, importUrl]);
    setImportUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...filesArray]);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        basePrice: parseFloat(basePrice),
        category: categoryId,
        images: imageUrls,
        variants: [
          {
            sku: `SKU-${Date.now()}`,
            price: parseFloat(basePrice),
            stock: parseInt(stock, 10),
            attributes: { "Default": "Standard" }
          }
        ]
      };

      const res = await api.post('/products', payload);
      const newProductId = res.data.data.product._id;

      // Upload files if any exist
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });

        await api.patch(`/products/${newProductId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Product published successfully!');
      router.push('/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl mx-auto space-y-8">
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#FAF8F2] border-b border-border/40 pb-6 text-center md:text-left">
          <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-inner">
              <PackagePlus size={20} />
            </div>
            <CardTitle className="text-3xl font-heading font-bold text-[#166534]">
              Add New Product
            </CardTitle>
          </div>
          <p className="text-muted-foreground ml-0 md:ml-13">
            List a new product in your store to start selling.
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input 
                label="Product Name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
                placeholder="e.g., Premium Leather Jacket"
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#166534] transition-colors resize-none" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required
                  placeholder="Describe your product's features, benefits, and details..."
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
                  placeholder="0.00"
                />
                
                <Input 
                  label="Initial Stock Quantity" 
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
            </div>

            <div className="pt-6 border-t border-border/50">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-[#166534]" /> Product Images
              </h3>
              
              {/* Image Preview Grid */}
              {(imageUrls.length > 0 || selectedFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {imageUrls.map((url, i) => (
                    <div key={`url-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-white">
                      <img src={url} alt={`URL ${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImageUrl(i)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedFiles.map((file, i) => (
                    <div key={`file-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-white">
                      <img src={URL.createObjectURL(file)} alt={`File ${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeFile(i)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Controls */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <UploadCloud size={16} className="text-[#166534]" /> Upload from Device
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileChange} 
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="w-full">
                      <Button type="button" variant="outline" className="w-full h-11 border-dashed border-2 hover:bg-[#FAF8F2] hover:text-[#166534] hover:border-[#166534] transition-colors cursor-pointer" style={{ pointerEvents: 'none' }}>
                        Browse Files
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
                    <Button type="button" onClick={handleImportImage} disabled={!importUrl} className="h-11 bg-[#E08A3E] hover:bg-[#C27330] text-white">
                      Add URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#166534] hover:bg-[#14532D] text-white shadow-sm font-semibold h-11 px-8 rounded-xl flex items-center justify-center gap-2">
                {loading ? 'Publishing Product...' : (
                  <>Publish Product <ArrowRight size={18} /></>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
