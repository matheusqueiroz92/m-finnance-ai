'use client';

import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand
      visibleToasts={3}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
};