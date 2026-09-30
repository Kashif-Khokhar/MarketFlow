import React from 'react';
import { StorefrontNavbar } from '@/components/layout/StorefrontNavbar';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StorefrontNavbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <StorefrontFooter />
    </div>
  );
}
