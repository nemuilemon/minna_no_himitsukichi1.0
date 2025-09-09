const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

// ## アカウント登録API (/api/register) ##
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash, last_accessed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "アカウントが正常に作成されました。", userId: newUser.rows[0].id });
});

// ## ログインAPI (/api/login) ##
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "ユーザーが見つかりません。" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "パスワードが正しくありません。" });
    }
    
    await pool.query("UPDATE users SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = $1", [user.rows[0].id]);

    const token = jwt.sign(
      { userId: user.rows[0].id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
});


// ## ゲストログインAPI (/api/guest-login) ##
router.post('/guest-login', async (req, res) => {
    try {
        let user = await pool.query("SELECT * FROM users WHERE username = 'guest'");

        if (user.rows.length === 0) {
            // ゲストユーザーが存在しない場合、作成する
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('guestpassword', salt); // ダミーのパスワード
            const newUser = await pool.query(
                "INSERT INTO users (username, email, password_hash, last_accessed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
                ['guest', 'guest@example.com', hashedPassword]
            );
            user = newUser;
        }

        await pool.query("UPDATE users SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = $1", [user.rows[0].id]);

        const token = jwt.sign(
            { userId: user.rows[0].id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("サーバーエラー");
    }
});

module.exports = router;

