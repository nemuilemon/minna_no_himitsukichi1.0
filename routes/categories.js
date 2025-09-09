const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// ## カテゴリー取得API (GET /api/categories) ##
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const allCategories = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name", 
      [userId]
    );
    res.json(allCategories.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## カテゴリー追加API (POST /api/categories) ##
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.userId;

    if (!name || !type) {
      return res.status(400).json({ error: "カテゴリー名と種類は必須です。" });
    }
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: "種類は 'income' または 'expense' である必要があります。" });
    }

    const newCategory = await pool.query(
      "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, type]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## カテゴリー更新API (PUT /api/categories/:id) ##
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.userId;

    if (!name || !type) {
      return res.status(400).json({ error: "カテゴリー名と種類は必須です。" });
    }

    const category = await pool.query("SELECT * FROM categories WHERE id = $1 AND user_id = $2", [id, userId]);
    if (category.rows.length === 0) {
      return res.status(404).json({ error: "対象のカテゴリーが見つからないか、アクセス権がありません。" });
    }

    const updatedCategory = await pool.query(
      "UPDATE categories SET name = $1, type = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, type, id]
    );

    res.json(updatedCategory.rows[0]);
  } catch (error) {
    console.error(error.message);
    if (error.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'そのカテゴリーは既に使用されています。' });
    }
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## カテゴリー削除API (DELETE /api/categories/:id) ##
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const usageCheck = await pool.query("SELECT id FROM transactions WHERE category_id = $1 AND user_id = $2", [id, userId]);
    if (usageCheck.rows.length > 0) {
        return res.status(409).json({ error: "このカテゴリーは既に使用されているため削除できません。" });
    }

    const deleteOp = await pool.query("DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "対象のカテゴリーが見つからないか、アクセス権がありません。" });
    }

    res.json({ message: "カテゴリーが正常に削除されました。" });
});

module.exports = router;
