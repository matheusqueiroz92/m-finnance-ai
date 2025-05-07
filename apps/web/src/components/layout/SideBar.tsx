'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Target,
  TrendingUp,
  Settings,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CreditCard, label: 'Carteira', href: '/carteira' },
  { icon: ArrowRightLeft, label: 'Transações', href: '/transacoes' },
  { icon: Target, label: 'Objetivos', href: '/objetivos' },
  { icon: TrendingUp, label: 'Investimentos', href: '/investimentos' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="w-64 bg-emerald-800 text-white flex flex-col">
      <div className="p-6 border-b border-emerald-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold">OFinanceAI</span>
        </div>
      </div>
      
      <div className="p-4 border-b border-emerald-700">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-emerald-300">
              {user?.isPremium ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-100 hover:bg-emerald-700/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}