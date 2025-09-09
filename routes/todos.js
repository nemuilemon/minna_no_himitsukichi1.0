const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// ## ToDo作成API (POST /api/todos) ##
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, due_date, todo_category_id } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({ error: "タイトルは必須です。" });
    }

    const newTodo = await pool.query(
      "INSERT INTO todos (user_id, title, description, priority, due_date, todo_category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, title, description, priority, due_date, todo_category_id]
    );

    res.status(201).json(newTodo.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## ToDo取得API (GET /api/todos) ##
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    const allTodos = await pool.query(
      `SELECT t.*, tc.name AS category_name 
       FROM todos t
       LEFT JOIN todo_categories tc ON t.todo_category_id = tc.id
       WHERE t.user_id = $1 
       ORDER BY t.position ASC NULLS LAST, t.created_at DESC`,
      [userId]
    );

    res.json(allTodos.rows);
});

// ## 優先ToDo取得API (GET /api/todos/priority) ##
router.get('/priority', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const priorityTodos = await pool.query(
      `SELECT t.*, tc.name AS category_name 
       FROM todos t
       LEFT JOIN todo_categories tc ON t.todo_category_id = tc.id
       WHERE t.user_id = $1 AND t.is_completed = false
       ORDER BY t.due_date ASC NULLS LAST, t.priority DESC NULLS LAST, t.created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json(priorityTodos.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## ToDoの並び順更新API (PUT /api/todos/reorder) ##
router.put('/reorder', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { todos } = req.body; // フロントから送られてくる、並び替えられたToDoの配列

  if (!Array.isArray(todos)) {
    return res.status(400).json({ error: "ToDoリストのデータ形式が正しくありません。" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // トランザクション開始

    // 配列の順番通りに position を更新
    for (let i = 0; i < todos.length; i++) {
      const todoId = todos[i].id;
      const newPosition = i;
      await client.query(
        "UPDATE todos SET position = $1 WHERE id = $2 AND user_id = $3",
        [newPosition, todoId, userId]
      );
    }

    await client.query('COMMIT'); // トランザクション確定
    res.json({ message: "ToDoの並び順が正常に更新されました。" });

  } catch (error) {
    await client.query('ROLLBACK'); // エラー発生時はロールバック
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  } finally {
    client.release(); // コネクションをプールに返却
  }
});

// ## ToDo更新API (PUT /api/todos/:id) ##
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, priority, due_date, todo_category_id, is_completed } = req.body;

    const todo = await pool.query("SELECT * FROM todos WHERE id = $1 AND user_id = $2", [id, userId]);
    if (todo.rows.length === 0) {
      return res.status(404).json({ error: "対象のToDoが見つからないか、アクセス権がありません。" });
    }

    const updatedTodo = await pool.query(
      "UPDATE todos SET title = $1, description = $2, priority = $3, due_date = $4, todo_category_id = $5, is_completed = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [title, description, priority, due_date, todo_category_id, is_completed, id]
    );

    res.json(updatedTodo.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// ## ToDo削除API (DELETE /api/todos/:id) ##
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleteOp = await pool.query("DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "対象のToDoが見つからないか、アクセス権がありません。" });
    }

    res.json({ message: "ToDoが正常に削除されました。" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

module.exports = router;