import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
}

export function Spinner({ 
  className, 
  size = 'md', 
  color = 'primary',
  ...props 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'text-emerald-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor'
        }}
      />
    </div>
  );
}

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({ 
  message = 'Carregando...', 
  fullScreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  if (fullScreen || overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="md" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}