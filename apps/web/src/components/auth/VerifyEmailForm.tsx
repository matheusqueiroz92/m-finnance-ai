'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export default function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) return; // Aceitar apenas um dígito
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Mover para o próximo input se um valor foi digitado
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedCode = pastedData.slice(0, 6).split('');
    
    const newCode = [...code];
    pastedCode.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    
    setCode(newCode);
    inputs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor, insira o código completo');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implementar chamada real para API
      router.push('/dashboard');
    } catch (error) {
      setError('Código inválido. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      // Simular reenvio
      await new Promise(resolve => setTimeout(resolve, 1500));
      // TODO: Implementar chamada real para API
      setError('');
      alert('Código reenviado com sucesso!');
    } catch (error) {
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading} message="Verificando código...">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-center text-zinc-300 mb-6">
            Digite o código de 6 dígitos enviado para seu email
          </p>
          
          <div className="flex justify-center space-x-3">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputs.current[index] = el; }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-14 h-14 text-center text-2xl bg-zinc-50 font-bold"
                maxLength={1}
                pattern="[0-9]"
              />
            ))}
          </div>
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-300 text-[#25343b] p-5"
          disabled={isLoading}
        >
          {isLoading ? 'Verificando...' : 'Verificar Email'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            className="text-emerald-300 hover:text-emerald-100 text-sm"
            disabled={isLoading}
          >
            Não recebeu o código? Reenviar
          </button>
        </div>
      </form>
    </LoadingOverlay>
  );
}