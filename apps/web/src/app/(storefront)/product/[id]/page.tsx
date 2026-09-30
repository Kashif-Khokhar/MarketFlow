"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuantitySelector } from '@/components/marketplace/QuantitySelector';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { Rating } from '@/components/marketplace/Rating';
import { api, getImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const productData = res.data.data.product;
        const variantsData = res.data.data.variants || [];
        
        setProduct({ ...productData, variants: variantsData });
        
        if (variantsData.length > 0) {
          setSelectedVariant(variantsData[0]._id);
        }
        if (productData.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (redirect = false) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      toast.error('Product is currently out of stock.');
      return;
    }

    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    setAddingToCart(true);

    try {
      await api.post('/cart', {
        productId: product._id,
        variantId: selectedVariant,
        quantity: quantity
      });
      if (redirect) {
        router.push('/cart');
      } else {
        toast.success('Added to cart successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const currentVariantPrice = product?.variants?.find((v: any) => v._id === selectedVariant)?.price || product?.basePrice || 0;

  if (loading) return <div className="text-center mt-16 text-primary animate-pulse">Loading...</div>;
  if (!product) return <div className="text-center mt-16 text-destructive">Product not found.</div>;

  return (
    <main className="flex-1 container py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted border border-border">
              {selectedImage ? (
                <img 
                  src={getImageUrl(selectedImage)} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} ${idx+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            <Link href={`/store/${product.store?._id}`} className="text-primary hover:underline text-lg mb-4">
              Store: {product.store?.name || 'Unknown Store'}
            </Link>
            
            <div className="mb-6">
              <Rating rating={4.5} showText className="mb-2" /> {/* Hardcoded rating for UI display */}
            </div>

            <PriceDisplay price={currentVariantPrice} size="xl" className="mb-6" />

            <div className="prose prose-slate dark:prose-invert mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <Card className="p-6 border bg-card">
              <CardContent className="p-0 space-y-6">
                
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Select Variant</label>
                    <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((v: any) => (
                          <SelectItem key={v._id} value={v._id}>
                            {v.sku} - ${v.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium">
                    This product is currently out of stock or unavailable.
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Quantity</label>
                  <QuantitySelector 
                    quantity={quantity} 
                    onChange={setQuantity} 
                    max={product.variants?.find((v: any) => v._id === selectedVariant)?.stock || 1}
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  {user ? (
                    <>
                      <Button 
                        onClick={() => handleAddToCart(false)} 
                        disabled={addingToCart || !product.variants?.length} 
                        className="flex-1" 
                        variant="secondary"
                        size="lg"
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        onClick={() => handleAddToCart(true)} 
                        disabled={addingToCart || !product.variants?.length} 
                        className="flex-1"
                        size="lg"
                      >
                        Buy it Now
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => handleAddToCart()} 
                      disabled={addingToCart} 
                      className="w-full"
                      size="lg"
                    >
                      Login to Buy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
  );
}
