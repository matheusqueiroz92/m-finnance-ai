import React from 'react';
import { Spinner } from './spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, message = 'Processando...', children }: LoadingOverlayProps) {
  return (
    <>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </>
  );
}