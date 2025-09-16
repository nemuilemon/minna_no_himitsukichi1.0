
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const authRouter = require('../routes/auth');
const UserModel = require('../models/userModel');

// Mock the UserModel
jest.mock('../models/userModel');

// Mock environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-testing';

const app = express();
app.use(express.json());
app.use('/api', authRouter);

describe('Authentication API Regression Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/login', () => {
    describe('Success Cases', () => {
      it('should return 200 OK and JWT token for valid credentials', async () => {
        const mockUser = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: 'hashedpassword'
        };

        UserModel.findByUsername.mockResolvedValue(mockUser);
        UserModel.validatePassword.mockResolvedValue(true);
        UserModel.updateLastAccessed.mockResolvedValue();

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');

        // Verify token is valid JWT
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.userId).toBe(1);

        // Verify all expected functions were called
        expect(UserModel.findByUsername).toHaveBeenCalledWith('testuser');
        expect(UserModel.validatePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(UserModel.updateLastAccessed).toHaveBeenCalledWith(1);
      });

      it('should handle valid login with special characters in username', async () => {
        const mockUser = {
          id: 2,
          username: 'test.user@domain',
          password_hash: 'hashedpassword'
        };

        UserModel.findByUsername.mockResolvedValue(mockUser);
        UserModel.validatePassword.mockResolvedValue(true);
        UserModel.updateLastAccessed.mockResolvedValue();

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'test.user@domain', password: 'validpass' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
      });

      it('should handle login with maximum length password', async () => {
        const mockUser = {
          id: 3,
          username: 'testuser',
          password_hash: 'hashedpassword'
        };

        const longPassword = 'a'.repeat(1000); // Very long password

        UserModel.findByUsername.mockResolvedValue(mockUser);
        UserModel.validatePassword.mockResolvedValue(true);
        UserModel.updateLastAccessed.mockResolvedValue();

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: longPassword });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized for incorrect password', async () => {
        const mockUser = {
          id: 1,
          username: 'testuser',
          password_hash: 'hashedpassword'
        };

        UserModel.findByUsername.mockResolvedValue(mockUser);
        UserModel.validatePassword.mockResolvedValue(false);

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'パスワードが正しくありません。');
        expect(res.body).not.toHaveProperty('token');

        // Should not update last accessed on failed login
        expect(UserModel.updateLastAccessed).not.toHaveBeenCalled();
      });

      it('should return 401 Unauthorized for non-existent user', async () => {
        UserModel.findByUsername.mockResolvedValue(null);

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'nonexistent', password: 'password123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'ユーザーが見つかりません。');
        expect(res.body).not.toHaveProperty('token');

        // Should not try to validate password for non-existent user
        expect(UserModel.validatePassword).not.toHaveBeenCalled();
        expect(UserModel.updateLastAccessed).not.toHaveBeenCalled();
      });

      it('should return 401 for empty username', async () => {
        const res = await request(app)
          .post('/api/login')
          .send({ username: '', password: 'password123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'ユーザーが見つかりません。');
      });

      it('should return 401 for empty password', async () => {
        const mockUser = {
          id: 1,
          username: 'testuser',
          password_hash: 'hashedpassword'
        };

        UserModel.findByUsername.mockResolvedValue(mockUser);
        UserModel.validatePassword.mockResolvedValue(false);

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: '' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'パスワードが正しくありません。');
      });

      it('should return 401 for missing username field', async () => {
        const res = await request(app)
          .post('/api/login')
          .send({ password: 'password123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'ユーザーが見つかりません。');
      });

      it('should return 401 for missing password field', async () => {
        const mockUser = {
          id: 1,
          username: 'testuser',
          password_hash: 'hashedpassword'
        };

        UserModel.findByUsername.mockResolvedValue(mockUser);
        UserModel.validatePassword.mockResolvedValue(false);

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'パスワードが正しくありません。');
      });

      it('should handle database errors gracefully', async () => {
        UserModel.findByUsername.mockRejectedValue(new Error('Database connection failed'));

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: 'password123' });

        expect(res.statusCode).toBe(500);
      });
    });

    describe('Security Tests', () => {
      it('should not leak sensitive information in error responses', async () => {
        UserModel.findByUsername.mockResolvedValue(null);

        const res = await request(app)
          .post('/api/login')
          .send({ username: 'nonexistent', password: 'password123' });

        expect(res.body).not.toHaveProperty('password_hash');
        expect(res.body).not.toHaveProperty('salt');
        expect(JSON.stringify(res.body)).not.toContain('hashedpassword');
      });

      it('should handle SQL injection attempts in username', async () => {
        const maliciousUsername = "'; DROP TABLE users; --";
        UserModel.findByUsername.mockResolvedValue(null);

        const res = await request(app)
          .post('/api/login')
          .send({ username: maliciousUsername, password: 'password123' });

        expect(res.statusCode).toBe(401);
        expect(UserModel.findByUsername).toHaveBeenCalledWith(maliciousUsername);
      });
    });
  });

  describe('POST /api/guest-login', () => {
    describe('Success Cases', () => {
      it('should return 200 OK and JWT token for guest login', async () => {
        const mockGuestUser = {
          id: 999,
          username: 'guest',
          email: 'guest@example.com'
        };

        UserModel.findOrCreateGuest.mockResolvedValue(mockGuestUser);
        UserModel.updateLastAccessed.mockResolvedValue();

        const res = await request(app)
          .post('/api/guest-login')
          .send();

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');

        // Verify token is valid JWT
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.userId).toBe(999);

        expect(UserModel.findOrCreateGuest).toHaveBeenCalled();
        expect(UserModel.updateLastAccessed).toHaveBeenCalledWith(999);
      });

      it('should work without any request body', async () => {
        const mockGuestUser = {
          id: 999,
          username: 'guest'
        };

        UserModel.findOrCreateGuest.mockResolvedValue(mockGuestUser);
        UserModel.updateLastAccessed.mockResolvedValue();

        const res = await request(app)
          .post('/api/guest-login');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
      });
    });

    describe('Failure Cases', () => {
      it('should handle guest user creation errors', async () => {
        UserModel.findOrCreateGuest.mockRejectedValue(new Error('Guest creation failed'));

        const res = await request(app)
          .post('/api/guest-login')
          .send();

        expect(res.statusCode).toBe(500);
      });
    });
  });

  describe('POST /api/register', () => {
    describe('Success Cases', () => {
      it('should return 201 Created for valid registration', async () => {
        const mockNewUser = {
          id: 5,
          username: 'newuser',
          email: 'new@example.com'
        };

        UserModel.create.mockResolvedValue(mockNewUser);

        const res = await request(app)
          .post('/api/register')
          .send({
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'アカウントが正常に作成されました。');
        expect(res.body).toHaveProperty('userId', 5);
        expect(UserModel.create).toHaveBeenCalledWith('newuser', 'new@example.com', 'password123');
      });
    });

    describe('Failure Cases', () => {
      it('should handle duplicate username registration', async () => {
        const duplicateError = new Error('Username already exists');
        duplicateError.code = '23505'; // PostgreSQL unique violation
        UserModel.create.mockRejectedValue(duplicateError);

        const res = await request(app)
          .post('/api/register')
          .send({
            username: 'existinguser',
            email: 'new@example.com',
            password: 'password123'
          });

        expect(res.statusCode).toBe(500);
      });

      it('should handle missing required fields', async () => {
        const res = await request(app)
          .post('/api/register')
          .send({
            username: 'newuser'
            // Missing email and password
          });

        expect(res.statusCode).toBe(500);
      });
    });
  });

  describe('Token Generation', () => {
    it('should generate tokens with correct expiration time', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashedpassword'
      };

      UserModel.findByUsername.mockResolvedValue(mockUser);
      UserModel.validatePassword.mockResolvedValue(true);
      UserModel.updateLastAccessed.mockResolvedValue();

      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' });

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);

      // Token should expire in approximately 1 hour (3600 seconds)
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(3600);
    });

    it('should generate unique tokens for different users', async () => {
      const mockUser1 = { id: 1, username: 'user1', password_hash: 'hash1' };
      const mockUser2 = { id: 2, username: 'user2', password_hash: 'hash2' };

      UserModel.validatePassword.mockResolvedValue(true);
      UserModel.updateLastAccessed.mockResolvedValue();

      // First user login
      UserModel.findByUsername.mockResolvedValue(mockUser1);
      const res1 = await request(app)
        .post('/api/login')
        .send({ username: 'user1', password: 'password123' });

      // Second user login
      UserModel.findByUsername.mockResolvedValue(mockUser2);
      const res2 = await request(app)
        .post('/api/login')
        .send({ username: 'user2', password: 'password123' });

      expect(res1.body.token).not.toBe(res2.body.token);

      const decoded1 = jwt.verify(res1.body.token, process.env.JWT_SECRET);
      const decoded2 = jwt.verify(res2.body.token, process.env.JWT_SECRET);

      expect(decoded1.userId).toBe(1);
      expect(decoded2.userId).toBe(2);
    });
  });
});
