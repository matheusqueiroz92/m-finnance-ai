import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { ICreditCardService } from '../interfaces/services/ICreditCardService';
import { ICreditCardRepository } from '../interfaces/repositories/ICreditCardRepository';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { 
  ICreditCardCreateDTO, 
  ICreditCardUpdateDTO, 
  ICreditCardDTO,
  ICreditCardBalance,
  ICreditCard
} from '../interfaces/entities/ICreditCard';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class CreditCardService implements ICreditCardService {
  constructor(
    @inject('CreditCardRepository')
    private creditCardRepository: ICreditCardRepository,
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository
  ) {}

  /**
   * Create a new credit card
   */
  async createCreditCard(userId: string, cardData: ICreditCardCreateDTO): Promise<ICreditCardDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Verificar se já existe um cartão com o mesmo número
      const existingCard = await this.creditCardRepository.findByCardNumber(
        userId, 
        cardData.cardNumber
      );
      
      if (existingCard) {
        throw new ApiError('Cartão com este número já cadastrado', 400);
      }
      
      // Validar CPF
      if (!this.validateCPF(cardData.cardholderCpf)) {
        throw new ApiError('CPF inválido', 400);
      }
      
      // Validar data de validade
      if (!this.validateExpiryDate(cardData.expiryDate)) {
        throw new ApiError('Data de validade inválida ou cartão vencido', 400);
      }
      
      // Preparar dados para criação
      const newCreditCard = {
        ...cardData,
        user: new mongoose.Types.ObjectId(userId),
        cardNumber: cardData.cardNumber.slice(-4), // Salvar apenas últimos 4 dígitos
        currentBalance: 0,
        isActive: true
      };
      
      // Criar cartão
      const creditCard = await this.creditCardRepository.create(newCreditCard, { session });
      
      if (!creditCard) {
        throw new ApiError('Falha ao criar cartão de crédito', 500);
      }
      
      return this.mapToDTO(creditCard);
    });
  }
  
  /**
   * Get credit cards by user ID
   */
  async getCreditCardsByUserId(userId: string, isActive?: boolean): Promise<ICreditCardDTO[]> {
    const creditCards = await this.creditCardRepository.findByUser(userId, isActive);
    return creditCards.map(card => this.mapToDTO(card));
  }
  
  /**
   * Get credit card by ID
   */
  async getCreditCardById(cardId: string, userId: string): Promise<ICreditCardDTO> {
    const creditCard = await this.creditCardRepository.findById(cardId, userId);
    
    if (!creditCard) {
      throw new ApiError('Cartão de crédito não encontrado', 404);
    }
    
    return this.mapToDTO(creditCard);
  }
  
  /**
   * Update a credit card
   */
  async updateCreditCard(cardId: string, userId: string, updateData: ICreditCardUpdateDTO): Promise<ICreditCardDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Validar data de validade se estiver sendo atualizada
      if (updateData.expiryDate && !this.validateExpiryDate(updateData.expiryDate)) {
        throw new ApiError('Data de validade inválida ou cartão vencido', 400);
      }
      
      const updatedCard = await this.creditCardRepository.update(cardId, userId, updateData, { session });
      
      if (!updatedCard) {
        throw new ApiError('Cartão de crédito não encontrado', 404);
      }
      
      return this.mapToDTO(updatedCard);
    });
  }
  
  /**
   * Delete a credit card
   */
  async deleteCreditCard(cardId: string, userId: string): Promise<void> {
    // Verificar se há transações associadas ao cartão
    const cardTransactions = await this.transactionRepository.findByAccount(userId, cardId);
    
    if (cardTransactions.length > 0) {
      throw new ApiError('Não é possível excluir um cartão que possui transações', 400);
    }
    
    const result = await this.creditCardRepository.delete(cardId, userId);
    
    if (!result) {
      throw new ApiError('Cartão de crédito não encontrado', 404);
    }
  }
  
  /**
   * Get credit card balance information
   */
  async getCreditCardBalance(cardId: string, userId: string): Promise<ICreditCardBalance> {
    const creditCard = await this.creditCardRepository.findById(cardId, userId);
    
    if (!creditCard) {
      throw new ApiError('Cartão de crédito não encontrado', 404);
    }
    
    const availableLimit = creditCard.creditLimit - creditCard.currentBalance;
    const percentageUsed = creditCard.creditLimit > 0 
      ? (creditCard.currentBalance / creditCard.creditLimit) * 100 
      : 0;
    
    return {
      creditLimit: creditCard.creditLimit,
      currentBalance: creditCard.currentBalance,
      availableLimit,
      percentageUsed: Math.round(percentageUsed * 100) / 100
    };
  }
  
  /**
   * Validate credit card security code
   */
  async validateSecurityCode(cardId: string, userId: string, securityCode: string): Promise<boolean> {
    const creditCard = await this.creditCardRepository.findById(cardId, userId);
    
    if (!creditCard) {
      throw new ApiError('Cartão de crédito não encontrado', 404);
    }
    
    return creditCard.validateSecurityCode(securityCode);
  }
  
  /**
   * Map CreditCard model to DTO
   */
  private mapToDTO(creditCard: ICreditCard): ICreditCardDTO {
    const id = creditCard._id?.toString() || '';
    const availableLimit = creditCard.creditLimit - creditCard.currentBalance;
    
    return {
      _id: id,
      cardNumber: creditCard.cardNumber, // Já são apenas os últimos 4 dígitos
      cardBrand: creditCard.cardBrand,
      cardholderName: creditCard.cardholderName,
      cardholderCpf: this.maskCPF(creditCard.cardholderCpf),
      expiryDate: creditCard.expiryDate,
      creditLimit: creditCard.creditLimit,
      billingDueDay: creditCard.billingDueDay,
      currentBalance: creditCard.currentBalance,
      availableLimit,
      isActive: creditCard.isActive,
      createdAt: creditCard.createdAt,
      updatedAt: creditCard.updatedAt
    };
  }
  
  /**
   * Validate CPF
   */
  private validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Validação básica de CPF
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }
  
  /**
   * Validate expiry date
   */
  private validateExpiryDate(expiryDate: string): boolean {
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) return false;
    
    const [month, year] = expiryDate.split('/').map(num => parseInt(num));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    // Verificar se o mês é válido
    if (month === undefined || month < 1 || month > 12) return false;
    
    // Verificar se o cartão não está vencido
    if (year === undefined || year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Mask CPF for display
   */
  private maskCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$2');
  }
}