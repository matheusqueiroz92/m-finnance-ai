import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/lib/auth';
import { RouteChangeProvider } from '@/components/providers/RouteChangeProvider';

const inter = Inter({ subsets: ['latin'] });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'OFinanceAI - Controle Financeiro com IA',
  description: 'Gerencie suas finanças de forma inteligente com a ajuda de IA',
  keywords: 'termos de serviço, termos de uso, OFinanceAI, gestão financeira',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={montserrat.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <QueryProvider>
            <AuthProvider>
              <RouteChangeProvider>
                {children}
              </RouteChangeProvider>
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}