import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { errorHandler } from './middlewares/errorMiddleware';
import 'reflect-metadata';
import './config/container';

// Import routes
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import accountRoutes from './routes/accountRoutes';
import categoryRoutes from './routes/categoryRoutes';
import goalRoutes from './routes/goalRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'FinanceAI API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;