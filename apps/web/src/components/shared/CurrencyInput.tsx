'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Formatar o valor quando ele mudar
    useEffect(() => {
      if (value === 0 && displayValue === '') return;
      if (value !== parseFloat(displayValue.replace(/\./g, '').replace(',', '.') || '0')) {
        setDisplayValue(formatCurrency(value));
      }
    }, [value, displayValue]);

    const formatCurrency = (val: number): string => {
      return val.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      // Remover tudo que não for dígito ou vírgula
      input = input.replace(/[^\d,]/g, '');
      
      // Garantir que haja apenas uma vírgula
      const commaCount = (input.match(/,/g) || []).length;
      if (commaCount > 1) {
        const parts = input.split(',');
        input = parts[0] + ',' + parts.slice(1).join('');
      }
      
      setDisplayValue(input);
      
      // Converter para número
      const numericValue = parseFloat(input.replace(/\./g, '').replace(',', '.')) || 0;
      onChange(numericValue);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          R$
        </span>
        <Input
          {...props}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className="pl-9"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;