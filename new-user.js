const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

// --- ここに新しいユーザーの情報を入力 ---
const newUser = {
  username: 'nemuilemon',
  email: 'myq116600@gmail.com',
  password: 'Yingye34'
};
// ------------------------------------

const createUser = async () => {
  console.log('新しいユーザーの作成を開始します...');

  try {
    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    console.log('パスワードをハッシュ化しました。');

    // データベースにユーザーを挿入
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, last_accessed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, username, email",
      [newUser.username, newUser.email, hashedPassword]
    );

    console.log('✅ ユーザーが正常に作成されました！');
    console.log('--- 作成されたユーザー情報 ---');
    console.log(result.rows[0]);
    console.log('--------------------------');

  } catch (error) {
    if (error.code === '23505') { // unique_violation
        console.error('❌ エラー: ユーザー名またはメールアドレスが既に使用されています。');
    } else {
        console.error('❌ ユーザー作成中にエラーが発生しました:', error);
    }
  } finally {
    // データベース接続を閉じる
    await pool.end();
    console.log('データベース接続を閉じました。');
  }
};

createUser();
