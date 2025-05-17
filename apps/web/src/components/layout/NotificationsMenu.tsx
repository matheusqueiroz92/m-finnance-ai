'use client';

import { Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function NotificationsMenu() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Exemplo de notificações
  const notifications = [
    { id: 1, title: 'Nova transação', message: 'Você recebeu uma nova transação de R$500,00', time: 'Há 10 minutos', read: false },
    { id: 2, title: 'Meta atingida', message: 'Você atingiu 80% da sua meta de "Férias"', time: 'Há 2 horas', read: false },
    { id: 3, title: 'Lembrete de pagamento', message: 'Você tem um pagamento agendado para amanhã', time: 'Há 1 dia', read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative h-9 w-9 rounded-full transition-colors duration-200
                            ${isDark 
                               ? 'bg-white/10 hover:bg-white/20 text-emerald-300' 
                               : 'bg-gray-100 hover:bg-gray-200 text-emerald-600'}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className={`text-xs ${isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
            <p>Notificações</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent className={`w-80 mt-1 border transition-colors duration-200
                                         ${isDark 
                                            ? 'bg-[#25343b] border-white/20 text-white' 
                                            : 'bg-white border-gray-200 text-gray-900'}`}>
          <DropdownMenuLabel className="flex justify-between items-center">
            <span className={`font-medium transition-colors duration-200
                           ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
              Notificações
            </span>
            {unreadCount > 0 && (
              <span className={`text-xs transition-colors duration-200
                             ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className={`transition-colors duration-200
                                          ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`cursor-pointer p-3 flex flex-col items-start gap-1 transition-colors duration-200
                              ${isDark
                                 ? notification.read 
                                    ? 'hover:bg-emerald-700/20' 
                                    : 'bg-emerald-700/10 hover:bg-emerald-700/20'
                                 : notification.read
                                    ? 'hover:bg-gray-100'
                                    : 'bg-emerald-50 hover:bg-emerald-100'}
                              ${isDark ? 'text-white focus:bg-emerald-700/20 focus:text-white' : 'text-gray-900 focus:bg-gray-100 focus:text-gray-900'}`}
                >
                  <div className="flex justify-between w-full">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <span className={`text-xs transition-colors duration-200
                                    ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                      {notification.time}
                    </span>
                  </div>
                  <p className={`text-xs transition-colors duration-200
                              ${isDark ? 'text-zinc-300' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className={`transition-colors duration-200
                                              ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <DropdownMenuItem className={`cursor-pointer justify-center py-2 transition-colors duration-200
                                          ${isDark 
                                             ? 'text-emerald-300 hover:bg-emerald-700/20 focus:bg-emerald-700/20 focus:text-emerald-300' 
                                             : 'text-emerald-600 hover:bg-gray-100 focus:bg-gray-100 focus:text-emerald-600'}`}>
                Ver todas as notificações
              </DropdownMenuItem>
            </>
          ) : (
            <div className={`py-4 text-center text-sm transition-colors duration-200
                            ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Nenhuma notificação no momento
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}