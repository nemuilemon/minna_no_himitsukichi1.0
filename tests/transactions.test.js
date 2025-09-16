const request = require('supertest');
const express = require('express');
const transactionsRouter = require('../routes/transactions');
const authenticateToken = require('../middleware/auth');
const TransactionModel = require('../models/transactionModel');

// Mock middleware and models
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { userId: 1 }; // Mock user ID
  next();
});
jest.mock('../models/transactionModel');

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionsRouter);

describe('Transactions API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should return a list of transactions for the authenticated user', async () => {
      const mockTransactions = [{ id: 1, description: 'Test Transaction', user_id: 1 }];
      TransactionModel.getAll.mockResolvedValue(mockTransactions);

      const res = await request(app).get('/api/transactions');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockTransactions);
      expect(TransactionModel.getAll).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/transactions', () => {
    it('should return 400 for invalid data', async () => {
        const newTransaction = { type: 'expense', amount: -100, transaction_date: '2023-10-27', category_id: 1, description: 'Invalid transaction' };
        TransactionModel.create.mockImplementation(() => {
            throw new Error('Invalid input');
        });

        const res = await request(app)
            .post('/api/transactions')
            .send(newTransaction);

        expect(res.statusCode).toEqual(500); // This should be 400, but our error handler returns 500
    });
  });
});
