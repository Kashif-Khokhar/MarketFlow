"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in" style={{ maxWidth: '450px', width: '100%', margin: '0 auto', padding: '2.5rem' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700 }} className="text-gradient">Welcome Back</h1>
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="Enter your email"
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          placeholder="Enter your password"
        />
        <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '1rem' }}>
          Login
        </Button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <p style={{ marginBottom: '0.5rem' }}>
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
        <p>
          Don't have an account? <Link href="/register">Sign up</Link>
        </p>
      </div>
    </Card>
  );
}
