'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, CreditCard, CircleHelp } from 'lucide-react';

export function UserProfileMenu() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const isDark = theme === 'dark';

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className={`h-9 w-9 border-2 cursor-pointer transition-colors duration-200
                          ${isDark 
                             ? 'border-emerald-500/50 hover:border-emerald-400' 
                             : 'border-emerald-600/50 hover:border-emerald-500'}`}>
          <AvatarImage src={user?.avatar} alt={user?.name || 'Usuário'} />
          <AvatarFallback className={`transition-colors duration-200
                                     ${isDark 
                                        ? 'bg-emerald-800 text-emerald-200' 
                                        : 'bg-emerald-600 text-white'}`}>
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-56 mt-1 mr-1 border transition-colors duration-200
                                      ${isDark 
                                         ? 'bg-[#25343b] border-white/20 text-white' 
                                         : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-200
                          ${isDark 
                             ? 'bg-emerald-800 text-white' 
                             : 'bg-emerald-600 text-white'}`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className={`font-medium text-sm truncate max-w-[170px] transition-colors duration-200
                          ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.name}
            </p>
            <p className={`text-xs truncate max-w-[170px] transition-colors duration-200
                          ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
              {user?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className={`transition-colors duration-200
                                          ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        <DropdownMenuItem className={`cursor-pointer gap-2 transition-colors duration-200
                                    ${isDark 
                                       ? 'text-white hover:bg-emerald-700/20 focus:bg-emerald-700/20 focus:text-white' 
                                       : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900'}`}>
          <User className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`cursor-pointer gap-2 transition-colors duration-200
                                    ${isDark 
                                       ? 'text-white hover:bg-emerald-700/20 focus:bg-emerald-700/20 focus:text-white' 
                                       : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900'}`}>
          <Settings className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`cursor-pointer gap-2 transition-colors duration-200
                                    ${isDark 
                                       ? 'text-white hover:bg-emerald-700/20 focus:bg-emerald-700/20 focus:text-white' 
                                       : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900'}`}>
          <CreditCard className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>Assinatura</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`cursor-pointer gap-2 transition-colors duration-200
                                    ${isDark 
                                       ? 'text-white hover:bg-emerald-700/20 focus:bg-emerald-700/20 focus:text-white' 
                                       : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900'}`}>
          <CircleHelp className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>Ajuda & Suporte</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className={`transition-colors duration-200
                                          ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        <DropdownMenuItem 
          className={`cursor-pointer gap-2 transition-colors duration-200
                     ${isDark 
                        ? 'text-white hover:bg-red-700/20 focus:bg-red-700/20 focus:text-white' 
                        : 'text-gray-700 hover:bg-red-100 focus:bg-red-100 focus:text-red-700'}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 text-red-400" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}