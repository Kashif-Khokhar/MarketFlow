"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please check your connection to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in" style={{ maxWidth: '450px', width: '100%', margin: '0 auto', padding: '2.5rem' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700 }} className="text-gradient">Create Account</h1>
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <Input 
          label="Name" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          placeholder="Enter your name"
        />
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
          minLength={8}
          placeholder="Create a password"
        />
        <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '1rem' }}>
          Sign Up
        </Button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </Card>
  );
}
