import { 
  IInvestmentCreateDTO, 
  IInvestmentUpdateDTO, 
  IInvestmentDTO,
  IInvestmentSummaryDTO,
  IInvestmentFilters,
  IInvestmentListResult
} from '../entities/IInvestment';

export interface IInvestmentService {
  createInvestment(userId: string, investmentData: IInvestmentCreateDTO): Promise<IInvestmentDTO>;
  getInvestmentsByUserId(userId: string, filters: IInvestmentFilters): Promise<IInvestmentListResult>;
  getInvestmentById(investmentId: string, userId: string): Promise<IInvestmentDTO>;
  updateInvestment(investmentId: string, userId: string, updateData: IInvestmentUpdateDTO): Promise<IInvestmentDTO>;
  deleteInvestment(investmentId: string, userId: string): Promise<void>;
  getInvestmentSummary(userId: string): Promise<IInvestmentSummaryDTO>;
  getInvestmentsByAccount(userId: string, accountId: string): Promise<IInvestmentDTO[]>;
}