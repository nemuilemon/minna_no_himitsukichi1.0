const db = require('../db');

class EventModel {
  static async create(userId, title, start_at, end_at, location, description, is_recurring, recurrence_rule) {
    if (!title || !start_at || !end_at) {
      const error = new Error("タイトル、開始日時、終了日時は必須です。");
      error.status = 400;
      throw error;
    }

    const result = await db.query(
      `INSERT INTO events (user_id, title, start_at, end_at, location, description, is_recurring, recurrence_rule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, start_at, end_at, location, description, is_recurring ?? false, recurrence_rule ?? null]
    );

    return result.rows[0];
  }

  static async getAll(userId) {
    const result = await db.query("SELECT * FROM events WHERE user_id = $1 ORDER BY start_at ASC", [userId]);
    return result.rows;
  }

  static async getToday(userId) {
    const result = await db.query(
      `SELECT * FROM events
       WHERE user_id = $1 AND DATE(start_at) = CURRENT_DATE
       ORDER BY start_at ASC`,
      [userId]
    );

    return result.rows;
  }

  static async getUpcoming(userId, days = 7) {
    const result = await db.query(
      `SELECT * FROM events
       WHERE user_id = $1
       AND start_at >= CURRENT_DATE
       AND start_at <= CURRENT_DATE + INTERVAL '${days} days'
       ORDER BY start_at ASC
       LIMIT 10`,
      [userId]
    );

    return result.rows;
  }

  static async findByIdAndUser(id, userId) {
    const result = await db.query("SELECT * FROM events WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, title, start_at, end_at, location, description, is_recurring, recurrence_rule) {
    const event = await this.findByIdAndUser(id, userId);
    if (!event) {
      const error = new Error("対象の予定が見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    const result = await db.query(
      `UPDATE events
       SET title = $1, start_at = $2, end_at = $3, location = $4, description = $5, is_recurring = $6, recurrence_rule = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, start_at, end_at, location, description, is_recurring ?? false, recurrence_rule ?? null, id]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query("DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rows.length === 0) {
      const error = new Error("対象の予定が見つからないか、アクセス権がありません。");
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = EventModel;