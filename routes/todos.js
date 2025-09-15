const express = require('express');
const router = express.Router();
const TodoModel = require('../models/todoModel');
const authenticateToken = require('../middleware/auth');

// ## ToDo作成API (POST /api/todos) ##
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, priority, due_date, todo_category_id } = req.body;
    const userId = req.user.userId;

    const newTodo = await TodoModel.create(userId, title, description, priority, due_date, todo_category_id);

    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
});

// ## ToDo取得API (GET /api/todos) ##
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const allTodos = await TodoModel.getAll(userId);

    res.json(allTodos);
  } catch (error) {
    next(error);
  }
});

// ## 優先ToDo取得API (GET /api/todos/priority) ##
router.get('/priority', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const priorityTodos = await TodoModel.getPriority(userId);

    res.json(priorityTodos);
  } catch (error) {
    next(error);
  }
});

// ## ToDoの並び順更新API (PUT /api/todos/reorder) ##
router.put('/reorder', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { todos } = req.body; // フロントから送られてくる、並び替えられたToDoの配列

    await TodoModel.reorder(userId, todos);

    res.json({ message: "ToDoの並び順が正常に更新されました。" });
  } catch (error) {
    next(error);
  }
});

// ## ToDo更新API (PUT /api/todos/:id) ##
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, priority, due_date, todo_category_id, is_completed } = req.body;

    const updatedTodo = await TodoModel.update(id, userId, title, description, priority, due_date, todo_category_id, is_completed);

    res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
});

// ## ToDo削除API (DELETE /api/todos/:id) ##
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await TodoModel.delete(id, userId);

    res.json({ message: "ToDoが正常に削除されました。" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;