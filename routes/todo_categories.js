const express = require('express');
const router = express.Router();
const TodoCategoryModel = require('../models/todoCategoryModel');
const authenticateToken = require('../middleware/auth');

// ## ToDoカテゴリー取得API (GET /api/todo-categories) ##
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const allCategories = await TodoCategoryModel.getAll(userId);
    res.json(allCategories);
  } catch (error) {
    next(error);
  }
});

// ## ToDoカテゴリー追加API (POST /api/todo-categories) ##
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const newCategory = await TodoCategoryModel.create(userId, name);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

// ## ToDoカテゴリー更新API (PUT /api/todo-categories/:id) ##
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    const updatedCategory = await TodoCategoryModel.update(id, userId, name);

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

// ## ToDoカテゴリー削除API (DELETE /api/todo-categories/:id) ##
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await TodoCategoryModel.delete(id, userId);

    res.json({ message: "カテゴリーが正常に削除されました。" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
