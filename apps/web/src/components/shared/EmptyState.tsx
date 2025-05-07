import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-500">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
