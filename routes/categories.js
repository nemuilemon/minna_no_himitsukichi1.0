const express = require('express');
const router = express.Router();
const CategoryModel = require('../models/categoryModel');
const authenticateToken = require('../middleware/auth');

// ## カテゴリー取得API (GET /api/categories) ##
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const allCategories = await CategoryModel.getAll(userId);
    res.json(allCategories);
  } catch (error) {
    next(error);
  }
});

// ## カテゴリー追加API (POST /api/categories) ##
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.userId;

    const newCategory = await CategoryModel.create(userId, name, type);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

// ## カテゴリー更新API (PUT /api/categories/:id) ##
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.userId;

    const updatedCategory = await CategoryModel.update(id, userId, name, type);

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

// ## カテゴリー削除API (DELETE /api/categories/:id) ##
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await CategoryModel.delete(id, userId);

    res.json({ message: "カテゴリーが正常に削除されました。" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
