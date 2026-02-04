import express from 'express';
import { container } from '../config/container';
import { CategoryController } from '../controllers/CategoryController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { categoryCreateSchema, categoryUpdateSchema } from '../validators/categoryValidator';

const router = express.Router();
const categoryController = container.resolve(CategoryController);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gerenciamento de categorias dos usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665f1b2c3a4d5e6f7a8b9c0d"
 *         name:
 *           type: string
 *           example: "Alimentação"
 *         type:
 *           type: string
 *           example: "expense"
 *         icon:
 *           type: string
 *           example: "https://cdn.exemplo.com/icon.jpg"
 *         color:
 *           type: string
 *           example: "#1e90ff"
 *         isDefault:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           example: "Alimentação"
 *         type:
 *           type: string
 *           example: "expense"
 *         icon:
 *           type: string
 *           example: "https://cdn.exemplo.com/icon.jpg"
 *         color:
 *           type: string
 *           example: "#1e90ff"
 *         isDefault:
 *           type: boolean
 *     CategoryUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Alimentação"
 *         type:
 *           type: string
 *           example: "expense"
 *         icon:
 *           type: string
 *           example: "https://cdn.exemplo.com/icon.jpg"
 *         color:
 *           type: string
 *           example: "#1e90ff"
 *         isDefault:
 *           type: boolean
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
 * /api/categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', validate(categoryCreateSchema), categoryController.createCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista todas as categorias do usuário autenticado
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Não autorizado
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/categories/:id:
 *   get:
 *     summary: Obtém uma categoria por ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories/:id:
 *   put:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdate'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', validate(categoryUpdateSchema), categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/:id:
 *   delete:
 *     summary: Remove uma categoria pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria removida com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', categoryController.deleteCategory);

export default router;