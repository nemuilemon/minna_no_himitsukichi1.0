const db = require('../db');
const bcrypt = require('bcrypt');

class UserModel {
  static async create(username, email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      "INSERT INTO users (username, email, password_hash, last_accessed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
      [username, email, hashedPassword]
    );

    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    return result.rows[0];
  }

  static async updateLastAccessed(userId) {
    await db.query("UPDATE users SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
  }

  static async findOrCreateGuest() {
    let user = await this.findByUsername('guest');

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('guestpassword', salt);
      const result = await db.query(
        "INSERT INTO users (username, email, password_hash, last_accessed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
        ['guest', 'guest@example.com', hashedPassword]
      );
      user = result.rows[0];
    }

    return user;
  }

  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = UserModel;