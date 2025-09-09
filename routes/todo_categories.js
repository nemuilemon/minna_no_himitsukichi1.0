const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// ## ToDoカテゴリー取得API (GET /api/todo-categories) ##
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const allCategories = await pool.query(
      "SELECT * FROM todo_categories WHERE user_id = $1 ORDER BY name",
      [userId]
    );
    res.json(allCategories.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## ToDoカテゴリー追加API (POST /api/todo-categories) ##
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: "カテゴリー名は必須です。" });
    }

    const newCategory = await pool.query(
      "INSERT INTO todo_categories (user_id, name) VALUES ($1, $2) RETURNING *",
      [userId, name]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## ToDoカテゴリー更新API (PUT /api/todo-categories/:id) ##
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: "カテゴリー名は必須です。" });
    }

    const category = await pool.query("SELECT * FROM todo_categories WHERE id = $1 AND user_id = $2", [id, userId]);
    if (category.rows.length === 0) {
      return res.status(404).json({ error: "対象のカテゴリーが見つからないか、アクセス権がありません。" });
    }

    const updatedCategory = await pool.query(
      "UPDATE todo_categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [name, id]
    );

    res.json(updatedCategory.rows[0]);
  } catch (error) {
    console.error(error.message);
    if (error.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'そのカテゴリー名は既に使用されています。' });
    }
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## ToDoカテゴリー削除API (DELETE /api/todo-categories/:id) ##
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // カテゴリが使用中でないか確認
    const usageCheck = await pool.query("SELECT id FROM todos WHERE todo_category_id = $1 AND user_id = $2", [id, userId]);
    if (usageCheck.rows.length > 0) {
        return res.status(409).json({ error: "このカテゴリーは既に使用されているため削除できません。" });
    }

    const deleteOp = await pool.query("DELETE FROM todo_categories WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "対象のカテゴリーが見つからないか、アクセス権がありません。" });
    }

    res.json({ message: "カテゴリーが正常に削除されました。" });
});

module.exports = router;
