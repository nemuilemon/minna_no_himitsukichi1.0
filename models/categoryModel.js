const db = require('../db');

class CategoryModel {
  static async getAll(userId) {
    const result = await db.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name",
      [userId]
    );
    return result.rows;
  }

  static async create(userId, name, type) {
    if (!name || !type) {
      const error = new Error("カテゴリー名と種類は必須です。");
      error.status = 400;
      throw error;
    }
    if (type !== 'income' && type !== 'expense') {
      const error = new Error("種類は 'income' または 'expense' である必要があります。");
      error.status = 400;
      throw error;
    }

    const result = await db.query(
      "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, type]
    );
    return result.rows[0];
  }

  static async findByIdAndUser(id, userId) {
    const result = await db.query("SELECT * FROM categories WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, name, type) {
    if (!name || !type) {
      const error = new Error("カテゴリー名と種類は必須です。");
      error.status = 400;
      throw error;
    }

    const category = await this.findByIdAndUser(id, userId);
    if (!category) {
      const error = new Error("対象のカテゴリーが見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    const result = await db.query(
      "UPDATE categories SET name = $1, type = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, type, id]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const usageCheck = await db.query("SELECT id FROM transactions WHERE category_id = $1 AND user_id = $2", [id, userId]);
    if (usageCheck.rows.length > 0) {
      const error = new Error("このカテゴリーは既に使用されているため削除できません。");
      error.status = 409;
      throw error;
    }

    const result = await db.query("DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rows.length === 0) {
      const error = new Error("対象のカテゴリーが見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = CategoryModel;