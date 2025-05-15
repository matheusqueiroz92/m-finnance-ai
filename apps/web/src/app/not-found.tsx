'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Coluna da esquerda - Informação */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-800 text-white p-10 flex-col justify-center items-center">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
          <p className="text-lg mb-8">
            Desculpe, não conseguimos encontrar a página que você está procurando. 
            Ela pode ter sido removida, alterada ou talvez nunca existiu.
          </p>
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 mr-2">
              <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">O'Finance AI</h1>
          </div>
        </div>
      </div>
      
      {/* Coluna da direita - Ações */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#25343b]">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 text-emerald-300">
            <svg 
              className="mx-auto h-32 w-32"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-emerald-300 mb-4">
            Oops! Página não encontrada
          </h2>
          
          <p className="text-zinc-300 mb-8">
            Parece que você se perdeu no caminho. A página que você procura não existe 
            ou foi movida para outro endereço.
          </p>
          
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-300 text-[#25343b] p-5 flex items-center justify-center">
                <Home className="h-5 w-5 mr-2" />
                Ir para o Dashboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full p-5 border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-[#25343b] flex items-center justify-center"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
          </div>
          
          <p className="text-sm text-zinc-500 mt-8">
            Se você acredita que isso é um erro, por favor{' '}
            <Link href="/contato" className="text-emerald-300 hover:text-emerald-100">
              entre em contato conosco
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}