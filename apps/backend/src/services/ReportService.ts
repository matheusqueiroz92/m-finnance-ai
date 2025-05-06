// src/services/ReportService.ts
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Transaction from '../models/TransactionModel';
import { ApiError } from '../utils/ApiError';
import { AIAnalysisService } from './AIAnalysisService';

export class ReportService {
  private aiAnalysisService: AIAnalysisService;
  
  constructor() {
    this.aiAnalysisService = new AIAnalysisService();
  }
  
  /**
   * Generate a comprehensive financial report
   */
  async generateFinancialReport(
    userId: string,
    period: 'month' | 'quarter' | 'year',
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<{ filePath: string; fileName: string }> {
    try {
      // Define date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Get transactions within date range
      const transactions = await Transaction.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .populate('category', 'name type')
        .populate('account', 'name type')
        .sort({ date: 1 });
      
      // Get AI insights
      const insights = await this.aiAnalysisService.generateInsights(userId);
      
      // Generate report in requested format
      if (format === 'pdf') {
        return this.generatePDFReport(userId, transactions, insights, period);
      } else {
        return this.generateExcelReport(userId, transactions, insights, period);
      }
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw new ApiError('Failed to generate report', 500);
    }
  }
  
  /**
   * Generate PDF report
   */
  private async generatePDFReport(
    userId: string,
    transactions: any[],
    insights: any,
    period: string
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `financial_report_${period}_${uuidv4()}.pdf`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    
    // Calculate summary data
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const netChange = totalIncome - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category ? (t.category as any).name : 'Sem categoria';
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = 0;
        }
        expensesByCategory[categoryName] += t.amount;
      });
    
    // Create PDF document
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      stream.on('error', reject);
      
      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });
      
      doc.pipe(stream);
      
      // Add document title
      doc
        .fontSize(25)
        .text('Relatório Financeiro - FinanceAI', { align: 'center' })
        .moveDown(2);
      
      // Add report period
      const periodText = period === 'month' ? 'Último Mês' : period === 'quarter' ? 'Último Trimestre' : 'Último Ano';
      doc
        .fontSize(14)
        .text(`Período: ${periodText}`, { align: 'center' })
        .moveDown(2);
      
      // Add financial summary
      doc
        .fontSize(16)
        .text('Resumo Financeiro', { underline: true })
        .moveDown(1);
      
      doc.fontSize(12);
      doc.text(`Receitas Totais: R$ ${totalIncome.toFixed(2)}`);
      doc.text(`Despesas Totais: R$ ${totalExpenses.toFixed(2)}`);
      doc.text(`Saldo: R$ ${netChange.toFixed(2)}`, { 
        continued: netChange >= 0 
      });
      doc.fillColor(netChange >= 0 ? 'green' : 'red')
        .text(netChange >= 0 ? ' (positivo)' : ' (negativo)')
        .fillColor('black')
        .moveDown(2);
      
      // Add expense breakdown by category
      doc
        .fontSize(16)
        .text('Despesas por Categoria', { underline: true })
        .moveDown(1);
      
      doc.fontSize(12);
      Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          const percentage = (amount / totalExpenses * 100).toFixed(1);
          doc.text(`${category}: R$ ${amount.toFixed(2)} (${percentage}%)`);
        });
      
      doc.moveDown(2);
      
      // Add insights from AI analysis
      doc
        .fontSize(16)
        .text('Insights IA', { underline: true })
        .moveDown(1);
      
      doc.fontSize(12);
      doc.text(`Score Financeiro: ${insights.score.value}`);
      doc.text(`Saúde Financeira: ${insights.health}`);
      doc.text(`Economia Potencial: R$ ${insights.potentialSavings.toFixed(2)}`);
      
      if (insights.insights && insights.insights.length > 0) {
        doc.moveDown(1);
        insights.insights.forEach((insight: any) => {
          doc.text(`${insight.title}:`, { underline: true });
          doc.text(insight.description);
          doc.moveDown(0.5);
        });
      }
      
      doc.moveDown(2);
      
      // Add transaction list
      doc
        .fontSize(16)
        .text('Lista de Transações', { underline: true })
        .moveDown(1);
      
      // Create transaction table headers
      const tableTop = doc.y;
      const tableHeaders = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
      const columnWidth = (doc.page.width - 100) / tableHeaders.length;
      
      // Draw table headers
      doc.fontSize(10).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, 50 + i * columnWidth, tableTop, { width: columnWidth, align: 'left' });
      });
      
      // Draw table rows
      doc.font('Helvetica');
      let tableY = tableTop + 20;
      
      transactions.forEach((transaction) => {
        // Check if we need a new page
        if (tableY > doc.page.height - 50) {
          doc.addPage();
          tableY = 50;
          
          // Redraw headers on new page
          doc.font('Helvetica-Bold');
          tableHeaders.forEach((header, i) => {
            doc.text(header, 50 + i * columnWidth, tableY, { width: columnWidth, align: 'left' });
          });
          doc.font('Helvetica');
          tableY += 20;
        }
        
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        const description = transaction.description;
        const category = transaction.category ? (transaction.category as any).name : '-';
        const type = transaction.type === 'income' ? 'Receita' : transaction.type === 'expense' ? 'Despesa' : 'Investimento';
        const amount = transaction.amount.toFixed(2);
        
        // Set color based on transaction type
        doc.fillColor(transaction.type === 'income' ? 'green' : transaction.type === 'expense' ? 'red' : 'blue');
        
        doc.text(date, 50, tableY, { width: columnWidth, align: 'left' });
        doc.text(description, 50 + columnWidth, tableY, { width: columnWidth, align: 'left' });
        doc.text(category, 50 + 2 * columnWidth, tableY, { width: columnWidth, align: 'left' });
        doc.text(type, 50 + 3 * columnWidth, tableY, { width: columnWidth, align: 'left' });
        doc.text(amount, 50 + 4 * columnWidth, tableY, { width: columnWidth, align: 'left' });
        
        doc.fillColor('black');
        tableY += 15;
      });
      
      // Finalize the PDF
      doc.end();
    });
  }
  
  /**
   * Generate Excel report
   */
  private async generateExcelReport(
    userId: string,
    transactions: any[],
    insights: any,
    period: string
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `financial_report_${period}_${uuidv4()}.xlsx`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    
    // Calculate summary data
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const netChange = totalIncome - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category ? (t.category as any).name : 'Sem categoria';
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = 0;
        }
        expensesByCategory[categoryName] += t.amount;
      });
    
    // Create Excel workbook and worksheets
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FinanceAI';
    workbook.created = new Date();
    
    // Add summary worksheet
    const summarySheet = workbook.addWorksheet('Resumo');
    
    // Add title and period
    summarySheet.mergeCells('A1:E1');
    summarySheet.getCell('A1').value = 'Relatório Financeiro - FinanceAI';
    summarySheet.getCell('A1').font = { size: 16, bold: true };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };
    
    const periodText = period === 'month' ? 'Último Mês' : period === 'quarter' ? 'Último Trimestre' : 'Último Ano';
    summarySheet.mergeCells('A2:E2');
    summarySheet.getCell('A2').value = `Período: ${periodText}`;
    summarySheet.getCell('A2').font = { size: 12 };
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Add financial summary section
    summarySheet.getCell('A4').value = 'Resumo Financeiro';
    summarySheet.getCell('A4').font = { size: 14, bold: true };
    
    summarySheet.getCell('A5').value = 'Receitas Totais:';
    summarySheet.getCell('B5').value = totalIncome;
    summarySheet.getCell('B5').numFmt = 'R$ #,##0.00';
    
    summarySheet.getCell('A6').value = 'Despesas Totais:';
    summarySheet.getCell('B6').value = totalExpenses;
    summarySheet.getCell('B6').numFmt = 'R$ #,##0.00';
    
    summarySheet.getCell('A7').value = 'Saldo:';
    summarySheet.getCell('B7').value = netChange;
    summarySheet.getCell('B7').numFmt = 'R$ #,##0.00';
    summarySheet.getCell('B7').font = { color: { argb: netChange >= 0 ? '00AA00' : 'FF0000' } };
    
    // Add expense by category section
    summarySheet.getCell('A9').value = 'Despesas por Categoria';
    summarySheet.getCell('A9').font = { size: 14, bold: true };
    
    summarySheet.getCell('A10').value = 'Categoria';
    summarySheet.getCell('B10').value = 'Valor';
    summarySheet.getCell('C10').value = 'Percentual';
    
    const cols = [];
    cols.push({ header: 'A', width: 30 });
    cols.push({ header: 'B', width: 15 });
    cols.push({ header: 'C', width: 15 });
    
    let rowIndex = 11;
    Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        const percentage = amount / totalExpenses * 100;
        
        summarySheet.getCell(`A${rowIndex}`).value = category;
        summarySheet.getCell(`B${rowIndex}`).value = amount;
        summarySheet.getCell(`B${rowIndex}`).numFmt = 'R$ #,##0.00';
        summarySheet.getCell(`C${rowIndex}`).value = percentage / 100;
        summarySheet.getCell(`C${rowIndex}`).numFmt = '0.0%';
        
        rowIndex++;
      });
    
    // Add AI insights section
    rowIndex += 2;
    summarySheet.getCell(`A${rowIndex}`).value = 'Insights IA';
    summarySheet.getCell(`A${rowIndex}`).font = { size: 14, bold: true };
    rowIndex++;
    
    summarySheet.getCell(`A${rowIndex}`).value = 'Score Financeiro:';
    summarySheet.getCell(`B${rowIndex}`).value = insights.score.value;
    rowIndex++;
    
    summarySheet.getCell(`A${rowIndex}`).value = 'Saúde Financeira:';
    summarySheet.getCell(`B${rowIndex}`).value = insights.health;
    rowIndex++;
    
    summarySheet.getCell(`A${rowIndex}`).value = 'Economia Potencial:';
    summarySheet.getCell(`B${rowIndex}`).value = insights.potentialSavings;
    summarySheet.getCell(`B${rowIndex}`).numFmt = 'R$ #,##0.00';
    rowIndex++;
    
    if (insights.insights && insights.insights.length > 0) {
      rowIndex++;
      insights.insights.forEach((insight: any) => {
        summarySheet.getCell(`A${rowIndex}`).value = `${insight.title}:`;
        summarySheet.getCell(`A${rowIndex}`).font = { bold: true };
        rowIndex++;
        
        summarySheet.getCell(`A${rowIndex}`).value = insight.description;
        summarySheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
        rowIndex++;
      });
    }
    
    // Add transactions worksheet
    const transactionsSheet = workbook.addWorksheet('Transações');
    
    // Define columns
    transactionsSheet.columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Descrição', key: 'description', width: 30 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Conta', key: 'account', width: 20 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Valor', key: 'amount', width: 15 },
    ];
    
    // Style header row
    transactionsSheet.getRow(1).font = { bold: true };
    
    // Add transaction data
    transactions.forEach(transaction => {
      const row = {
        date: new Date(transaction.date),
        description: transaction.description,
        category: transaction.category ? (transaction.category as any).name : '-',
        account: transaction.account ? (transaction.account as any).name : '-',
        type: transaction.type === 'income' ? 'Receita' : transaction.type === 'expense' ? 'Despesa' : 'Investimento',
        amount: transaction.amount,
      };
      
      const excelRow = transactionsSheet.addRow(row);
      
      // Apply color based on transaction type
      excelRow.getCell('amount').font = {
        color: { argb: transaction.type === 'income' ? '00AA00' : transaction.type === 'expense' ? 'FF0000' : '0000FF' },
      };
      excelRow.getCell('amount').numFmt = 'R$ #,##0.00';
      excelRow.getCell('date').numFmt = 'dd/mm/yyyy';
    });
    
    // Save workbook to file
    await workbook.xlsx.writeFile(filePath);
    
    return { filePath, fileName };
  }
}