import express from 'express';
import { container } from '../config/container';
import { CreditCardController } from '../controllers/CreditCardController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { 
  creditCardCreateSchema, 
  creditCardUpdateSchema,
  validateSecurityCodeSchema 
} from '../validators/creditCardValidator';

const router = express.Router();
const creditCardController = container.resolve(CreditCardController);

/**
 * @swagger
 * tags:
 *   name: Credit Cards
 *   description: Gerenciamento de cartões de crédito dos usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditCard:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665f1b2c3a4d5e6f7a8b9c0d"
 *         cardNumber:
 *           type: string
 *           example: "1234567890123456"
 *         cardBrand:
 *           type: string
 *           example: "visa"
 *         cardholderName:
 *           type: string
 *           example: "João da Silva"
 *         cardholderCpf:
 *           type: string
 *           example: "12345678901"
 *         expiryDate:
 *           type: string
 *           example: "01/2025"
 *         securityCode:
 *           type: string
 *           example: "123"
 *         creditLimit:
 *           type: number
 *           example: 1000.00
 *         billingDueDay:
 *           type: number
 *           example: 10
 *         currentBalance:
 *           type: number
 *           example: 100.00
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreditCardCreate:
 *       type: object
 *       required:
 *         - cardNumber
 *         - cardBrand
 *         - cardholderName
 *         - cardholderCpf
 *         - expiryDate
 *         - securityCode
 *         - creditLimit
 *         - billingDueDay
 *       properties:
 *         cardNumber:
 *           type: string
 *           example: "1234567890123456"
 *         cardBrand:
 *           type: string
 *           example: "visa"
 *         cardholderName:
 *           type: string
 *           example: "João da Silva"
 *         cardholderCpf:
 *           type: string
 *           example: "12345678901"
 *         expiryDate:
 *           type: string
 *           example: "01/2025"
 *         securityCode:
 *           type: string
 *           example: "123"
 *         creditLimit:
 *           type: number
 *           example: 1000.00
 *         billingDueDay:
 *           type: number
 *           example: 10
 *         currentBalance:
 *           type: number
 *           example: 100.00
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreditCardUpdate:
 *       type: object
 *       properties:
 *         cardholderName:
 *           type: string
 *           example: "João da Silva"
 *         expiryDate:
 *           type: string
 *           example: "01/2025"
 *         securityCode:
 *           type: string
 *           example: "123"
 *         creditLimit:
 *           type: number
 *           example: 1000.00
 *         billingDueDay:
 *           type: number
 *           example: 10
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Todas as rotas são protegidas
router.use(protect);

/**
 * @swagger
 * /api/credit-cards:
 *   post:
 *     summary: Cria um novo cartão de crédito
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreditCardCreate'
 *     responses:
 *       201:
 *         description: Cartão de crédito criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCard'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', validate(creditCardCreateSchema), creditCardController.createCreditCard);

/**
 * @swagger
 * /api/credit-cards:
 *   get:
 *     summary: Lista todos os cartões de crédito do usuário autenticado
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cartões de crédito recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCard'
 *       401:
 *         description: Não autorizado
 */
router.get('/', creditCardController.getCreditCards);

/**
 * @swagger
 * /api/credit-cards/:id:
 *   get:
 *     summary: Obtém um cartão de crédito por ID
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão de crédito
 *     responses:
 *       200:
 *         description: Cartão de crédito encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCard'
 *       404:
 *         description: Cartão de crédito não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', creditCardController.getCreditCardById);

/**
 * @swagger
 * /api/credit-cards/:id/balance:
 *   get:
 *     summary: Obtém o saldo de um cartão de crédito
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão de crédito
 *     responses:
 *       200:
 *         description: Saldo do cartão de crédito encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCardBalance'
 *       404:
 *         description: Cartão de crédito não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id/balance', creditCardController.getCreditCardBalance);

/**
 * @swagger
 * /api/credit-cards/:id:
 *   put:
 *     summary: Atualiza um cartão de crédito
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão de crédito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreditCardUpdate'
 *     responses:
 *       200:
 *         description: Cartão de crédito atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCard'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', validate(creditCardUpdateSchema), creditCardController.updateCreditCard);

/**
 * @swagger
 * /api/credit-cards/:id:
 *   delete:
 *     summary: Exclui um cartão de crédito
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão de crédito
 *     responses:
 *       200:
 *         description: Cartão de crédito excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCard'
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', creditCardController.deleteCreditCard);

/**
 * @swagger
 * /api/credit-cards/:id/validate-security-code:
 *   post:
 *     summary: Valida o código de segurança de um cartão de crédito
 *     tags: [Credit Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão de crédito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateSecurityCode'
 *     responses:
 *       200:
 *         description: Código de segurança validado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditCard'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/:id/validate-security-code', validate(validateSecurityCodeSchema), creditCardController.validateSecurityCode);

export default router;