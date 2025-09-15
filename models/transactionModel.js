const pool = require('../db');

class TransactionModel {
  static async create(userId, type, amount, transaction_date, category_id, description) {
    if (!type || !amount || !transaction_date || !category_id) {
      const error = new Error("取引の種類、金額、取引日、カテゴリは必須です。");
      error.status = 400;
      throw error;
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, transaction_date, description, category_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, type, amount, transaction_date, description, category_id]
    );

    return result.rows[0];
  }

  static async getAll(userId) {
    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, c.type AS category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC`,
      [userId]
    );

    return result.rows;
  }

  static async getCurrentMonthSummary(userId) {
    const result = await pool.query(
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

    const row = result.rows[0];
    const income = parseFloat(row.income);
    const expense = parseFloat(row.expense);

    return {
      income: income,
      expense: expense,
      balance: income - expense
    };
  }

  static async findByIdAndUser(id, userId) {
    const result = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, type, amount, transaction_date, category_id, description) {
    const transaction = await this.findByIdAndUser(id, userId);
    if (!transaction) {
      const error = new Error("対象の取引が見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    if (!type || !amount || !transaction_date || !category_id) {
      const error = new Error("取引の種類、金額、取引日、カテゴリは必須です。");
      error.status = 400;
      throw error;
    }

    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, amount = $2, transaction_date = $3, description = $4, category_id = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [type, amount, transaction_date, description, category_id, id]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rows.length === 0) {
      const error = new Error("対象の取引が見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = TransactionModel;