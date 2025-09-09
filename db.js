// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',       // ご自身のPostgreSQLユーザー名
  host: 'localhost',
  database: process.env.postgres_database, // ご自身のデータベース名
  password: process.env.postgres_database_password,  // ご自身のパスワード
  port: 5432,
});

module.exports = pool;
