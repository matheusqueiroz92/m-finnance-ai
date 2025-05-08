'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileSpreadsheet, BarChart, PieChart, Lightbulb, BadgeDollarSign, LineChart, ArrowRight, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTitle } from '@/components/shared/PageTitle';
import { generateReport, getInsights } from '@/services/reportService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export default function ReportsPage() {
  const [exportPeriod, setExportPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Consulta de insights
  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: [QUERY_KEYS.REPORTS_INSIGHTS],
    queryFn: getInsights,
  });
  
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const reportBlob = await generateReport(exportPeriod, exportFormat);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(reportBlob);
      
      // Criar elemento de link para download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `relatorio_financeiro_${exportPeriod}_${format(new Date(), 'yyyy-MM-dd')}.${
        exportFormat === 'pdf' ? 'pdf' : 'xlsx'
      }`;
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <PageTitle 
        title="Relatórios Inteligentes" 
        description="Análise detalhada das suas finanças com IA"
      />
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <BadgeDollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold">
                {insights?.score?.value || 0}
              </h2>
              <p className="text-sm text-gray-500">Score Financeiro</p>
              <p className="text-xs text-emerald-600 mt-1">
                +{insights?.score?.change || 0} este mês
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-blue-600 font-medium">A+</span>
              </div>
              <h2 className="text-2xl font-bold">
                {insights?.health || 'Ótima'}
              </h2>
              <p className="text-sm text-gray-500">Saúde Financeira</p>
              <p className="text-xs text-blue-600 mt-1">
                Melhor que 85% dos usuários
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <span className="text-emerald-600 font-bold">R$</span>
              </div>
              <h2 className="text-2xl font-bold">
                R$ {insights?.potentialSavings?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h2>
              <p className="text-sm text-gray-500">Economia Potencial</p>
              <p className="text-xs text-emerald-600 mt-1">
                Oportunidades identificadas
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <span className="text-purple-600 font-bold">%</span>
              </div>
              <h2 className="text-2xl font-bold">
                {insights?.goalProbability || 0}%
              </h2>
              <p className="text-sm text-gray-500">Previsão de Metas</p>
              <p className="text-xs text-purple-600 mt-1">
                Probabilidade de sucesso
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Insights da IA */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Insights da IA</h2>
        <div className="space-y-4">
          {isLoadingInsights ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Carregando insights...</p>
              </CardContent>
            </Card>
          ) : insights?.insights && insights.insights.length > 0 ? (
            insights.insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'optimization' 
                        ? 'bg-emerald-100 text-emerald-600'
                        : insight.type === 'investment'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                    }`}>
                      {insight.type === 'optimization' ? (
                        <Lightbulb className="h-5 w-5" />
                      ) : insight.type === 'investment' ? (
                        <LineChart className="h-5 w-5" />
                      ) : (
                        <BarChart className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{insight.title}</h3>
                      <p className="text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Nenhum insight disponível no momento.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-2 text-right">
          Atualizado há 2 horas
        </p>
      </div>
      
      {/* Análises Financeiras */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Análise de Despesas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Gastos Recorrentes
              </CardTitle>
              <CardDescription>
                Análise de padrões mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Principais Gastos
              </CardTitle>
              <CardDescription>
                Top 5 categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Histórico Anual
              </CardTitle>
              <CardDescription>
                Comparativo 2024/2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Análise de Investimentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Distribuição de Ativos
              </CardTitle>
              <CardDescription>
                Análise de portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Performance
              </CardTitle>
              <CardDescription>
                Retorno por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Recomendações IA
              </CardTitle>
              <CardDescription>
                Sugestões personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Exportar Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
          <CardDescription>
            Baixe um relatório financeiro completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Período</label>
              <Select 
                value={exportPeriod} 
                onValueChange={(value) => setExportPeriod(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Formato</label>
              <Select 
                value={exportFormat} 
                onValueChange={(value) => setExportFormat(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf" className="flex items-center">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel" className="flex items-center">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="md:w-auto w-full"
            >
              {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}