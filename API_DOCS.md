# API Documentation

This document provides a summary of all available API endpoints.

## Authentication

### `POST /api/register`

- **Description:** Creates a new user account.
- **Request Body:**
    ```json
    {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    ```
- **Success Response (201):**
    ```json
    {
        "message": "アカウントが正常に作成されました。",
        "userId": 1
    }
    ```

### `POST /api/login`

- **Description:** Logs in a user and returns a JWT token.
- **Request Body:**
    ```json
    {
        "username": "testuser",
        "password": "password123"
    }
    ```
- **Success Response (200):**
    ```json
    {
        "token": "your_jwt_token"
    }
    ```

### `POST /api/guest-login`

- **Description:** Logs in as a guest user and returns a JWT token.
- **Request Body:** (None)
- **Success Response (200):**
    ```json
    {
        "token": "your_jwt_token"
    }
    ```

---

## Transactions

### `GET /api/transactions`

- **Description:** Retrieves all transactions for the logged-in user.
- **Success Response (200):**
    ```json
    [
        {
            "id": 1,
            "user_id": 1,
            "type": "expense",
            "amount": "50.00",
            "transaction_date": "2025-09-10T00:00:00.000Z",
            "category_id": 1,
            "description": "Lunch"
        }
    ]
    ```

### `POST /api/transactions`

- **Description:** Creates a new transaction.
- **Request Body:**
    ```json
    {
        "type": "expense",
        "amount": 50.00,
        "transaction_date": "2025-09-10",
        "category_id": 1,
        "description": "Lunch"
    }
    ```
- **Success Response (201):**
    ```json
    {
        "id": 2,
        "user_id": 1,
        "type": "expense",
        "amount": "50.00",
        "transaction_date": "2025-09-10T00:00:00.000Z",
        "category_id": 1,
        "description": "Lunch"
    }
    ```

### `PUT /api/transactions/:id`

- **Description:** Updates an existing transaction.
- **Request Body:**
    ```json
    {
        "type": "expense",
        "amount": 55.00,
        "transaction_date": "2025-09-10",
        "category_id": 1,
        "description": "Dinner"
    }
    ```
- **Success Response (200):**
    ```json
    {
        "id": 1,
        "user_id": 1,
        "type": "expense",
        "amount": "55.00",
        "transaction_date": "2025-09-10T00:00:00.000Z",
        "category_id": 1,
        "description": "Dinner"
    }
    ```

### `DELETE /api/transactions/:id`

- **Description:** Deletes a transaction.
- **Success Response (200):**
    ```json
    {
        "message": "取引が正常に削除されました。"
    }
    ```

### `GET /api/transactions/summary/current-month`

- **Description:** Retrieves a summary of transactions for the current month.
- **Success Response (200):**
    ```json
    {
        "income": "5000.00",
        "expense": "1200.00",
        "balance": "3800.00"
    }
    ```

---

## Categories (for Transactions)

### `GET /api/categories`

- **Description:** Retrieves all transaction categories for the logged-in user.
- **Success Response (200):**
    ```json
    [
        {
            "id": 1,
            "user_id": 1,
            "name": "Food",
            "type": "expense"
        }
    ]
    ```

### `POST /api/categories`

- **Description:** Creates a new transaction category.
- **Request Body:**
    ```json
    {
        "name": "Groceries",
        "type": "expense"
    }
    ```
- **Success Response (201):**
    ```json
    {
        "id": 2,
        "user_id": 1,
        "name": "Groceries",
        "type": "expense"
    }
    ```

### `PUT /api/categories/:id`

- **Description:** Updates an existing transaction category.
- **Request Body:**
    ```json
    {
        "name": "Supermarket",
        "type": "expense"
    }
    ```
- **Success Response (200):**
    ```json
    {
        "id": 1,
        "user_id": 1,
        "name": "Supermarket",
        "type": "expense"
    }
    ```

### `DELETE /api/categories/:id`

- **Description:** Deletes a transaction category.
- **Success Response (200):**
    ```json
    {
        "message": "カテゴリーが正常に削除されました。"
    }
    ```

---

## To-Do

### `GET /api/todos`

- **Description:** Retrieves all to-do items for the logged-in user.
- **Success Response (200):**
    ```json
    [
        {
            "id": 1,
            "user_id": 1,
            "title": "Buy milk",
            "description": "",
            "is_completed": false,
            "position": 0,
            "todo_category_id": 1
        }
    ]
    ```

### `POST /api/todos`

- **Description:** Creates a new to-do item.
- **Request Body:**
    ```json
    {
        "title": "Walk the dog",
        "description": "Morning walk",
        "todo_category_id": 2
    }
    ```
- **Success Response (201):**
    ```json
    {
        "id": 2,
        "user_id": 1,
        "title": "Walk the dog",
        "description": "Morning walk",
        "is_completed": false,
        "position": 1,
        "todo_category_id": 2
    }
    ```

### `PUT /api/todos/:id`

- **Description:** Updates a to-do item.
- **Request Body:**
    ```json
    {
        "title": "Walk the dog",
        "description": "Evening walk",
        "is_completed": true,
        "todo_category_id": 2
    }
    ```
