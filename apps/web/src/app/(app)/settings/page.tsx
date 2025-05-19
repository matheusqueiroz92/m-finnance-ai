
'use client';

import React, { useState } from 'react';
import { Settings, Bell, User, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/shared/PageTitle';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { CategorySettings } from '@/components/settings/CategorySettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="space-y-8 p-6 min-h-screen bg-white dark:bg-[#25343b] transition-colors duration-200">
      <PageTitle 
        title="Configurações" 
        description="Personalize sua experiência no OFinanceAI"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="perfil" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="seguranca">
          <SecuritySettings />
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="categorias">
          <CategorySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}