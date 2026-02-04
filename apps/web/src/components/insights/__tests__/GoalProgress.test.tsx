import React from 'react';
import { render, screen } from '@testing-library/react';
import { GoalProgress } from '../GoalProgress';

describe('GoalProgress', () => {
  it('should render goal probability correctly', () => {
    render(
      <GoalProgress 
        goalProbability={75} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Probabilidade de atingir suas metas')).toBeInTheDocument();
    expect(screen.getByText('Boa')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <GoalProgress 
        goalProbability={0} 
        isLoading={true} 
      />
    );

    expect(screen.getByText('Progresso das Metas')).toBeInTheDocument();
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should display correct colors for different probabilities', () => {
    const { rerender } = render(
      <GoalProgress 
        goalProbability={90} 
        isLoading={false} 
      />
    );

    // Probabilidade alta deve ter cor verde
    const highProbability = screen.getByText('90%');
    expect(highProbability).toHaveClass('text-green-600');

    // Testar probabilidade baixa
    rerender(
      <GoalProgress 
        goalProbability={30} 
        isLoading={false} 
      />
    );

    const lowProbability = screen.getByText('30%');
    expect(lowProbability).toHaveClass('text-red-600');
  });

  it('should show correct probability labels', () => {
    const { rerender } = render(
      <GoalProgress 
        goalProbability={90} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Excelente')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={70} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Boa')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={50} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Regular')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={20} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('should display progress bar with correct value', () => {
    render(
      <GoalProgress 
        goalProbability={75} 
        isLoading={false} 
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should show appropriate motivational messages', () => {
    const { rerender } = render(
      <GoalProgress 
        goalProbability={90} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Você está no caminho certo para atingir suas metas!')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={70} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Continue assim! Você está progredindo bem.')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={40} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Considere ajustar suas metas ou aumentar a poupança.')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={20} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Revisite suas metas e estratégias de poupança.')).toBeInTheDocument();
  });

  it('should handle edge cases', () => {
    const { rerender } = render(
      <GoalProgress 
        goalProbability={0} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Baixa')).toBeInTheDocument();

    rerender(
      <GoalProgress 
        goalProbability={100} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
  });
});

