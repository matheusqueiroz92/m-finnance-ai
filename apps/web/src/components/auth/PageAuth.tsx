'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../public/images/logo-m-finnance-ai.png';
import { Button } from '../ui/button';

interface PageAuthProps {
  title: string;
  subtitle: string;
  formComponent: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  showSocialLogin?: boolean;
}

export default function PageAuth({
  title,
  subtitle,
  formComponent,
  footerText,
  footerLinkText,
  footerLinkHref,
  showSocialLogin = true
}: PageAuthProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Coluna da esquerda - Logo e imagem */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-800 text-white p-10 flex-col">
        <div className="w-full max-w-auto flex-1 flex flex-col gap-12 justify-center p-32">
          <Image 
            src={Logo}
            alt="Cerebro de curiosidade"
            width={500}
            height={500}
            className="max-w-md mx-auto"
          />
          <p className="pl-8 text-[16px]"><span className="text-[#25343b] font-extrabold">Transforme</span> sua gestão financeira com IA.
            <span className="text-[#25343b] font-extrabold"> Controle suas finanças</span>, defina metas e receba insights personalizados para tomar melhores decisões.</p>
        </div>
      </div>
      
      {/* Coluna da direita - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#25343b]">
        <div className="w-full max-w-md">

          {/* Mobile */}
          <div className="flex items-center justify-center mb-8 md:hidden">
            <div className="h-8 w-8 mr-2">
              <svg viewBox="0 0 24 24" fill="#047857" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-emerald-600">OFinanceAI</h1>
          </div>
          
          {/* Título e subtítulo */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-emerald-300">{title}</h2>
            <p className="text-zinc-50 mt-2">{subtitle}</p>
          </div>
          
          {formComponent}
          
          {showSocialLogin && (
            <>
              <div className="text-center text-sm text-zinc-50 mt-6">
                <p>Ou continue com</p>
                
                <div className="flex justify-center space-x-4 mt-4">
                  {/* Botão do Google */}
                  <Button variant="outline" className="hover:bg-emerald-300 hover:border-emerald-300" size="icon" asChild>
                    <Link href="http://localhost:3001/api/auth/google">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </Link>
                  </Button>
                    
                  {/* Botão do GitHub */}
                  <Button variant="outline" className="hover:bg-emerald-300 hover:border-emerald-300" size="icon" asChild>
                    <Link href="http://localhost:3001/api/auth/github">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#181717"
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      />
                    </svg>
                    </Link>
                  </Button>

                  {/* Botão do Facebook */}
                  <Button variant="outline" className="hover:bg-emerald-300 hover:border-emerald-300" size="icon" asChild>
                    <Link href="http://localhost:3001/api/auth/facebook">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#1877F2"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {/* Link para cadastro/login */}
          <div className="text-center mt-4">
            <p className="text-sm text-zinc-50">
              {footerText}{' '}
              <Link href={footerLinkHref} className="text-emerald-300 hover:text-emerald-100 font-medium">
                {footerLinkText}
              </Link>
            </p>
          </div>

          {/* Rodapé */}
          <footer className="mt-12 text-center text-xs text-zinc-300">
            <p>
              © {new Date().getFullYear()} Todos os direitos
              reservados. Desenvolvido por{" "}
              <Link href="https://matheusqueiroz.dev.br" target="_blank" className="text-emerald-300 hover:text-emerald-100">
                Matheus Queiroz
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}