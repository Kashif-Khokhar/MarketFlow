"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>Set New Password</h1>

      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      {message && <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="New Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          placeholder="Enter new password"
        />
        <Input 
          label="Confirm Password" 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          placeholder="Confirm new password"
        />
        <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '1rem' }}>
          Reset Password
        </Button>
      </form>
    </Card>
  );
}
