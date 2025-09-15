// server.js

// 1. Expressと必要なライブラリをインポートする
const express = require('express');
require('dotenv').config();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const pool = require('./db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 2. Expressアプリのインスタンスを作成する
const app = express();
app.use(express.json());

// セキュリティミドルウェアの設定
app.use(helmet());

const corsOptions = {
  origin: 'http://localhost:4000', // クライアントのオリジン
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// プロキシサーバーを信頼する設定 (express-rate-limitのため)
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 3. サーバーがリッスンするポート番号を設定する
const port = 3000;

// 4. ルーターをインポートして使用する
const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');
const eventsRouter = require('./routes/events');
const transactionsRouter = require('./routes/transactions');
const categoriesRouter = require('./routes/categories');
const todoCategoriesRouter = require('./routes/todo_categories');
const userRouter = require('./routes/user');

app.use('/api', authRouter);
app.use('/api/todos', todosRouter);
app.use('/api/events', eventsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/todo-categories', todoCategoriesRouter);
app.use('/api/user', userRouter);

// 5. ルートURL ('/') へのGETリクエストに対する処理
app.get('/', (req, res) => {
  res.send('皆の秘密基地サーバーへようこそ！');
});

// 6. 指定したポートでサーバーを起動
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました。 http://localhost:${port}`);
});


// --- ▼▼ ここから「生存確認」機能の実装 ▼▼ ---

// 1. メール送信の設定 (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // .envファイルにご自身のGmailアドレスを記載
    pass: process.env.GMAIL_APP_PASSWORD, // .envファイルにご自身のGmailアプリパスワードを記載
  },
});

// 2. スケジュール実行処理 (node-cron)
cron.schedule('0 1 * * *', async () => {
  console.log('生存確認のスケジュールタスクを実行します...');
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await pool.query(
      "SELECT id, username, email FROM users WHERE last_accessed_at < $1",
      [thirtyDaysAgo]
    );

    if (inactiveUsers.rows.length === 0) {
      console.log('アクティブでないユーザーはいませんでした。');
      return;
    }

    console.log(`${inactiveUsers.rows.length}人のアクティブでないユーザーが見つかりました。メールを送信します...`);

    for (const user of inactiveUsers.rows) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: '【皆の秘密基地】お変わりなくお過ごしですか？',
        text: `${user.username}様\n\nお久しぶりです。「皆の秘密基地」です。\n最近ログインされていないようですが、お元気にされていますでしょうか？\n\nまたいつでも、あなたの秘密基地へのお越しをお待ちしております。\n\nhttps://example.com`, // ↑実際のアプリのURLに変更してください
        html: `<p>${user.username}様</p><p>お久しぶりです。「皆の秘密基地」です。<br>最近ログインされていないようですが、お元気にされていますでしょうか？</p><p>またいつでも、あなたの秘密基地へのお越しをお待ちしております。</p><p><a href="https://example.com">「皆の秘密基地」へアクセスする</a></p>`, // ↑実際のアプリのURLに変更してください
      };

      await transporter.sendMail(mailOptions);
      console.log(`${user.email} へのメール送信に成功しました。`);
    }

  } catch (error) {
    console.error('生存確認タスク中にエラーが発生しました:', error);
  }
});

// --- ▲▲ ここまで「生存確認」機能の実装 ---

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
