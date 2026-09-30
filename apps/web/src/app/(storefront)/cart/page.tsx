"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuantitySelector } from '@/components/marketplace/QuantitySelector';
import { api, getImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.data.cart);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCart(null);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchCart();
      }
    }
  }, [user, authLoading, router]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.patch(`/cart/items/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    
    try {
      const shippingAddressId = user?.addresses?.[0]?._id;
      if (!shippingAddressId) {
        toast.error('Please add a shipping address in your profile before checking out.');
        setCheckingOut(false);
        return;
      }

      await api.post('/orders', {
        shippingAddressId
      });
      toast.success('Order placed successfully!');
      setCart(null);
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (authLoading || loading) return <div className="text-center mt-16 text-primary animate-pulse">Loading...</div>;

  return (
    <main className="flex-1 container py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-8">Your Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold text-muted-foreground mb-6">Your cart is empty</h2>
              <Link href="/">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => {
                const itemPrice = item.variant?.price || 0;
                return (
                  <Card key={item._id} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-md bg-muted overflow-hidden">
                         {item.product?.images?.[0] && (
                           <img 
                             src={getImageUrl(item.product.images[0])} 
                             alt={item.product.name} 
                             className="w-full h-full object-cover" 
                           />
                         )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product?.slug}`}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                            {item.product?.name || 'Unknown Product'}
                          </h3>
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Variant: {item.variant.sku}
                          </p>
                        )}
                        <div className="mt-4 sm:mt-2">
                          <QuantitySelector 
                            quantity={item.quantity} 
                            onChange={(q) => handleUpdateQuantity(item._id, q)} 
                          />
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-4">
                        <span className="font-bold text-lg">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${cart.items.reduce((acc: number, item: any) => acc + (item.variant?.price || 0) * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-success">Free</span>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-primary">
                      ${cart.items.reduce((acc: number, item: any) => acc + (item.variant?.price || 0) * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout} 
                    disabled={checkingOut}
                  >
                    {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                </CardFooter>
              </Card>
            </div>

          </div>
        )}
      </main>
  );
}
