const db = require('./db');

afterAll(() => {
  db.end();
});
