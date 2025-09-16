module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./jest.setup.backend.js'],
  globals: {
    afterAll: (done) => {
      const db = require('./db');
      db.end();
      done();
    }
  }
};
