import { 
    ICreditCardCreateDTO, 
    ICreditCardUpdateDTO, 
    ICreditCardDTO,
    ICreditCardBalance
  } from '../entities/ICreditCard';
  
  export interface ICreditCardService {
    createCreditCard(userId: string, cardData: ICreditCardCreateDTO): Promise<ICreditCardDTO>;
    getCreditCardsByUserId(userId: string, isActive?: boolean): Promise<ICreditCardDTO[]>;
    getCreditCardById(cardId: string, userId: string): Promise<ICreditCardDTO>;
    updateCreditCard(cardId: string, userId: string, updateData: ICreditCardUpdateDTO): Promise<ICreditCardDTO>;
    deleteCreditCard(cardId: string, userId: string): Promise<void>;
    getCreditCardBalance(cardId: string, userId: string): Promise<ICreditCardBalance>;
    validateSecurityCode(cardId: string, userId: string, securityCode: string): Promise<boolean>;
  }