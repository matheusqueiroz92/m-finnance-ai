'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Necessário porque o tema só é disponível no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Retorna um placeholder para evitar layout shift
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 bg-transparent">
        <span className="sr-only">Alternar tema</span>
        <div className="h-5 w-5 rounded-full bg-emerald-300/20"></div>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300"
          >
            <span className="sr-only">Alternar tema</span>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Alternar tema: {theme === 'dark' ? 'Claro' : 'Escuro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}