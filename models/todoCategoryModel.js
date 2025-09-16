const db = require('../db');

class TodoCategoryModel {
  static async getAll(userId) {
    const result = await db.query(
      "SELECT * FROM todo_categories WHERE user_id = $1 ORDER BY name",
      [userId]
    );
    return result.rows;
  }

  static async create(userId, name) {
    if (!name) {
      const error = new Error("カテゴリー名は必須です。");
      error.status = 400;
      throw error;
    }

    const result = await db.query(
      "INSERT INTO todo_categories (user_id, name) VALUES ($1, $2) RETURNING *",
      [userId, name]
    );
    return result.rows[0];
  }

  static async findByIdAndUser(id, userId) {
    const result = await db.query("SELECT * FROM todo_categories WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, name) {
    if (!name) {
      const error = new Error("カテゴリー名は必須です。");
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
      "UPDATE todo_categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [name, id]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const usageCheck = await db.query("SELECT id FROM todos WHERE todo_category_id = $1 AND user_id = $2", [id, userId]);
    if (usageCheck.rows.length > 0) {
      const error = new Error("このカテゴリーは既に使用されているため削除できません。");
      error.status = 409;
      throw error;
    }

    const result = await db.query("DELETE FROM todo_categories WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rows.length === 0) {
      const error = new Error("対象のカテゴリーが見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = TodoCategoryModel;