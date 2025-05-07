import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IBillingService } from '../interfaces/services/IBillingService';
import { IPaymentService } from '../interfaces/services/IPaymentService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

@injectable()
export class PaymentController {
  constructor(
    @inject('BillingService')
    private billingService: IBillingService,
    @inject('PaymentService')
    private paymentService: IPaymentService
  ) {}
  
  /**
   * Create checkout session
   */
  createCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;
      
      if (!priceId || !successUrl || !cancelUrl) {
        throw new ApiError('priceId, successUrl e cancelUrl são obrigatórios', 400);
      }
      
      const checkoutUrl = await this.billingService.createCheckoutSession(req.user._id, {
        priceId,
        successUrl,
        cancelUrl,
        metadata: { userId: req.user._id }
      });
      
      ApiResponse.success(res, { url: checkoutUrl }, 'Sessão de checkout criada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get payment methods
   */
  getPaymentMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentMethods = await this.billingService.getCustomerPaymentMethods(req.user._id);
      
      ApiResponse.success(res, paymentMethods, 'Métodos de pagamento recuperados com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Handle webhook events from payment provider
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        throw new ApiError('Assinatura do webhook ausente', 400);
      }
      
      // Validate and parse webhook
      const event = await this.paymentService.validateWebhookEvent(
        req.body,
        signature
      );
      
      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.billingService.handleSubscriptionUpdated(
            event.data.id,
            event.data.status
          );
          break;
          
        case 'customer.subscription.deleted':
          await this.billingService.handleSubscriptionDeleted(event.data.id);
          break;
          
        case 'payment_intent.succeeded':
          await this.billingService.handlePaymentSucceeded(event.data.id);
          break;
          
        case 'payment_intent.payment_failed':
          await this.billingService.handlePaymentFailed(event.data.id);
          break;
          
        default:
          // Ignorar outros eventos
          break;
      }
      
      // Responder ao webhook (é importante responder rapidamente)
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Webhook Error' });
    }
  };
}