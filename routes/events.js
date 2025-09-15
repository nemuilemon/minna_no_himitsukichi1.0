const express = require('express');
const router = express.Router();
const EventModel = require('../models/eventModel');
const authenticateToken = require('../middleware/auth');

// ## 予定作成API (POST /api/events) ##
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, start_at, end_at, location, description, is_recurring, recurrence_rule } = req.body;
    const userId = req.user.userId;

    const newEvent = await EventModel.create(userId, title, start_at, end_at, location, description, is_recurring, recurrence_rule);

    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
});

// ## 予定取得API (GET /api/events) ##
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const allEvents = await EventModel.getAll(userId);

    res.json(allEvents);
  } catch (error) {
    next(error);
  }
});

// ## 今日の予定取得API (GET /api/events/today) ##
router.get('/today', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const todaysEvents = await EventModel.getToday(userId);

    res.json(todaysEvents);
  } catch (error) {
    next(error);
  }
});

// ## 予定更新API (PUT /api/events/:id) ##
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, start_at, end_at, location, description, is_recurring, recurrence_rule} = req.body;

    const updatedEvent = await EventModel.update(id, userId, title, start_at, end_at, location, description, is_recurring, recurrence_rule);

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
});

// ## 予定削除API (DELETE /api/events/:id) ##
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await EventModel.delete(id, userId);

    res.json({ message: "予定が正常に削除されました。" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
