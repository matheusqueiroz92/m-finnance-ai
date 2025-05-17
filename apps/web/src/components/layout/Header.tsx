'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { UserProfileMenu } from '@/components/layout/UserProfileMenu';
import { NotificationsMenu } from '@/components/layout/NotificationsMenu';

// Mapeamento de títulos baseado no pathname
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/wallet': 'Carteira',
  '/transactions': 'Transações',
  '/goals': 'Objetivos',
  '/investimentos': 'Investimentos',
  '/accounts': 'Contas Bancárias',
  '/credit-cards': 'Cartões de Crédito',
  '/settings': 'Configurações',
  '/reports': 'Relatórios',
};

export default function Header() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isDark = theme === 'dark';

  // Função para toggle da sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { isOpen: !isSidebarOpen } }));
  };

  return (
    <header className={`sticky top-0 z-30 w-full backdrop-blur-sm border-b px-4 md:px-6 py-3 transition-colors duration-200
                        ${isDark 
                           ? 'bg-[#25343b]/90 border-white/10' 
                           : 'bg-white/90 border-gray-200'}`}>
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-colors duration-200
                        ${isDark 
                           ? 'text-emerald-300 hover:bg-white/10 hover:text-emerald-200' 
                           : 'text-emerald-600 hover:bg-gray-100 hover:text-emerald-700'}`}
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Barra de pesquisa expandível */}
          <div className={`relative ${isSearchOpen ? 'w-64' : 'w-9'} transition-all duration-300`}>
            {isSearchOpen ? (
              <div className="relative w-full">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 
                                    ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                <Input 
                  type="search" 
                  placeholder="Pesquisar..." 
                  className={`pl-10 pr-10 py-2 h-9 transition-colors duration-200
                              ${isDark 
                                 ? 'bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-emerald-400/20' 
                                 : 'bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-emerald-400 focus:ring-emerald-400/20'}`}
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 transition-colors duration-200
                              ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setIsSearchOpen(false)}
                >
                  <span className="sr-only">Fechar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 rounded-full transition-colors duration-200
                            ${isDark 
                               ? 'bg-white/10 hover:bg-white/20 text-emerald-300' 
                               : 'bg-gray-100 hover:bg-gray-200 text-emerald-600'}`}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Pesquisar</span>
              </Button>
            )}
          </div>
          
          {/* Tema toggle */}
          <ThemeToggle />
          
          {/* Notificações */}
          <NotificationsMenu />
          
          {/* Perfil do usuário */}
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}