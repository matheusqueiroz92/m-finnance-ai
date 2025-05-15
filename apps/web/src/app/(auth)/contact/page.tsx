'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Headphones, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/auth/ContactForm';
import PageContainer from '@/components/layout/PageContainer';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccess = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <PageContainer title="Contato" subtitle="Entre em contato conosco">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Mensagem Enviada!</h2>
            <p className="text-zinc-200">
              Obrigado por entrar em contato. Responderemos sua mensagem em até 24 horas.
            </p>
          </div>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => window.location.href = '/dashboard'}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Contato" subtitle="Entre em contato conosco">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Informações de Contato */}
        <div className="md:col-span-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-emerald-300 mb-6">Informações de Contato</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-emerald-400 mt-1" />
                <div>
                  <p className="text-zinc-300 font-medium">Email</p>
                  <p className="text-zinc-200">suporte@ofinanceai.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-emerald-400 mt-1" />
                <div>
                  <p className="text-zinc-300 font-medium">Telefone</p>
                  <p className="text-zinc-200">0800 123 4567</p>
                  <p className="text-zinc-400 text-sm">Seg-Sex, 9h-18h</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-400 mt-1" />
                <div>
                  <p className="text-zinc-300 font-medium">Endereço</p>
                  <p className="text-zinc-200">Av. Principal, 1000</p>
                  <p className="text-zinc-200">Centro - São Paulo/SP</p>
                  <p className="text-zinc-200">CEP: 01000-000</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-lg font-medium text-emerald-300 mb-4">Canais de Suporte</h3>
              <div className="space-y-3">
                <a href="/ajuda" className="flex items-center space-x-2 text-zinc-200 hover:text-emerald-300 transition">
                  <Headphones className="h-4 w-4" />
                  <span>Central de Ajuda</span>
                </a>
                <a href="/faq" className="flex items-center space-x-2 text-zinc-200 hover:text-emerald-300 transition">
                  <MessageSquare className="h-4 w-4" />
                  <span>FAQ</span>
                </a>
                <a href="/docs" className="flex items-center space-x-2 text-zinc-200 hover:text-emerald-300 transition">
                  <FileText className="h-4 w-4" />
                  <span>Documentação</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Formulário de Contato */}
        <div className="md:col-span-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-emerald-300 mb-6">Envie sua mensagem</h2>
            <ContactForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}