const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// 今後、ユーザー設定（プロファイル更新、パスワード変更など）のAPIをここに追加します。

module.exports = router;
