const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const JWT_SECRET = process.env.JWT_SECRET;

// ## アカウント登録API (/api/register) ##
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = await UserModel.create(username, email, password);

    res.status(201).json({ message: "アカウントが正常に作成されました。", userId: newUser.id });
  } catch (error) {
    next(error);
  }
});

// ## ログインAPI (/api/login) ##
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "ユーザーが見つかりません。" });
    }

    const validPassword = await UserModel.validatePassword(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "パスワードが正しくありません。" });
    }

    await UserModel.updateLastAccessed(user.id);

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
});


// ## ゲストログインAPI (/api/guest-login) ##
router.post('/guest-login', async (req, res, next) => {
    try {
        const user = await UserModel.findOrCreateGuest();

        await UserModel.updateLastAccessed(user.id);

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

