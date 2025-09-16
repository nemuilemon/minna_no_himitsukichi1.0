
const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');
const UserModel = require('../models/userModel');

// Mock the UserModel
jest.mock('../models/userModel');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const mockUser = { id: 1, username: 'testuser', password_hash: 'hashedpassword' };
      UserModel.findByUsername.mockResolvedValue(mockUser);
      UserModel.validatePassword.mockResolvedValue(true);
      UserModel.updateLastAccessed.mockResolvedValue();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for incorrect password', async () => {
      const mockUser = { id: 1, username: 'testuser', password_hash: 'hashedpassword' };
      UserModel.findByUsername.mockResolvedValue(mockUser);
      UserModel.validatePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'パスワードが正しくありません。');
    });

    it('should return 401 for non-existent user', async () => {
      UserModel.findByUsername.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'ユーザーが見つかりません。');
    });
  });
});
