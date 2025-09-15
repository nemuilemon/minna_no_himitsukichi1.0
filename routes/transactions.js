const express = require('express');
const router = express.Router();
const TransactionModel = require('../models/transactionModel');
const authenticateToken = require('../middleware/auth');

// ## 取引作成API (POST /api/transactions) ##
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { type, amount, transaction_date, category_id, description } = req.body;
    const userId = req.user.userId;

    const newTransaction = await TransactionModel.create(userId, type, amount, transaction_date, category_id, description);

    res.status(201).json(newTransaction);
  } catch (error) {
    next(error);
  }
});

// ## 取引取得API (GET /api/transactions) ##
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const allTransactions = await TransactionModel.getAll(userId);

    res.json(allTransactions);
  } catch (error) {
    next(error);
  }
});

// ## 今月の家計簿サマリー取得API (GET /api/transactions/summary/current-month) ##
router.get('/summary/current-month', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const summary = await TransactionModel.getCurrentMonthSummary(userId);

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// ## 取引更新API (PUT /api/transactions/:id) ##
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { type, amount, transaction_date, category_id, description } = req.body;

    const updatedTransaction = await TransactionModel.update(id, userId, type, amount, transaction_date, category_id, description);

    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
});

// ## 取引削除API (DELETE /api/transactions/:id) ##
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await TransactionModel.delete(id, userId);

    res.json({ message: "取引が正常に削除されました。" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
