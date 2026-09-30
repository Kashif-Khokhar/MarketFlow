"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminStoreProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/stores/${unwrappedParams.id}/products`);
      setProducts(res.data.data.products);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch store products:', err);
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [unwrappedParams.id]);

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexDirection: 'column' }}>
        <Link href="/admin/stores">
          <Button variant="outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            &larr; Back to Stores
          </Button>
        </Link>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Store Products</h2>
          <p style={{ color: 'var(--text-secondary)' }}>View all products listed under this store.</p>
        </div>
      </header>

      {error && (
        <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}

      <Card className="p-8">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-primary)' }}>Loading products...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Product Name</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Price</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.category?.name || 'N/A'}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)' }}>${product.basePrice.toFixed(2)}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        background: product.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : product.status === 'DRAFT' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                        color: product.status === 'ACTIVE' ? '#10b981' : product.status === 'DRAFT' ? '#3b82f6' : 'var(--text-secondary)',
                        padding: '0.3rem 0', minWidth: '90px', display: 'inline-block', textAlign: 'center', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {product.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {product.rating.toFixed(1)} ({product.totalReviews})
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No products found for this store.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
