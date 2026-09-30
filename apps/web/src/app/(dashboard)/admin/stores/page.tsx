"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stores');
      setStores(res.data.data.stores);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch stores:', err);
      setError(err.response?.data?.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Manage Stores</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View stores created by sellers on the platform.</p>
      </header>

      {error && (
        <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}

      <Card className="p-8">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-primary)' }}>Loading stores...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Store Name</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Owner Email</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Rating</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.owner?.email || 'N/A'}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        background: store.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : store.status === 'PENDING' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: store.status === 'ACTIVE' ? '#10b981' : store.status === 'PENDING' ? '#3b82f6' : '#ef4444',
                        padding: '0.3rem 0', minWidth: '90px', display: 'inline-block', textAlign: 'center', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {store.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {store.rating.toFixed(1)} ({store.totalReviews})
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <Link href={`/admin/stores/${store._id}/products`}>
                        <Button 
                          variant="outline" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          View Products
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No stores found.
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
