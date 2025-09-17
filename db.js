// dotenvライブラリを読み込む
const dotenv = require('dotenv');
// fsライブラリ（ファイルを読み込むためのNode.js標準機能）を読み込む
const fs = require('fs');

// .envファイルの中身をテキストとして読み込む
const envConfig = dotenv.parse(fs.readFileSync('.env'));

// PostgreSQLライブラリを読み込む
const { Pool } = require('pg');

// パースしたenvConfigオブジェクトから、直接接続情報を取り出す！
const pool = new Pool({
  user: envConfig.DB_USER,
  host: envConfig.DB_HOST,
  database: envConfig.DB_DATABASE,
  password: envConfig.DB_PASSWORD,
  port: envConfig.DB_PORT,
});

// 接続テスト（おまじない）
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('データベース接続エラー:', err);
  } else {
    console.log('データベース接続プールが正常に初期化されました。');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  end: () => pool.end(),
};