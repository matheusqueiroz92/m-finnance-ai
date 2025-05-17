import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IInvestmentService } from '../interfaces/services/IInvestmentService';
import { IInvestmentRepository } from '../interfaces/repositories/IInvestmentRepository';
import { IAccountRepository } from '../interfaces/repositories/IAccountRepository';
import { 
  IInvestmentCreateDTO, 
  IInvestmentUpdateDTO, 
  IInvestmentDTO,
  IInvestmentSummaryDTO,
  IInvestmentFilters,
  IInvestmentListResult,
  IInvestment
} from '../interfaces/entities/IInvestment';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class InvestmentService implements IInvestmentService {
  constructor(
    @inject('InvestmentRepository')
    private investmentRepository: IInvestmentRepository,
    @inject('AccountRepository')
    private accountRepository: IAccountRepository
  ) {}

  /**
   * Create a new investment
   */
  async createInvestment(userId: string, investmentData: IInvestmentCreateDTO): Promise<IInvestmentDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Verificar se a conta existe e pertence ao usuário
      const account = await this.accountRepository.findById(investmentData.account, userId);
      
      if (!account) {
        throw new ApiError('Conta não encontrada', 404);
      }
      
      // Converter datas se forem strings
      const processedData: any = { ...investmentData };
      if (typeof processedData.acquisitionDate === 'string') {
        processedData.acquisitionDate = new Date(processedData.acquisitionDate);
      }
      
      // Calcular performance inicial
      const absoluteReturn = processedData.currentValue - processedData.initialValue;
      const percentageReturn = processedData.initialValue > 0 
        ? (absoluteReturn / processedData.initialValue) * 100 
        : 0;
      
      // Cálculo do retorno anualizado
      let annualizedReturn;
      if (processedData.acquisitionDate) {
        const now = new Date();
        const acquisitionDate = new Date(processedData.acquisitionDate);
        const yearDiff = (now.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        
        if (yearDiff > 0) {
          const r = processedData.currentValue / processedData.initialValue;
          annualizedReturn = (Math.pow(r, 1 / yearDiff) - 1) * 100;
        }
      }
      
      // Preparar dados para criação
      const newInvestment = {
        ...processedData,
        user: new mongoose.Types.ObjectId(userId),
        account: new mongoose.Types.ObjectId(processedData.account),
        isActive: true,
        performance: {
          absoluteReturn,
          percentageReturn,
          annualizedReturn
        }
      };
      
      // Criar investimento
      const investment = await this.investmentRepository.create(newInvestment, { session });
      
      if (!investment) {
        throw new ApiError('Falha ao criar investimento', 500);
      }
      
      return this.mapToDTO(investment);
    });
  }
  
  /**
   * Get investments by user ID with pagination and filters
   */
  async getInvestmentsByUserId(userId: string, filters: IInvestmentFilters): Promise<IInvestmentListResult> {
    const { type, isActive, account, page = 1, limit = 10 } = filters;
    
    const filterOptions = {
      type,
      isActive,
      account
    };
    
    const investments = await this.investmentRepository.findByUser(userId, filterOptions);
    const total = await this.investmentRepository.countByUser(userId, filterOptions);
    
    // Aplicar paginação manualmente
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedInvestments = investments.slice(startIndex, endIndex);
    
    return {
      investments: paginatedInvestments.map(investment => this.mapToDTO(investment)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }
  
  /**
   * Get investment by ID
   */
  async getInvestmentById(investmentId: string, userId: string): Promise<IInvestmentDTO> {
    const investment = await this.investmentRepository.findById(investmentId, userId);
    
    if (!investment) {
      throw new ApiError('Investimento não encontrado', 404);
    }
    
    return this.mapToDTO(investment);
  }
  
  /**
   * Update an investment
   */
  async updateInvestment(investmentId: string, userId: string, updateData: IInvestmentUpdateDTO): Promise<IInvestmentDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Verificar se o investimento existe
      const investment = await this.investmentRepository.findById(investmentId, userId);
      
      if (!investment) {
        throw new ApiError('Investimento não encontrado', 404);
      }
      
      // Atualizar o investimento
      const updatedInvestment = await this.investmentRepository.update(
        investmentId,
        userId,
        updateData,
        { session }
      );
      
      if (!updatedInvestment) {
        throw new ApiError('Falha ao atualizar investimento', 500);
      }
      
      return this.mapToDTO(updatedInvestment);
    });
  }
  
  /**
   * Delete an investment
   */
  async deleteInvestment(investmentId: string, userId: string): Promise<void> {
    const result = await this.investmentRepository.delete(investmentId, userId);
    
    if (!result) {
      throw new ApiError('Investimento não encontrado', 404);
    }
  }
  
  /**
   * Get investment summary with statistics
   */
  async getInvestmentSummary(userId: string): Promise<IInvestmentSummaryDTO> {
    const investments = await this.investmentRepository.findByUser(userId, { isActive: true });
    
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    const investmentsByType: Record<string, { totalInvested: number; totalCurrentValue: number }> = {};
    
    // Calcular totais e agrupar por tipo
    investments.forEach(investment => {
      totalInvested += investment.initialValue;
      totalCurrentValue += investment.currentValue;
      
      if (!investmentsByType[investment.type]) {
        investmentsByType[investment.type] = {
          totalInvested: 0,
          totalCurrentValue: 0
        };
      }
      
      investmentsByType[investment.type]!.totalInvested += investment.initialValue;
      investmentsByType[investment.type]!.totalCurrentValue += investment.currentValue;
    });
    
    // Calcular retorno total
    const totalReturn = {
      value: totalCurrentValue - totalInvested,
      percentage: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0
    };
    
    // Formatar dados por tipo de investimento
    const formattedInvestmentsByType = Object.entries(investmentsByType).map(([type, data]) => ({
      type,
      totalInvested: data.totalInvested,
      totalCurrentValue: data.totalCurrentValue,
      percentage: totalInvested > 0 ? (data.totalInvested / totalInvested) * 100 : 0
    }));
    
    // Ordenar investimentos por performance
    const sortedInvestments = [...investments].sort((a, b) => 
      ((b.performance?.percentageReturn || 0) - (a.performance?.percentageReturn || 0))
    );
    
    const topPerformers = sortedInvestments.slice(0, 5).map(inv => this.mapToDTO(inv));
    const worstPerformers = [...sortedInvestments].reverse().slice(0, 5).map(inv => this.mapToDTO(inv));
    
    return {
      totalInvested,
      totalCurrentValue,
      totalReturn,
      investmentsByType: formattedInvestmentsByType,
      topPerformers,
      worstPerformers
    };
  }
  
  /**
   * Get investments by account ID
   */
  async getInvestmentsByAccount(userId: string, accountId: string): Promise<IInvestmentDTO[]> {
    const investments = await this.investmentRepository.getInvestmentsByAccount(userId, accountId);
    return investments.map(investment => this.mapToDTO(investment));
  }
  
  /**
   * Map Investment model to DTO
   */
  private mapToDTO(investment: IInvestment): IInvestmentDTO {
    const id = investment._id?.toString() || '';

    return {
      _id: id,
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol,
      amount: investment.amount,
      initialValue: investment.initialValue,
      currentValue: investment.currentValue,
      acquisitionDate: investment.acquisitionDate,
      notes: investment.notes,
      isActive: investment.isActive,
      performance: {
        absoluteReturn: investment.performance?.absoluteReturn || 0,
        percentageReturn: investment.performance?.percentageReturn || 0,
        annualizedReturn: investment.performance?.annualizedReturn
      },
      provider: investment.provider,
      account: {
        _id: (typeof investment.account === 'object' && investment.account && 'name' in investment.account) 
          ? investment.account._id.toString() 
          : typeof investment.account === 'string'
            ? investment.account
            : '',
        name: (typeof investment.account === 'object' && investment.account && 'name' in investment.account)
          ? investment.account.name as string
          : '',
        type: (typeof investment.account === 'object' && investment.account && 'type' in investment.account)
          ? investment.account.type as string
          : '',
      },
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt
    };
  }
}