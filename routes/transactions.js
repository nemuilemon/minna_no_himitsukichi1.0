const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// ## 取引作成API (POST /api/transactions) ##
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, amount, transaction_date, category_id, description } = req.body;
    const userId = req.user.userId;

    if (!type || !amount || !transaction_date || !category_id) {
      return res.status(400).json({ error: "取引の種類、金額、取引日、カテゴリは必須です。" });
    }

    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, transaction_date, description, category_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, type, amount, transaction_date, description, category_id]
    );

    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 取引取得API (GET /api/transactions) ##
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const allTransactions = await pool.query(
      `SELECT t.*, c.name AS category_name, c.type AS category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
       ORDER BY t.transaction_date DESC`, 
      [userId]
    );

    res.json(allTransactions.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 今月の家計簿サマリー取得API (GET /api/transactions/summary/current-month) ##
router.get('/summary/current-month', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const summaryResult = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric AS expense
       FROM transactions
       WHERE 
         user_id = $1 AND
         EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND
         EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId]
    );

    const row = summaryResult.rows[0];
    const income = parseFloat(row.income);
    const expense = parseFloat(row.expense);

    const summary = {
      income: income,
      expense: expense,
      balance: income - expense
    };

    res.json(summary);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 取引更新API (PUT /api/transactions/:id) ##
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user.userId;
    const { type, amount, transaction_date, category_id, description } = req.body;

    const transaction = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [id, userId]);
    if (transaction.rows.length === 0) {
      return res.status(404).json({ error: "対象の取引が見つからないか、アクセス権がありません。" });
    }
    
    if (!type || !amount || !transaction_date || !category_id) {
      return res.status(400).json({ error: "取引の種類、金額、取引日、カテゴリは必須です。" });
    }

    const updatedTransaction = await pool.query(
      `UPDATE transactions 
       SET type = $1, amount = $2, transaction_date = $3, description = $4, category_id = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [type, amount, transaction_date, description, category_id, id]
    );

    res.json(updatedTransaction.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 取引削除API (DELETE /api/transactions/:id) ##
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleteOp = await pool.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "対象の取引が見つからないか、アクセス権がありません。" });
    }

    res.json({ message: "取引が正常に削除されました。" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

module.exports = router;
