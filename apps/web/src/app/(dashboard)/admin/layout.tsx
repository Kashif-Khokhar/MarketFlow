"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!isAdmin) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Checking permissions...</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <aside className="glass-panel" style={{ width: '250px', padding: '1.5rem', alignSelf: 'flex-start' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>Admin Portal</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link 
            href="/admin" 
            style={{ color: pathname === '/admin' ? 'var(--accent-primary)' : 'var(--text-primary)' }}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            style={{ color: pathname.startsWith('/admin/users') ? 'var(--accent-primary)' : 'var(--text-primary)' }}
          >
            Manage Users
          </Link>
          <Link 
            href="/admin/stores" 
            style={{ color: pathname.startsWith('/admin/stores') ? 'var(--accent-primary)' : 'var(--text-primary)' }}
          >
            Manage Stores
          </Link>
        </nav>
      </aside>

      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
