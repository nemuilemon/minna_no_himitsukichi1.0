# Testing Documentation

## Frontend Testing (Client-Side)

## **Quick Start**

```bash
# Run all frontend tests
npm run test:frontend

# Run specific component tests
npx jest client/src/components/Login.test.js --config jest.config.frontend.js
npx jest client/src/components/TodoList.test.js --config jest.config.frontend.js
npx jest client/src/components/Dashboard.test.js --config jest.config.frontend.js

# Run tests with verbose output
npm run test:frontend -- --verbose

# Run tests in watch mode (re-runs on file changes)
npm run test:frontend -- --watch
```

## **Test Structure Overview**

```
client/src/components/
├── Login.test.js          # Login component tests
├── TodoList.test.js       # TodoList component tests
└── Dashboard.test.js      # Dashboard component tests

jest.config.frontend.js    # Frontend Jest configuration
jest.setup.frontend.js     # Test setup file
__mocks__/
└── styleMock.js          # CSS import mock
```

## **Test Categories**

### **1. Login Component Tests (11 tests)**

**Success Cases:**
- ✅ Successful login with valid credentials
- ✅ Guest login functionality

**Failure Cases:**
- ✅ Empty username validation
- ✅ Empty password validation
- ✅ Invalid credentials handling
- ✅ Network error handling

**UI Tests:**
- ✅ All form elements render
- ✅ Error message interactions

### **2. TodoList Component Tests (18 tests)**

**Success Cases:**
- ✅ Add new task via form
- ✅ Mark task complete/incomplete
- ✅ Delete tasks
- ✅ Edit tasks via dialog
- ✅ Category selection

**Failure Cases:**
- ✅ Empty task validation
- ✅ API error handling

**UI Features:**
- ✅ Category management
- ✅ Empty state display
- ✅ Loading spinner
- ✅ Dialog interactions

### **3. Dashboard Component Tests (13 tests)**

**Success Cases:**
- ✅ Widget display (user, todos, calendar, budget)
- ✅ Sidebar navigation
- ✅ Data formatting

**Error Handling:**
- ✅ API failures
- ✅ Loading states

**Responsive:**
- ✅ Mobile/desktop drawer behavior

## **Running Specific Test Scenarios**

```bash
# Run only success cases
npx jest --config jest.config.frontend.js --testNamePattern="Success Cases"

# Run only failure cases
npx jest --config jest.config.frontend.js --testNamePattern="Failure Cases"

# Run specific test
npx jest --config jest.config.frontend.js --testNamePattern="should navigate to dashboard after successful login"

# Run tests for specific component
npx jest Login.test.js --config jest.config.frontend.js

# Run with coverage report
npx jest --config jest.config.frontend.js --coverage
```

## **Test Debugging**

```bash
# Run tests with detailed output
npx jest --config jest.config.frontend.js --verbose --no-cache

# Debug specific failing test
npx jest Login.test.js --config jest.config.frontend.js --verbose --runInBand

# Silent mode (minimal output)
npx jest --config jest.config.frontend.js --silent
```

## **Understanding Test Output**

**✅ Passing Test:**
```
✓ should navigate to dashboard after successful login (149 ms)
```

**❌ Failing Test:**
```
✗ should display error message for invalid credentials (40 ms)

TestingLibraryElementError: Unable to find element with text: Invalid credentials
```

**Test Summary:**
```
Test Suites: 2 passed, 2 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        6.074 s
```

## **Common Testing Patterns Used**

### **1. User Interaction Testing**
```javascript
// Fill form and submit
fireEvent.change(screen.getByRole('textbox', { name: /username/i }), {
  target: { value: 'testuser' }
});
fireEvent.click(screen.getByRole('button', { name: /login/i }));
```

### **2. Async State Testing**
```javascript
// Wait for API response
await waitFor(() => {
  expect(mockLogin).toHaveBeenCalledWith('fake-jwt-token');
});
```

### **3. Error Handling**
```javascript
// Mock API failure
fetch.mockRejectedValueOnce(new Error('Network error'));
// ... trigger action
await waitFor(() => {
  expect(screen.getByText('Network error')).toBeInTheDocument();
});
```

## **Mocking Strategy**

### **API Mocking (axios):**
```javascript
// Mock successful response
mockedAxios.get.mockResolvedValueOnce({
  data: [{ id: 1, title: 'Test Todo' }]
});

// Mock error response
mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));
```

### **Context Providers:**
```javascript
const TestWrapper = ({ children }) => (
  <AuthProvider>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </AuthProvider>
);
```

## **Test Maintenance**

### **Adding New Tests:**
1. Follow existing patterns in test files
2. Use descriptive test names
3. Group related tests in `describe` blocks
4. Mock external dependencies appropriately

### **Updating Tests When Components Change:**
1. Update selectors if UI elements change
2. Adjust mocks if API interfaces change
3. Add tests for new functionality
4. Remove obsolete test cases

