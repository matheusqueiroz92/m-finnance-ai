'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sobre */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Sobre
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sobre" className="text-base text-gray-600 hover:text-gray-900">
                    Quem Somos
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="text-base text-gray-600 hover:text-gray-900">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-base text-gray-600 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/termos" className="text-base text-gray-600 hover:text-gray-900">
                    Termos de Serviço
                  </Link>
                </li>
                <li>
                  <Link href="/politicas-privacidade" className="text-base text-gray-600 hover:text-gray-900">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-base text-gray-600 hover:text-gray-900">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Suporte */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Suporte
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/ajuda" className="text-base text-gray-600 hover:text-gray-900">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-base text-gray-600 hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
                <li>
                  <a href="mailto:suporte@ofinanceai.com" className="text-base text-gray-600 hover:text-gray-900">
                    suporte@ofinanceai.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-base text-gray-400 text-center">
              © {currentYear} OFinanceAI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}