const db = require('../db');

class TodoModel {
  static async create(userId, title, description, priority, due_date, todo_category_id) {
    if (!title) {
      const error = new Error("タイトルは必須です。");
      error.status = 400;
      throw error;
    }

    const result = await db.query(
      "INSERT INTO todos (user_id, title, description, priority, due_date, todo_category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, title, description, priority, due_date, todo_category_id]
    );

    return result.rows[0];
  }

  static async getAll(userId) {
    const result = await db.query(
      `SELECT t.*, tc.name AS category_name
       FROM todos t
       LEFT JOIN todo_categories tc ON t.todo_category_id = tc.id
       WHERE t.user_id = $1
       ORDER BY t.position ASC NULLS LAST, t.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  static async getPriority(userId) {
    const result = await db.query(
      `SELECT t.*, tc.name AS category_name
       FROM todos t
       LEFT JOIN todo_categories tc ON t.todo_category_id = tc.id
       WHERE t.user_id = $1 AND t.is_completed = false
       ORDER BY t.due_date ASC NULLS LAST, t.priority DESC NULLS LAST, t.created_at DESC
       LIMIT 5`,
      [userId]
    );

    return result.rows;
  }

  static async reorder(userId, todos) {
    if (!Array.isArray(todos)) {
      const error = new Error("ToDoリストのデータ形式が正しくありません。");
      error.status = 400;
      throw error;
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      for (let i = 0; i < todos.length; i++) {
        const todoId = todos[i].id;
        const newPosition = i;
        await client.query(
          "UPDATE todos SET position = $1 WHERE id = $2 AND user_id = $3",
          [newPosition, todoId, userId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByIdAndUser(id, userId) {
    const result = await db.query("SELECT * FROM todos WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, title, description, priority, due_date, todo_category_id, is_completed) {
    const todo = await this.findByIdAndUser(id, userId);
    if (!todo) {
      const error = new Error("対象のToDoが見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    const result = await db.query(
      "UPDATE todos SET title = $1, description = $2, priority = $3, due_date = $4, todo_category_id = $5, is_completed = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [title, description, priority, due_date, todo_category_id, is_completed, id]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query("DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rows.length === 0) {
      const error = new Error("対象のToDoが見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = TodoModel;