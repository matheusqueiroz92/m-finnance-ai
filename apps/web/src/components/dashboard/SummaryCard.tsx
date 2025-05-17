import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
    text?: string;
  };
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  theme?: string;
}

export function SummaryCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor,
  iconBackground,
  theme
}: SummaryCardProps) {
  return (
    <Card className="border shadow transition-colors duration-200 
                    bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                    border-gray-200 dark:border-white/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-emerald-300">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
            {trend && (
              <p className={`text-xs mt-1 flex items-center 
                            ${trend.isPositive 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V7z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 10-2 0v-5.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L12 7.414V13z" clipRule="evenodd" />
                  </svg>
                )}
                {trend.value}
                {trend.text && <span className="text-gray-500 dark:text-zinc-400 ml-1">{trend.text}</span>}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-full ${iconBackground} flex items-center justify-center transition-colors duration-200`}>
            <Icon className={`h-5 w-5 ${iconColor} transition-colors duration-200`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}