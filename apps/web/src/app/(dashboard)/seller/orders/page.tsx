"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/seller-orders');
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error('Failed to fetch seller orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/seller-orders/${orderId}/status`, { status });
      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error('Failed to update order status', err);
      alert('Failed to update order status');
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <Card className="p-8">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Incoming Orders</h2>

      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>You haven't received any orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Order ID:</span>
                  <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>{order._id}</span>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Customer: </span>
                    <span>{order.customer?.name} ({order.customer?.email})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {order.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'PROCESSING')}
                        style={{ padding: '0.4rem 1rem', borderRadius: '4px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'CANCELLED')}
                        style={{ padding: '0.4rem 1rem', borderRadius: '4px', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      style={{ 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '1rem', 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="PROCESSING" style={{ color: 'black' }}>PROCESSING</option>
                      <option value="SHIPPED" style={{ color: 'black' }}>SHIPPED</option>
                      <option value="DELIVERED" style={{ color: 'black' }}>DELIVERED</option>
                      <option value="CANCELLED" style={{ color: 'black' }}>CANCELLED</option>
                    </select>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.quantity}x {item.name || 'Product'}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <span>Shipping:</span>
                  <span>${order.shippingFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    Total:
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
