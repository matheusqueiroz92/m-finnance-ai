'use client';

import React from 'react';
import { Bell, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          {/* Título dinâmico baseado na rota atual */}
        </h1>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Bell size={20} />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Mail size={20} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/perfil">Perfil</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/configuracoes">Configurações</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}