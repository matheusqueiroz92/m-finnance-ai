'use client';

import React from 'react';
import { Spinner } from './spinner';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-[#25343b] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">OFinanceAI</h2>
        <div className="mt-4">
          <Spinner size="md" color="white" />
          <p className="mt-4 text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}