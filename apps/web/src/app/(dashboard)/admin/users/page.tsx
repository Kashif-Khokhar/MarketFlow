"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data.users);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const endpoint = isActive ? `/admin/users/${userId}/suspend` : `/admin/users/${userId}/reactivate`;
      await api.patch(endpoint);
      // Refresh user list
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Manage Users</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View, suspend, or reactivate user accounts across the platform.</p>
      </header>

      {error && (
        <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}

      <Card className="p-8">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-primary)' }}>Loading users...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Name</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Role</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ width: '20%', padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)' }}>{user.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        background: user.role === 'ADMIN' ? 'rgba(168, 85, 247, 0.2)' : user.role === 'SELLER' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.15)',
                        color: user.role === 'ADMIN' ? '#c084fc' : user.role === 'SELLER' ? '#60a5fa' : 'var(--text-secondary)',
                        padding: '0.3rem 0', minWidth: '90px', display: 'inline-block', textAlign: 'center', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        background: user.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: user.isActive ? '#10b981' : '#ef4444',
                        padding: '0.3rem 0', minWidth: '90px', display: 'inline-block', textAlign: 'center', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <Button 
                        variant={user.isActive ? 'outline' : 'primary'} 
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        {user.isActive ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No users found.
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
