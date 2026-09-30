"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--accent-primary)' }}>Forgot Password</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      {message && <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="Enter your email"
        />
        <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '1rem' }}>
          Send Reset Link
        </Button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <p>
          Remember your password? <Link href="/login">Login</Link>
        </p>
      </div>
    </Card>
  );
}
