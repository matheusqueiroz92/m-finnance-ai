import React from 'react';
import { render, screen } from '@testing-library/react';
import { InsightsList } from '../InsightsList';

describe('InsightsList', () => {
  const mockInsights = [
    {
      type: 'optimization',
      title: 'Otimização de Gastos',
      description: 'Considere reduzir gastos com delivery'
    },
    {
      type: 'positive',
      title: 'Excelente Poupança',
      description: 'Você está poupando bem!'
    },
    {
      type: 'warning',
      title: 'Atenção aos Gastos',
      description: 'Seus gastos aumentaram este mês'
    }
  ];

  it('should render insights correctly', () => {
    render(
      <InsightsList 
        insights={mockInsights} 
        potentialSavings={500} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Insights Inteligentes')).toBeInTheDocument();
    expect(screen.getByText('Poupança potencial: R$ 500,00')).toBeInTheDocument();
    expect(screen.getByText('Otimização de Gastos')).toBeInTheDocument();
    expect(screen.getByText('Excelente Poupança')).toBeInTheDocument();
    expect(screen.getByText('Atenção aos Gastos')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <InsightsList 
        insights={[]} 
        potentialSavings={0} 
        isLoading={true} 
      />
    );

    expect(screen.getByText('Insights Inteligentes')).toBeInTheDocument();
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should display empty state when no insights', () => {
    render(
      <InsightsList 
        insights={[]} 
        potentialSavings={0} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Adicione mais transações para receber insights personalizados')).toBeInTheDocument();
  });

  it('should show correct insight types and colors', () => {
    render(
      <InsightsList 
        insights={mockInsights} 
        potentialSavings={500} 
        isLoading={false} 
      />
    );

    // Verificar badges de tipo
    expect(screen.getByText('Otimização')).toBeInTheDocument();
    expect(screen.getByText('Positivo')).toBeInTheDocument();
    expect(screen.getByText('Atenção')).toBeInTheDocument();

    // Verificar cores dos insights
    const optimizationInsight = screen.getByText('Otimização de Gastos').closest('div');
    expect(optimizationInsight).toHaveClass('border-blue-200', 'bg-blue-50');

    const positiveInsight = screen.getByText('Excelente Poupança').closest('div');
    expect(positiveInsight).toHaveClass('border-green-200', 'bg-green-50');

    const warningInsight = screen.getByText('Atenção aos Gastos').closest('div');
    expect(warningInsight).toHaveClass('border-yellow-200', 'bg-yellow-50');
  });

  it('should not show potential savings badge when value is 0', () => {
    render(
      <InsightsList 
        insights={mockInsights} 
        potentialSavings={0} 
        isLoading={false} 
      />
    );

    expect(screen.queryByText(/Poupança potencial/)).not.toBeInTheDocument();
  });

  it('should format potential savings correctly', () => {
    render(
      <InsightsList 
        insights={mockInsights} 
        potentialSavings={1234.56} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Poupança potencial: R$ 1234,56')).toBeInTheDocument();
  });
});

