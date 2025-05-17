import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface InputMaskProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InputMask({
  mask,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  ...props
}: InputMaskProps) {
  const [maskedValue, setMaskedValue] = useState('');

  // Função para aplicar a máscara ao valor
  const applyMask = (value: string, mask: string) => {
    let result = '';
    let valueIndex = 0;
    
    // Remover caracteres não numéricos para processamento
    const rawValue = value.replace(/\D/g, '');
    
    for (let i = 0; i < mask.length && valueIndex < rawValue.length; i++) {
      if (mask[i] === '9') {
        result += rawValue[valueIndex];
        valueIndex++;
      } else {
        result += mask[i];
        if (valueIndex < rawValue.length && rawValue[valueIndex] === mask[i]) {
          valueIndex++;
        }
      }
    }
    
    return result;
  };

  // Atualiza o valor mascarado quando o valor ou a máscara mudam
  useEffect(() => {
    setMaskedValue(applyMask(value || '', mask));
  }, [value, mask]);

  // Manipula a alteração do input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMaskedValue = applyMask(e.target.value, mask);
    setMaskedValue(newMaskedValue);
    
    // Remove a máscara ao chamar o onChange para manter apenas os dados puros
    // Comentado porque em alguns casos pode ser melhor manter a máscara
    // const rawValue = newMaskedValue.replace(/\D/g, '');
    onChange(newMaskedValue);
  };

  return (
    <Input
      value={maskedValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...props}
    />
  );
}