## **Troubleshooting Common Issues**

### **Element Not Found:**
```bash
# Check what's actually rendered
screen.debug(); // Add to test to see DOM
```

### **Async Timing Issues:**
```javascript
// Use waitFor for async operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 3000 }); // Increase timeout if needed
```

### **Mock Issues:**
```javascript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  mockedAxios.get.mockClear();
});
```

## **Integration with CI/CD**

```bash
# Production test run (for CI)
npm run test:frontend -- --watchAll=false --coverage --testResultsProcessor="jest-junit"

# Test with specific timeout
npm run test:frontend -- --testTimeout=10000
```

## **Best Practices**

1. **Test User Workflows:** Focus on actual user interactions
2. **Use Semantic Selectors:** Prefer `getByRole`, `getByLabelText` over class selectors
3. **Mock External Dependencies:** Always mock HTTP requests and external libraries
4. **Test Error States:** Don't just test happy paths
5. **Keep Tests Isolated:** Each test should be independent
6. **Use Descriptive Names:** Test names should explain what they verify

## **Test Coverage Areas**

### **Login Component (`Login.test.js`)**
- Form validation (empty fields)
- Successful authentication flow
- Guest login functionality
- Error handling (invalid credentials, network errors)
- UI element rendering and interactions

### **TodoList Component (`TodoList.test.js`)**
- CRUD operations (Create, Read, Update, Delete todos)
- Task completion toggling
- Category management
- Form validation
- Drag and drop functionality
- Empty states and loading states
- Error handling for API failures

### **Dashboard Component (`Dashboard.test.js`)**
- Widget data display (todos, calendar, financial summary)
- Navigation between components
- Responsive design (mobile/desktop)
- Data formatting and calculations
- Error states and loading indicators
- User interactions (logout, drawer toggle)

This testing setup provides comprehensive coverage of your frontend components and ensures regression protection for critical user workflows.

---

## Backend Testing (API)

### **Quick Start**

```bash
# Run all backend tests
npm run test:backend

# Run specific test file
npx jest tests/auth.test.js --config jest.config.backend.js
npx jest tests/todos.test.js --config jest.config.backend.js
npx jest tests/transactions.test.js --config jest.config.backend.js

# Run tests with verbose output
npm run test:backend -- --verbose

# Run tests in watch mode
npm run test:backend -- --watch

# Run with coverage
npm run test:backend -- --coverage
```

### **Test Structure Overview**

```
tests/
├── auth.test.js           # Authentication API tests
├── todos.test.js          # Todos API tests
└── transactions.test.js   # Transactions API tests

jest.config.backend.js     # Backend Jest configuration
jest.setup.backend.js      # Test setup file
```

### **Test Categories**

#### **1. Authentication API Tests (`auth.test.js`)**

**Success Cases:**
- ✅ POST `/api/login` with valid credentials returns 200 OK and JWT token
- ✅ POST `/api/guest-login` returns 200 OK and JWT token
- ✅ POST `/api/register` returns 201 Created for valid registration
- ✅ Token generation with correct expiration (1 hour)
- ✅ Unique tokens for different users

**Failure Cases:**
- ✅ POST `/api/login` returns 401 Unauthorized for incorrect password
- ✅ POST `/api/login` returns 401 Unauthorized for non-existent user
- ✅ Validation for empty username/password fields
- ✅ Database error handling
- ✅ Security: No sensitive data leakage in error responses
- ✅ SQL injection attempt handling

**Coverage: 20+ test cases**

#### **2. Todos API Tests (`todos.test.js`)**

**Success Cases:**
- ✅ GET `/api/todos` returns array of user's todos
- ✅ POST `/api/todos` returns 201 Created with new todo object
- ✅ PUT `/api/todos/:id` updates todo and returns updated object
- ✅ DELETE `/api/todos/:id` deletes todo with success message
- ✅ GET `/api/todos/priority` returns priority todos
- ✅ PUT `/api/todos/reorder` reorders todos successfully

**Failure Cases:**
- ✅ 401 Unauthorized without auth token
- ✅ Database error handling
- ✅ Invalid data type handling
- ✅ Non-existent todo handling

**Data Isolation:**
- ✅ Users can only access their own todos
- ✅ Prevents unauthorized access to other users' data

**Coverage: 25+ test cases**

#### **3. Transactions API Tests (`transactions.test.js`)**

**Success Cases:**
- ✅ GET `/api/transactions` returns user's transaction history
- ✅ POST `/api/transactions` returns 201 Created with new transaction
- ✅ PUT `/api/transactions/:id` updates transaction successfully
- ✅ DELETE `/api/transactions/:id` deletes transaction
- ✅ GET `/api/transactions/summary/current-month` returns financial summary

**Failure Cases:**
- ✅ 401 Unauthorized without auth token
- ✅ 400 Bad Request for negative amounts (validation test)
- ✅ 400 Bad Request for string amounts (validation test)
- ✅ 400 Bad Request for zero amounts
- ✅ Invalid transaction type handling
- ✅ Invalid date format handling
- ✅ Database constraint violations

