"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { StorefrontNavbar } from '@/components/layout/StorefrontNavbar';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  // Automatically scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Redirecting to login...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <StorefrontNavbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <StorefrontFooter />
    </div>
  );
}
