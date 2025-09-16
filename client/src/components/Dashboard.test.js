import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock child components
jest.mock('./TodoList', () => {
  return function MockTodoList() {
    return <div data-testid="todo-list">Todo List Component</div>;
  };
});

jest.mock('./Calendar', () => {
  return function MockEventCalendar() {
    return <div data-testid="event-calendar">Event Calendar Component</div>;
  };
});

jest.mock('./Transactions', () => {
  return function MockTransactions() {
    return <div data-testid="transactions">Transactions Component</div>;
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock useAuth hook
const mockLogout = jest.fn();
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    logout: mockLogout
  })
}));

// Test wrapper with providers
const TestWrapper = ({ children }) => (
  <AuthProvider>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </AuthProvider>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockLogout.mockClear();
    mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');

    // Mock successful API responses by default
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/transactions/summary/current-month')) {
        return Promise.resolve({
          data: {
            income: 50000,
            expense: 30000,
            balance: 20000
          }
        });
      }
      if (url.includes('/api/events/upcoming')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: 'Meeting',
              start_at: new Date().toISOString(),
              end_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      }
      if (url.includes('/api/todos/priority')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: 'Important Task',
              due_date: new Date().toISOString()
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  describe('Success Cases', () => {
    test('should display dashboard widgets after login', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard data to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Check if widgets are displayed
      expect(screen.getByText('ToDo')).toBeInTheDocument();
      expect(screen.getByText('今後の予定 (7日間)')).toBeInTheDocument();
      expect(screen.getByText('今月の家計簿')).toBeInTheDocument();

      // Check if user data is displayed
      expect(screen.getByText('Important Task')).toBeInTheDocument();
      expect(screen.getByText('Meeting')).toBeInTheDocument();
      expect(screen.getByText('50,000 円')).toBeInTheDocument();
      expect(screen.getByText('30,000 円')).toBeInTheDocument();
      expect(screen.getByText('20,000 円')).toBeInTheDocument();
    });

    test('should switch to transactions component when clicking on sidebar', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Click on Transactions (家計簿) in sidebar
      const transactionsButton = screen.getByText('家計簿');
      fireEvent.click(transactionsButton);

      // Should switch to transactions component
      await waitFor(() => {
        expect(screen.getByTestId('transactions')).toBeInTheDocument();
      });
    });

    test('should switch to todo component when clicking on sidebar', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Click on TodoList in sidebar
      const todoButton = screen.getByText('ToDoリスト');
      fireEvent.click(todoButton);

      // Should switch to todo component
      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      });
    });

    test('should switch to calendar component when clicking on sidebar', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Click on Calendar (日程管理) in sidebar
      const calendarButton = screen.getByText('日程管理');
      fireEvent.click(calendarButton);

      // Should switch to calendar component
      await waitFor(() => {
        expect(screen.getByTestId('event-calendar')).toBeInTheDocument();
      });
    });

    test('should logout when clicking logout button', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Click logout button
      const logoutButton = screen.getByText('ログアウト');
      fireEvent.click(logoutButton);

      // Should call logout function
      expect(mockLogout).toHaveBeenCalled();
    });

    test('should navigate to detailed views from widget links', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Click on "ToDoリスト全体を見る" link
      const todoLink = screen.getByText('ToDoリスト全体を見る');
      fireEvent.click(todoLink);

      // Should switch to todo component
      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      });
    });

    test('should display empty state when no data available', async () => {
      // Mock empty responses
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/api/transactions/summary/current-month')) {
          return Promise.resolve({
            data: {
              income: 0,
              expense: 0,
              balance: 0
            }
          });
        }
        if (url.includes('/api/events/upcoming')) {
          return Promise.resolve({ data: [] });
        }
        if (url.includes('/api/todos/priority')) {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: [] });
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Check for empty state messages
      expect(screen.getByText('優先ToDoはありません')).toBeInTheDocument();
      expect(screen.getByText('今後の予定はありません')).toBeInTheDocument();
      expect(screen.getByText('取引がありません')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should display error message when API calls fail', async () => {
      // Mock API error
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('データの取得に失敗しました。ページを再読み込みしてください。')).toBeInTheDocument();
      });
    });

    test('should show loading spinner while fetching data', () => {
      // Mock delayed response
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should show loading spinner
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should handle mobile drawer toggle', async () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Mobile menu button should be present
      const menuButton = screen.getByLabelText('open drawer');
      expect(menuButton).toBeInTheDocument();

      // Click menu button to open mobile drawer
      fireEvent.click(menuButton);

      // Should be able to navigate via mobile menu
      const todoButtonMobile = screen.getAllByText('ToDoリスト')[0]; // Get first one (mobile menu)
      fireEvent.click(todoButtonMobile);

      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      });
    });

    test('should handle desktop drawer collapse', async () => {
      // Mock desktop screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Find and click the collapse button (chevron)
      const collapseButton = screen.getByRole('button', { name: /折りたたむ|expand/i });
      fireEvent.click(collapseButton);

      // Drawer should still be functional after collapse
      const todoButton = screen.getByText('ToDoリスト');
      fireEvent.click(todoButton);

      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    test('should display correct financial summary calculations', async () => {
      // Mock specific financial data
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/api/transactions/summary/current-month')) {
          return Promise.resolve({
            data: {
              income: 100000,
              expense: 75000,
              balance: 25000
            }
          });
        }
        return Promise.resolve({ data: [] });
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Check if financial data is displayed correctly
      expect(screen.getByText('100,000 円')).toBeInTheDocument();
      expect(screen.getByText('75,000 円')).toBeInTheDocument();
      expect(screen.getByText('25,000 円')).toBeInTheDocument();

      // Check expense ratio (75000/100000 = 75%)
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    test('should display upcoming events with proper date formatting', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const today = new Date();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/api/events/upcoming')) {
          return Promise.resolve({
            data: [
              {
                id: 1,
                title: 'Today Meeting',
                start_at: today.toISOString(),
                end_at: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString()
              },
              {
                id: 2,
                title: 'Tomorrow Meeting',
                start_at: tomorrow.toISOString(),
                end_at: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString()
              }
            ]
          });
        }
        return Promise.resolve({ data: [] });
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
      });

      // Check if events are displayed with proper labels
      expect(screen.getByText('Today Meeting')).toBeInTheDocument();
      expect(screen.getByText('Tomorrow Meeting')).toBeInTheDocument();
      expect(screen.getByText('今日')).toBeInTheDocument();
      expect(screen.getByText('明日')).toBeInTheDocument();
    });
  });
});