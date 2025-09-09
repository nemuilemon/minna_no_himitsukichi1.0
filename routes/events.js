const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// ## 予定作成API (POST /api/events) ##
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, start_at, end_at, location, description, is_recurring, recurrence_rule } = req.body;
    const userId = req.user.userId;

    if (!title || !start_at || !end_at) {
      return res.status(400).json({ error: "タイトル、開始日時、終了日時は必須です。" });
    }

    const newEvent = await pool.query(
      `INSERT INTO events (user_id, title, start_at, end_at, location, description, is_recurring, recurrence_rule) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, start_at, end_at, location, description, is_recurring ?? false, recurrence_rule ?? null]
    );

    res.status(201).json(newEvent.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 予定取得API (GET /api/events) ##
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const allEvents = await pool.query("SELECT * FROM events WHERE user_id = $1 ORDER BY start_at ASC", [userId]);

    res.json(allEvents.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 今日の予定取得API (GET /api/events/today) ##
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // start_at（タイムスタンプ）を日付に変換し、今日の日付と比較
    const todaysEvents = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 AND DATE(start_at) = CURRENT_DATE 
       ORDER BY start_at ASC`,
      [userId]
    );

    res.json(todaysEvents.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 予定更新API (PUT /api/events/:id) ##
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, start_at, end_at, location, description, is_recurring, recurrence_rule} = req.body;

    const event = await pool.query("SELECT * FROM events WHERE id = $1 AND user_id = $2", [id, userId]);
    if (event.rows.length === 0) {
      return res.status(404).json({ error: "対象の予定が見つからないか、アクセス権がありません。" });
    }

    const updatedEvent = await pool.query(
      `UPDATE events 
       SET title = $1, start_at = $2, end_at = $3, location = $4, description = $5, is_recurring = $6, recurrence_rule = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 RETURNING *`,
      [title, start_at, end_at, location, description, is_recurring ?? false, recurrence_rule ?? null, id]
    );

    res.json(updatedEvent.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## 予定削除API (DELETE /api/events/:id) ##
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleteOp = await pool.query("DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "対象の予定が見つからないか、アクセス権がありません。" });
    }

    res.json({ message: "予定が正常に削除されました。" });
});

module.exports = router;