**Input Validation Edge Cases:**
- ✅ Decimal amounts (99.99)
- ✅ Very small amounts (0.01)
- ✅ Large amounts (999999.99)
- ✅ Empty descriptions
- ✅ Very long descriptions

**Data Isolation:**
- ✅ Users can only access their own transactions
- ✅ Prevents unauthorized access to financial data

**Coverage: 40+ test cases**

### **Running Specific Test Scenarios**

```bash
# Run only success cases
npx jest --config jest.config.backend.js --testNamePattern="Success Cases"

# Run only failure cases
npx jest --config jest.config.backend.js --testNamePattern="Failure Cases"

# Run specific test
npx jest --config jest.config.backend.js --testNamePattern="should return 200 OK and JWT token"

# Run authentication tests only
npx jest tests/auth.test.js --config jest.config.backend.js

# Run with coverage report
npx jest --config jest.config.backend.js --coverage
```

### **Test Debugging**

```bash
# Run tests with detailed output
npx jest --config jest.config.backend.js --verbose --no-cache

# Debug specific failing test
npx jest tests/auth.test.js --config jest.config.backend.js --verbose --runInBand

# Single worker mode (helpful for debugging)
npx jest --config jest.config.backend.js --maxWorkers=1
```

### **Understanding Backend Test Output**

**✅ Passing Test:**
```
✓ should return 200 OK and JWT token for valid credentials (45 ms)
```

**❌ Failing Test:**
```
✗ should return 401 Unauthorized for incorrect password (23 ms)

expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 500
```

### **API Testing Patterns Used**

#### **1. HTTP Status Code Testing**
```javascript
expect(res.statusCode).toBe(200);
expect(res.statusCode).toBe(401);
expect(res.statusCode).toBe(500);
```

#### **2. Response Body Validation**
```javascript
expect(res.body).toHaveProperty('token');
expect(res.body).toEqual(expectedObject);
expect(Array.isArray(res.body)).toBe(true);
```

#### **3. Model Function Call Verification**
```javascript
expect(UserModel.findByUsername).toHaveBeenCalledWith('testuser');
expect(TodoModel.create).toHaveBeenCalledWith(1, 'New Todo', ...);
```

#### **4. Authentication Testing**
```javascript
// Mock authenticated user
app.use('/api/todos', (req, res, next) => {
  req.user = { userId: 1 };
  next();
}, todosRouter);

// Mock unauthorized access
app.use('/api/todos', (req, res, next) => {
  res.status(401).json({ error: 'Unauthorized' });
}, todosRouter);
```

### **Mocking Strategy**

#### **Model Mocking:**
```javascript
jest.mock('../models/todoModel');
TodoModel.getAll.mockResolvedValue(mockData);
TodoModel.create.mockRejectedValue(new Error('Database error'));
```

#### **Authentication Mocking:**
```javascript
// Different users for isolation testing
const createApp = (authMock = null) => {
  // Setup different auth scenarios
  req.user = { userId: 1 }; // User 1
  req.user = { userId: 2 }; // User 2
};
```

### **Data Isolation Verification**

The tests verify critical security requirements:

1. **User Data Isolation**: Each user can only access their own data
2. **Authentication Required**: All protected endpoints require valid auth
3. **Input Validation**: Invalid data is properly rejected
4. **Error Handling**: Database errors are handled gracefully

### **Test Coverage Areas**

#### **Authentication (`routes/auth.js`)**
- Login with username/password
- Guest login functionality
- User registration
- JWT token generation and validation
- Error handling for invalid credentials

#### **Todos (`routes/todos.js`)**
- CRUD operations (Create, Read, Update, Delete)
- Priority todo filtering
- Todo reordering
- Category management
- Data isolation between users

#### **Transactions (`routes/transactions.js`)**
- Financial transaction CRUD operations
- Monthly summary calculations
- Input validation (amounts, dates, types)
- Data isolation between users
- Edge case handling

### **Integration with CI/CD**

```bash
# Production test run (for CI)
npm run test:backend -- --ci --coverage --watchAll=false

# Test with specific timeout
npm run test:backend -- --testTimeout=10000

# Parallel execution
npm run test:backend -- --maxWorkers=4
```

### **Best Practices for Backend Testing**

1. **Test API Contracts**: Verify exact status codes and response formats
2. **Mock External Dependencies**: Database models, external APIs
3. **Test Data Isolation**: Ensure users can't access each other's data
4. **Validate Input Edge Cases**: Negative numbers, very large values, invalid formats
5. **Test Error Scenarios**: Database failures, invalid authentication
6. **Security Testing**: SQL injection attempts, unauthorized access

This comprehensive backend testing setup ensures that your API endpoints function correctly according to their specifications and provides protection against regressions in critical business logic.