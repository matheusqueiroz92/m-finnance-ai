import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
}

interface InvestmentPortfolioProps {
  data?: AssetAllocation[];
  isLoading: boolean;
  theme?: string;
}

export function InvestmentPortfolio({ data, isLoading, theme }: InvestmentPortfolioProps) {
  const isDark = theme === 'dark';
  
  // Cores para o gráfico - funcionam bem em ambos os temas
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={isDark ? "white" : "black"}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="border shadow transition-colors duration-200 
                    bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                    border-gray-200 dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-900 dark:text-emerald-300 transition-colors duration-200">
          Alocação de Ativos
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-zinc-400 transition-colors duration-200">
          Distribuição do seu portfólio por classe de ativos
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="category"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, null]}
                contentStyle={{ 
                  backgroundColor: isDark ? '#25343b' : '#fff', 
                  borderColor: isDark ? '#ffffff20' : '#e5e7eb', 
                  color: isDark ? '#fff' : '#000' 
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right" 
                formatter={(value) => <span style={{ color: isDark ? '#fff' : '#000' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-zinc-400 transition-colors duration-200">
            Não há dados suficientes para exibir o gráfico
          </div>
        )}
      </CardContent>
    </Card>
  );
}