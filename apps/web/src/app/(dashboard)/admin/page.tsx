"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of platform activity.</p>
      </header>

      <Card className="p-8">
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Welcome to the Admin Portal</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          This portal allows you to manage users, monitor platform metrics, and oversee operations.
        </p>
      </Card>
    </div>
  );
}
