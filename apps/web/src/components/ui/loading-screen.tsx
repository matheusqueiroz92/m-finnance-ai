'use client';

import React from 'react';
import { Spinner } from './spinner';
import Image from 'next/image';
import Logo from '../../../public/images/logo-m-finnance-ai-2.png';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-[#1a2329] flex items-center justify-center z-50">
      <div className="text-center flex flex-col items-center">
        <Image
          src={Logo}
          alt="M. Finnance AI"
          width={200}
          height={200}
          priority
          style={{ width: "auto", height: "auto" }}
        />
        <div className="mt-8">
          <Spinner size="md" color="primary" />
          <p className="mt-4 text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}