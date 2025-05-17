'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Target,
  TrendingUp,
  Settings,
  ChartColumnBig,
  LogOut,
  Wallet,
  Receipt,
} from 'lucide-react';
import Image from 'next/image';
import LogoSidebarDark from '../../../public/images/logo-dark-mode-m-finnance-ai.png'
import LogoSidebarLight from '../../../public/images/logo-light-mode-m-finnance-ai.png';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Wallet, label: 'Carteira', href: '/wallet' },
  { icon: ArrowRightLeft, label: 'Transações', href: '/transactions' },
  { icon: Target, label: 'Objetivos', href: '/goals' },
  { icon: TrendingUp, label: 'Investimentos', href: '/investimentos' },
  { icon: Receipt, label: 'Contas Bancárias', href: '/accounts' },
  { icon: CreditCard, label: 'Cartões de Crédito', href: '/credit-cards' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
  { icon: ChartColumnBig, label: 'Relatórios', href: '/reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const imageTheme = theme === 'dark' ? LogoSidebarDark : LogoSidebarLight;

  return (
    <div className={`h-full flex flex-col transition-colors duration-200
                     ${isDark 
                        ? 'bg-[#1a2329] text-white' 
                        : 'bg-emerald-600 text-white'}`}>
      <div className={`p-6 border-b transition-colors duration-200
                      ${isDark 
                         ? 'border-white/10' 
                         : 'border-emerald-700'}`}>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Image src={imageTheme} alt={'Logo-sidebar'} height={100}/>
          </Link>
        </div>
      </div>
      
      <div className={`p-4 border-b transition-colors duration-200
                      ${isDark 
                         ? 'border-white/10' 
                         : 'border-emerald-700'}`}>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className={`${isDark ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-700 text-white'}`}>
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-100'}`}>
              {user?.isPremium ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 flex-1 flex flex-col">
        <ul className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors 
                              ${isDark 
                                ? isActive
                                  ? 'bg-emerald-700 text-white'
                                  : 'text-emerald-100 hover:bg-emerald-700/50'
                                : isActive
                                  ? 'bg-emerald-700 text-white'
                                  : 'text-white hover:bg-emerald-700'
                              }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Botão de Logout */}
        <div className={`pt-4 border-t transition-colors duration-200
                        ${isDark 
                           ? 'border-emerald-700' 
                           : 'border-emerald-700'}`}>
          <button
            onClick={logout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                       ${isDark 
                          ? 'text-emerald-100 hover:bg-emerald-700/50' 
                          : 'text-white hover:bg-emerald-700'}`}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}