- **Success Response (200):**
    ```json
    {
        "id": 2,
        "user_id": 1,
        "title": "Walk the dog",
        "description": "Evening walk",
        "is_completed": true,
        "position": 1,
        "todo_category_id": 2
    }
    ```

### `DELETE /api/todos/:id`

- **Description:** Deletes a to-do item.
- **Success Response (200):**
    ```json
    {
        "message": "ToDoが正常に削除されました。"
    }
    ```

### `PUT /api/todos/reorder`

- **Description:** Updates the order of to-do items.
- **Request Body:**
    ```json
    {
        "todos": [
            { "id": 2, "position": 0 },
            { "id": 1, "position": 1 }
        ]
    }
    ```
- **Success Response (200):**
    ```json
    {
        "message": "ToDoの並び順が正常に更新されました。"
    }
    ```

### `GET /api/todos/priority`

- **Description:** Retrieves high-priority to-do items.
- **Success Response (200):**
    ```json
    [
        {
            "id": 1,
            "user_id": 1,
            "title": "Urgent task",
            "description": "",
            "is_completed": false,
            "position": 0,
            "priority": 1,
            "todo_category_id": 1
        }
    ]
    ```

---

## To-Do Categories

### `GET /api/todo-categories`

- **Description:** Retrieves all to-do categories for the logged-in user.
- **Success Response (200):**
    ```json
    [
        {
            "id": 1,
            "user_id": 1,
            "name": "Work"
        }
    ]
    ```

### `POST /api/todo-categories`

- **Description:** Creates a new to-do category.
- **Request Body:**
    ```json
    {
        "name": "Personal"
    }
    ```
- **Success Response (201):**
    ```json
    {
        "id": 2,
        "user_id": 1,
        "name": "Personal"
    }
    ```

### `PUT /api/todo-categories/:id`

- **Description:** Updates a to-do category.
- **Request Body:**
    ```json
    {
        "name": "Home"
    }
    ```
- **Success Response (200):**
    ```json
    {
        "id": 1,
        "user_id": 1,
        "name": "Home"
    }
    ```

### `DELETE /api/todo-categories/:id`

- **Description:** Deletes a to-do category.
- **Success Response (200):**
    ```json
    {
        "message": "カテゴリーが正常に削除されました。"
    }
    ```

---

## Events (Calendar)

### `GET /api/events`

- **Description:** Retrieves all calendar events for the logged-in user.
- **Success Response (200):**
    ```json
    [
        {
            "id": 1,
            "user_id": 1,
            "title": "Team Meeting",
            "start_at": "2025-09-12T10:00:00.000Z",
            "end_at": "2025-09-12T11:00:00.000Z",
            "description": "Weekly sync"
        }
    ]
    ```

### `POST /api/events`

- **Description:** Creates a new calendar event.
- **Request Body:**
    ```json
    {
        "title": "Doctor's Appointment",
        "start_at": "2025-09-15T14:00:00.000Z",
        "end_at": "2025-09-15T15:00:00.000Z",
        "description": "Annual check-up"
    }
    ```
- **Success Response (201):**
    ```json
    {
        "id": 2,
        "user_id": 1,
        "title": "Doctor's Appointment",
        "start_at": "2025-09-15T14:00:00.000Z",
        "end_at": "2025-09-15T15:00:00.000Z",
        "description": "Annual check-up"
    }
    ```

### `PUT /api/events/:id`

- **Description:** Updates a calendar event.
- **Request Body:**
    ```json
    {
        "title": "Team Meeting",
        "start_at": "2025-09-12T10:30:00.000Z",
        "end_at": "2025-09-12T11:30:00.000Z",
        "description": "Weekly sync and planning"
    }
    ```
- **Success Response (200):**
    ```json
    {
        "id": 1,
        "user_id": 1,
        "title": "Team Meeting",
        "start_at": "2025-09-12T10:30:00.000Z",
        "end_at": "2025-09-12T11:30:00.000Z",
        "description": "Weekly sync and planning"
    }
    ```

### `DELETE /api/events/:id`

- **Description:** Deletes a calendar event.
- **Success Response (200):**
    ```json
    {
        "message": "予定が正常に削除されました。"
    }
    ```

### `GET /api/events/today`

- **Description:** Retrieves today's calendar events.
- **Success Response (200):**
    ```json
    [
        {
            "id": 3,
            "user_id": 1,
            "title": "Lunch with a friend",
            "start_at": "2025-09-16T12:00:00.000Z",
            "end_at": "2025-09-16T13:00:00.000Z",
            "description": ""
        }
    ]
    ```

### `GET /api/events/upcoming`

- **Description:** Retrieves upcoming calendar events (default: next 7 days).
- **Query Parameter:** `days` (e.g., `/api/events/upcoming?days=14`)
- **Success Response (200):**
    ```json
    [
        {
            "id": 4,
            "user_id": 1,
            "title": "Project Deadline",
            "start_at": "2025-09-20T17:00:00.000Z",
            "end_at": "2025-09-20T17:00:00.000Z",
            "description": "Submit the final report."
        }
    ]
    ```
