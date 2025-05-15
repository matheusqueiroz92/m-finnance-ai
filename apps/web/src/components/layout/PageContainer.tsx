'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  backButtonHref?: string;
}

export default function PageContainer({
  title,
  subtitle,
  children,
  showBackButton = true,
  backButtonHref = '/dashboard'
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {showBackButton && (
            <Link href={backButtonHref}>
              <Button variant="ghost" className="mb-6 text-white hover:bg-emerald-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          )}
          
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-emerald-100">{subtitle}</p>}
        </div>
      </div>
      
      <div className="bg-[#25343b]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}