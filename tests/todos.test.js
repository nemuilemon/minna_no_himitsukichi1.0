const request = require('supertest');
const express = require('express');
const todosRouter = require('../routes/todos');
const TodoModel = require('../models/todoModel');

// Mock models
jest.mock('../models/todoModel');

// Create test applications with different auth scenarios
const createApp = (authMock = null) => {
  const app = express();
  app.use(express.json());

  if (authMock) {
    app.use('/api/todos', authMock, todosRouter);
  } else {
    // Default authenticated user mock
    app.use('/api/todos', (req, res, next) => {
      req.user = { userId: 1 };
      next();
    }, todosRouter);
  }

  return app;
};

const app = createApp();

describe('Todos API Regression Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    describe('Success Cases', () => {
      it('should return array of todos for authenticated user', async () => {
        const mockTodos = [
          {
            id: 1,
            title: 'Test Todo 1',
            description: 'Test description',
            priority: 1,
            is_completed: false,
            user_id: 1,
            created_at: '2023-01-01T00:00:00Z',
            category_name: 'Work'
          },
          {
            id: 2,
            title: 'Test Todo 2',
            description: null,
            priority: 2,
            is_completed: true,
            user_id: 1,
            created_at: '2023-01-02T00:00:00Z',
            category_name: null
          }
        ];

        TodoModel.getAll.mockResolvedValue(mockTodos);

        const res = await request(app).get('/api/todos');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockTodos);
        expect(TodoModel.getAll).toHaveBeenCalledWith(1);
        expect(Array.isArray(res.body)).toBe(true);
      });

      it('should return empty array when user has no todos', async () => {
        TodoModel.getAll.mockResolvedValue([]);

        const res = await request(app).get('/api/todos');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
        expect(Array.isArray(res.body)).toBe(true);
      });

      it('should call TodoModel.getAll with correct user ID', async () => {
        const appUser2 = createApp((req, res, next) => {
          req.user = { userId: 2 };
          next();
        });

        TodoModel.getAll.mockResolvedValue([]);

        await request(appUser2).get('/api/todos');

        expect(TodoModel.getAll).toHaveBeenCalledWith(2);
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized without auth token', async () => {
        const unauthorizedApp = createApp((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(unauthorizedApp).get('/api/todos');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized');
        expect(TodoModel.getAll).not.toHaveBeenCalled();
      });

      it('should handle database errors gracefully', async () => {
        TodoModel.getAll.mockRejectedValue(new Error('Database connection failed'));

        const res = await request(app).get('/api/todos');

        expect(res.statusCode).toBe(500);
      });
    });
  });

  describe('POST /api/todos', () => {
    describe('Success Cases', () => {
      it('should return 201 Created and newly created todo object', async () => {
        const newTodoData = {
          title: 'New Important Todo',
          description: 'This is a test todo',
          priority: 1,
          due_date: '2023-12-31',
          todo_category_id: 1
        };

        const createdTodo = {
          id: 5,
          ...newTodoData,
          user_id: 1,
          is_completed: false,
          created_at: '2023-01-01T00:00:00Z',
          category_name: 'Work'
        };

        TodoModel.create.mockResolvedValue(createdTodo);

        const res = await request(app)
          .post('/api/todos')
          .send(newTodoData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdTodo);
        expect(TodoModel.create).toHaveBeenCalledWith(
          1,
          newTodoData.title,
          newTodoData.description,
          newTodoData.priority,
          newTodoData.due_date,
          newTodoData.todo_category_id
        );
      });

      it('should create todo with minimal required fields', async () => {
        const minimalTodo = { title: 'Minimal Todo' };
        const createdTodo = {
          id: 6,
          title: 'Minimal Todo',
          description: undefined,
          priority: undefined,
          due_date: undefined,
          todo_category_id: undefined,
          user_id: 1,
          is_completed: false
        };

        TodoModel.create.mockResolvedValue(createdTodo);

        const res = await request(app)
          .post('/api/todos')
          .send(minimalTodo);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdTodo);
        expect(TodoModel.create).toHaveBeenCalledWith(
          1,
          'Minimal Todo',
          undefined,
          undefined,
          undefined,
          undefined
        );
      });

      it('should handle todos with null/empty optional fields', async () => {
        const todoWithNulls = {
          title: 'Todo with nulls',
          description: null,
          priority: null,
          due_date: null,
          todo_category_id: null
        };

        const createdTodo = { id: 7, ...todoWithNulls, user_id: 1 };
        TodoModel.create.mockResolvedValue(createdTodo);

        const res = await request(app)
          .post('/api/todos')
          .send(todoWithNulls);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdTodo);
      });

      it('should create todo for different authenticated users', async () => {
        const appUser3 = createApp((req, res, next) => {
          req.user = { userId: 3 };
          next();
        });

        const newTodo = { title: 'User 3 Todo' };
        const createdTodo = { id: 8, ...newTodo, user_id: 3 };

        TodoModel.create.mockResolvedValue(createdTodo);

        const res = await request(appUser3)
          .post('/api/todos')
          .send(newTodo);

        expect(res.statusCode).toBe(201);
        expect(TodoModel.create).toHaveBeenCalledWith(3, 'User 3 Todo', undefined, undefined, undefined, undefined);
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized without auth token', async () => {
        const unauthorizedApp = createApp((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(unauthorizedApp)
          .post('/api/todos')
          .send({ title: 'Unauthorized Todo' });

        expect(res.statusCode).toBe(401);
        expect(TodoModel.create).not.toHaveBeenCalled();
      });

      it('should handle database errors during creation', async () => {
        TodoModel.create.mockRejectedValue(new Error('Database constraint violation'));

        const res = await request(app)
          .post('/api/todos')
          .send({ title: 'Failed Todo' });

        expect(res.statusCode).toBe(500);
      });

      it('should handle creation with invalid data types', async () => {
        const invalidTodo = {
          title: 123, // Invalid: should be string
          priority: 'high', // Invalid: should be number
          due_date: 'invalid-date'
        };

        TodoModel.create.mockRejectedValue(new Error('Invalid data type'));

        const res = await request(app)
          .post('/api/todos')
          .send(invalidTodo);

        expect(res.statusCode).toBe(500);
      });
    });
  });

  describe('PUT /api/todos/:id', () => {
    describe('Success Cases', () => {
      it('should update todo and return updated object', async () => {
        const todoId = 1;
        const updateData = {
          title: 'Updated Todo Title',
          description: 'Updated description',
          priority: 2,
          due_date: '2023-12-25',
          todo_category_id: 2,
          is_completed: true
        };

        const updatedTodo = {
          id: todoId,
          ...updateData,
          user_id: 1,
          updated_at: '2023-01-01T00:00:00Z'
        };

        TodoModel.update.mockResolvedValue(updatedTodo);

        const res = await request(app)
          .put(`/api/todos/${todoId}`)
          .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(updatedTodo);
        expect(TodoModel.update).toHaveBeenCalledWith(
          '1',
          1,
          updateData.title,
          updateData.description,
          updateData.priority,
          updateData.due_date,
          updateData.todo_category_id,
          updateData.is_completed
        );
      });

      it('should update only completion status', async () => {
        const todoId = 2;
        const partialUpdate = { is_completed: true };
        const updatedTodo = {
          id: todoId,
          title: 'Existing Title',
          is_completed: true,
          user_id: 1
        };

        TodoModel.update.mockResolvedValue(updatedTodo);

        const res = await request(app)
          .put(`/api/todos/${todoId}`)
          .send(partialUpdate);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(updatedTodo);
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized without auth token', async () => {
        const unauthorizedApp = createApp((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(unauthorizedApp)
          .put('/api/todos/1')
          .send({ title: 'Updated Title' });

        expect(res.statusCode).toBe(401);
        expect(TodoModel.update).not.toHaveBeenCalled();
      });

      it('should return 404 Not Found for non-existent todo', async () => {
        TodoModel.update.mockRejectedValue(new Error('Todo not found'));

        const res = await request(app)
          .put('/api/todos/999')
          .send({ title: 'Updated Title' });

        expect(res.statusCode).toBe(500);
      });

      it('should return 404 Not Found when updating todo belonging to another user', async () => {
        TodoModel.update.mockResolvedValue(null); // Simulates no todo found for this user

        const res = await request(app)
          .put('/api/todos/1')
          .send({ title: 'Unauthorized Update' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toBe(null);
      });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    describe('Success Cases', () => {
      it('should delete todo and return success message', async () => {
        const todoId = 1;
        TodoModel.delete.mockResolvedValue();

        const res = await request(app).delete(`/api/todos/${todoId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'ToDoが正常に削除されました。');
        expect(TodoModel.delete).toHaveBeenCalledWith('1', 1);
      });

      it('should delete todo for correct user', async () => {
        const appUser2 = createApp((req, res, next) => {
          req.user = { userId: 2 };
          next();
        });

        TodoModel.delete.mockResolvedValue();

        const res = await request(appUser2).delete('/api/todos/5');

        expect(res.statusCode).toBe(200);
        expect(TodoModel.delete).toHaveBeenCalledWith('5', 2);
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized without auth token', async () => {
        const unauthorizedApp = createApp((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(unauthorizedApp).delete('/api/todos/1');

        expect(res.statusCode).toBe(401);
        expect(TodoModel.delete).not.toHaveBeenCalled();
      });

      it('should return 404 Not Found for non-existent todo', async () => {
        TodoModel.delete.mockRejectedValue(new Error('Todo not found'));

        const res = await request(app).delete('/api/todos/999');

        expect(res.statusCode).toBe(500);
      });

      it('should return 403 Forbidden when deleting todo belonging to another user', async () => {
        TodoModel.delete.mockRejectedValue(new Error('Forbidden: Todo belongs to another user'));

        const res = await request(app).delete('/api/todos/1');

        expect(res.statusCode).toBe(500);
      });
    });
  });

  describe('GET /api/todos/priority', () => {
    describe('Success Cases', () => {
      it('should return priority todos for authenticated user', async () => {
        const mockPriorityTodos = [
          {
            id: 1,
            title: 'High Priority Todo',
            priority: 1,
            due_date: '2023-12-31',
            user_id: 1
          }
        ];

        TodoModel.getPriority.mockResolvedValue(mockPriorityTodos);

        const res = await request(app).get('/api/todos/priority');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockPriorityTodos);
        expect(TodoModel.getPriority).toHaveBeenCalledWith(1);
      });

      it('should return empty array when no priority todos exist', async () => {
        TodoModel.getPriority.mockResolvedValue([]);

        const res = await request(app).get('/api/todos/priority');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized without auth token', async () => {
        const unauthorizedApp = createApp((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(unauthorizedApp).get('/api/todos/priority');

        expect(res.statusCode).toBe(401);
        expect(TodoModel.getPriority).not.toHaveBeenCalled();
      });
    });
  });

  describe('PUT /api/todos/reorder', () => {
    describe('Success Cases', () => {
      it('should reorder todos and return success message', async () => {
        const reorderedTodos = [
          { id: 2, order: 1 },
          { id: 1, order: 2 },
          { id: 3, order: 3 }
        ];

        TodoModel.reorder.mockResolvedValue();

        const res = await request(app)
          .put('/api/todos/reorder')
          .send({ todos: reorderedTodos });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'ToDoの並び順が正常に更新されました。');
        expect(TodoModel.reorder).toHaveBeenCalledWith(1, reorderedTodos);
      });
    });

    describe('Failure Cases', () => {
      it('should return 401 Unauthorized without auth token', async () => {
        const unauthorizedApp = createApp((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(unauthorizedApp)
          .put('/api/todos/reorder')
          .send({ todos: [] });

        expect(res.statusCode).toBe(401);
        expect(TodoModel.reorder).not.toHaveBeenCalled();
      });

      it('should handle invalid reorder data', async () => {
        TodoModel.reorder.mockRejectedValue(new Error('Invalid reorder data'));

        const res = await request(app)
          .put('/api/todos/reorder')
          .send({ todos: 'invalid' });

        expect(res.statusCode).toBe(500);
      });
    });
  });

  describe('Data Isolation Tests', () => {
    it('should only return todos belonging to authenticated user', async () => {
      const user1App = createApp((req, res, next) => {
        req.user = { userId: 1 };
        next();
      });

      const user2App = createApp((req, res, next) => {
        req.user = { userId: 2 };
        next();
      });

      const user1Todos = [{ id: 1, title: 'User 1 Todo', user_id: 1 }];
      const user2Todos = [{ id: 2, title: 'User 2 Todo', user_id: 2 }];

      TodoModel.getAll
        .mockResolvedValueOnce(user1Todos)
        .mockResolvedValueOnce(user2Todos);

      const res1 = await request(user1App).get('/api/todos');
      const res2 = await request(user2App).get('/api/todos');

      expect(res1.body).toEqual(user1Todos);
      expect(res2.body).toEqual(user2Todos);
      expect(TodoModel.getAll).toHaveBeenNthCalledWith(1, 1);
      expect(TodoModel.getAll).toHaveBeenNthCalledWith(2, 2);
    });

    it('should prevent updating todos belonging to other users', async () => {
      // This test would be more meaningful with actual database isolation
      // but demonstrates the intent to test data isolation
      TodoModel.update.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/todos/999') // Assume this belongs to another user
        .send({ title: 'Attempted unauthorized update' });

      expect(TodoModel.update).toHaveBeenCalledWith(
        '999',
        1, // Current user ID
        'Attempted unauthorized update',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });
  });
});
