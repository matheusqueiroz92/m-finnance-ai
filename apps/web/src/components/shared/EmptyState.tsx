import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center mt-12">
      {icon && 
        <div className={`mb-4 ${isDark ? "text-zinc-400" : "text-gray-900"}`}>
          {icon}
        </div>
      }
      
      <h3 className={`mb-2 text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      
      <p className={`mb-6 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className={`rounded-full ${isDark ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
