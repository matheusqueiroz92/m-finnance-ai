import { 
    IAccountCreateDTO, 
    IAccountUpdateDTO, 
    IAccountDTO,
    IAccountSummary
  } from '../entities/IAccount';
  
  export interface IAccountService {
    createAccount(userId: string, accountData: IAccountCreateDTO): Promise<IAccountDTO>;
    getAccountsByUserId(userId: string): Promise<IAccountDTO[]>;
    getAccountById(accountId: string, userId: string): Promise<IAccountDTO>;
    updateAccount(accountId: string, userId: string, updateData: IAccountUpdateDTO): Promise<IAccountDTO>;
    deleteAccount(accountId: string, userId: string): Promise<void>;
    getAccountSummary(userId: string): Promise<IAccountSummary>;
  }