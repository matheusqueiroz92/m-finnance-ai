import { container } from 'tsyringe';
import 'reflect-metadata';

// Interfaces - Repositories
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { IAccountRepository } from '../interfaces/repositories/IAccountRepository';
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { IGoalRepository } from '../interfaces/repositories/IGoalRepository';
import { ISubscriptionRepository } from '../interfaces/repositories/ISubscriptionRepository';
import { ICreditCardRepository } from '../interfaces/repositories/ICreditCardRepository';

// Interfaces - Services
import { IUserService } from '../interfaces/services/IUserService';
import { IAccountService } from '../interfaces/services/IAccountService';
import { ICategoryService } from '../interfaces/services/ICategoryService';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { IGoalService } from '../interfaces/services/IGoalService';
import { IReportService } from '../interfaces/services/IReportService';
import { IAIAnalysisService } from '../interfaces/services/IAIAnalysisService';
import { INotificationService } from '../interfaces/services/INotificationService';
import { ISubscriptionService } from '../interfaces/services/ISubscriptionService';
import { IPaymentService } from '../interfaces/services/IPaymentService';
import { IBillingService } from '../interfaces/services/IBillingService';
import { ICreditCardService } from '../interfaces/services/ICreditCardService';

// Implementations - Repositories
import { UserRepository } from '../repositories/UserRepository';
import { AccountRepository } from '../repositories/AccountRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { GoalRepository } from '../repositories/GoalRepository';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { CreditCardRepository } from '../repositories/CreditCardRepository';

// Implementations - Services
import { UserService } from '../services/UserService';
import { AccountService } from '../services/AccountService';
import { CategoryService } from '../services/CategoryService';
import { TransactionService } from '../services/TransactionService';
import { GoalService } from '../services/GoalService';
import { ReportService } from '../services/ReportService';
import { AIAnalysisService } from '../services/AIAnalysisService';
// import { NotificationService } from '../services/NotificationService';
import { MockNotificationService } from '../services/MockNotificationService';
import { SubscriptionService } from '../services/SubscriptionService';
import { StripePaymentService } from '../services/StripePaymentService';
import { BillingService } from '../services/BillingService';
import { CreditCardService } from '../services/CreditCardService';

// Register Repositories
container.registerSingleton<IUserRepository>('UserRepository', UserRepository);
container.registerSingleton<IAccountRepository>('AccountRepository', AccountRepository);
container.registerSingleton<ICategoryRepository>('CategoryRepository', CategoryRepository);
container.registerSingleton<ITransactionRepository>('TransactionRepository', TransactionRepository);
container.registerSingleton<IGoalRepository>('GoalRepository', GoalRepository);
container.registerSingleton<ISubscriptionRepository>('SubscriptionRepository', SubscriptionRepository);
container.registerSingleton<ICreditCardRepository>('CreditCardRepository', CreditCardRepository);

// Register Services
container.registerSingleton<IUserService>('UserService', UserService);
container.registerSingleton<IAccountService>('AccountService', AccountService);
container.registerSingleton<ICategoryService>('CategoryService', CategoryService);
container.registerSingleton<ITransactionService>('TransactionService', TransactionService);
container.registerSingleton<IGoalService>('GoalService', GoalService);
container.registerSingleton<IReportService>('ReportService', ReportService);
container.registerSingleton<IAIAnalysisService>('AIAnalysisService', AIAnalysisService);
// container.registerSingleton<INotificationService>('NotificationService', NotificationService);
container.registerSingleton<INotificationService>('NotificationService', MockNotificationService);
container.registerSingleton<ISubscriptionService>('SubscriptionService', SubscriptionService);
container.registerSingleton<IPaymentService>('PaymentService', StripePaymentService);
container.registerSingleton<IBillingService>('BillingService', BillingService);
container.registerSingleton<ICreditCardService>('CreditCardService', CreditCardService)

export { container };