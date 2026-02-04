import express from "express";
import { container } from "../config/container";
import { AccountController } from "../controllers/AccountController";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import {
  accountCreateSchema,
  accountUpdateSchema,
} from "../validators/accountValidator";

const router = express.Router();
const accountController = container.resolve(AccountController);
/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Gerenciamento de contas bancárias dos usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665f1b2c3a4d5e6f7a8b9c0d"
 *         name:
 *           type: string
 *           example: "Conta Corrente"
 *         type:
 *           type: string
 *           example: "corrente"
 *         balance:
 *           type: number
 *           example: 1000.00
 *         institution:
 *           type: string
 *           example: "Banco XPTO"
 *         color:
 *           type: string
 *           example: "#1e90ff"
 *         user:
 *           type: string
 *           example: "665f1b2c3a4d5e6f7a8b9c0d"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AccountCreate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - balance
 *       properties:
 *         name:
 *           type: string
 *           example: "Conta Corrente"
 *         type:
 *           type: string
 *           example: "corrente"
 *         balance:
 *           type: number
 *           example: 1000.00
 *         institution:
 *           type: string
 *           example: "Banco XPTO"
 *         color:
 *           type: string
 *           example: "#1e90ff"
 *     AccountUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Conta Poupança"
 *         type:
 *           type: string
 *           example: "poupança"
 *         balance:
 *           type: number
 *           example: 2000.00
 *         institution:
 *           type: string
 *           example: "Banco XPTO"
 *         color:
 *           type: string
 *           example: "#ff6347"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Todas as rotas são protegidas
router.use(protect);

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Cria uma nova conta bancária
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountCreate'
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *
 *   get:
 *     summary: Lista todas as contas do usuário autenticado
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         description: Não autorizado
 */
router.post(
  "/",
  validate(accountCreateSchema),
  accountController.createAccount
);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Lista todas as contas do usuário autenticado
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         description: Não autorizado
 */
router.get("/", accountController.getAccounts);

/**
 * @swagger
 * /api/accounts/summary:
 *   get:
 *     summary: Retorna o resumo financeiro das contas do usuário
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo das contas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBalance:
 *                   type: number
 *                   example: 1500.50
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       401:
 *         description: Não autorizado
 */
router.get("/summary", accountController.getAccountSummary);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Busca uma conta pelo ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta
 *     responses:
 *       200:
 *         description: Conta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Conta não encontrada
 *       401:
 *         description: Não autorizado
 *
 *   put:
 *     summary: Atualiza uma conta existente
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountUpdate'
 *     responses:
 *       200:
 *         description: Conta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Conta não encontrada
 *       401:
 *         description: Não autorizado
 *
 *   delete:
 *     summary: Remove uma conta pelo ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta
 *     responses:
 *       204:
 *         description: Conta removida com sucesso
 *       404:
 *         description: Conta não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", accountController.getAccountById);

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Atualiza uma conta existente
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountUpdate'
 *     responses:
 *       200:
 *         description: Conta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Conta não encontrada
 *       401:
 *         description: Não autorizado
 */
router.put(
  "/:id",
  validate(accountUpdateSchema),
  accountController.updateAccount
);

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Remove uma conta pelo ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta
 *     responses:
 *       204:
 *         description: Conta removida com sucesso
 *       404:
 *         description: Conta não encontrada
 *       401:
 *         description: Não autorizado
 */
router.delete("/:id", accountController.deleteAccount);

export default router;
