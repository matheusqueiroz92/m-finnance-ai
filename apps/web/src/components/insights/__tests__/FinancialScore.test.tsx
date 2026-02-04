import React from 'react';
import { render, screen } from '@testing-library/react';
import { FinancialScore } from '../FinancialScore';

describe('FinancialScore', () => {
  const mockScore = {
    value: 750,
    change: 25
  };

  const mockHealth = 'Excelente';

  it('should render score and health correctly', () => {
    render(
      <FinancialScore 
        score={mockScore} 
        health={mockHealth} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('750')).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText('+25 pontos')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <FinancialScore 
        score={mockScore} 
        health={mockHealth} 
        isLoading={true} 
      />
    );

    expect(screen.getByText('Score Financeiro')).toBeInTheDocument();
    // Verificar se há elementos de loading (skeleton)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should display correct colors for different scores', () => {
    const { rerender } = render(
      <FinancialScore 
        score={{ value: 800, change: 0 }} 
        health="Excelente" 
        isLoading={false} 
      />
    );

    // Score alto deve ter cor verde
    const scoreElement = screen.getByText('800');
    expect(scoreElement).toHaveClass('text-green-600');

    // Testar score baixo
    rerender(
      <FinancialScore 
        score={{ value: 400, change: -10 }} 
        health="Precisa de atenção" 
        isLoading={false} 
      />
    );

    const lowScoreElement = screen.getByText('400');
    expect(lowScoreElement).toHaveClass('text-red-600');
  });

  it('should show correct health badge colors', () => {
    const { rerender } = render(
      <FinancialScore 
        score={mockScore} 
        health="Excelente" 
        isLoading={false} 
      />
    );

    const healthBadge = screen.getByText('Excelente');
    expect(healthBadge).toHaveClass('bg-green-100', 'text-green-800');

    // Testar outras classificações
    rerender(
      <FinancialScore 
        score={mockScore} 
        health="Regular" 
        isLoading={false} 
      />
    );

    const regularBadge = screen.getByText('Regular');
    expect(regularBadge).toHaveClass('bg-orange-100', 'text-orange-800');
  });

  it('should display progress bar correctly', () => {
    render(
      <FinancialScore 
        score={{ value: 750, change: 0 }} 
        health="Excelente" 
        isLoading={false} 
      />
    );

    const progressBar = document.querySelector('.w-full.bg-gray-200.rounded-full.h-2');
    expect(progressBar).toBeInTheDocument();

    const progressFill = document.querySelector('.h-2.rounded-full');
    expect(progressFill).toHaveStyle('width: 88.23529411764706%'); // 750/850 * 100
  });

  it('should show correct change indicators', () => {
    const { rerender } = render(
      <FinancialScore 
        score={{ value: 750, change: 25 }} 
        health="Excelente" 
        isLoading={false} 
      />
    );

    expect(screen.getByText('+25 pontos')).toBeInTheDocument();

    // Testar mudança negativa
    rerender(
      <FinancialScore 
        score={{ value: 700, change: -15 }} 
        health="Ótima" 
        isLoading={false} 
      />
    );

    expect(screen.getByText('-15 pontos')).toBeInTheDocument();
  });
});

