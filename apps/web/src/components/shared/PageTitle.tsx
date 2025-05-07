import React from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}