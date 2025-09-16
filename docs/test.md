# Frontend Testing Documentation

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