const jwt = require('jsonwebtoken');
const pool = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    
    try {
        await pool.query("UPDATE users SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = $1", [user.userId]);
    } catch (dbError) {
        console.error("Failed to update last_accessed_at:", dbError);
    }

    next();
  });
};

module.exports = authenticateToken;
