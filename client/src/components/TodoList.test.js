import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from './TodoList';
import { NotificationProvider } from '../context/NotificationContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock drag and drop
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }) => children,
  Droppable: ({ children }) => children({
    innerRef: jest.fn(),
    droppableProps: {},
    placeholder: null
  }),
  Draggable: ({ children, draggableId }) => children({
    innerRef: jest.fn(),
    draggableProps: {},
    dragHandleProps: {},
  }),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test wrapper with providers
const TestWrapper = ({ children }) => (
  <NotificationProvider>
    {children}
  </NotificationProvider>
);

describe('TodoList Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();
    mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');

    // Mock successful API responses by default
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/todos')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: 'Test Todo',
              is_completed: false,
              todo_category_id: 1,
              category_name: 'Work'
            },
            {
              id: 2,
              title: 'Completed Todo',
              is_completed: true,
              todo_category_id: null,
              category_name: null
            }
          ]
        });
      }
      if (url.includes('/api/todo-categories')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Work' },
            { id: 2, name: 'Personal' }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  describe('Success Cases', () => {
    test('should add new task when typing in input and clicking Add button', async () => {
      // Mock successful post response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          id: 3,
          title: 'New Task',
          is_completed: false,
          todo_category_id: null,
          category_name: null
        }
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Find input and add button
      const titleInput = screen.getByRole('textbox', { name: /タイトル/i });
      const addButton = screen.getByRole('button', { name: '追加' });

      // Type in new task
      fireEvent.change(titleInput, { target: { value: 'New Task' } });

      // Click add button
      fireEvent.click(addButton);

      // Verify API call was made
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/todos',
          { title: 'New Task', todo_category_id: null },
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });

      // Verify input is cleared
      expect(titleInput.value).toBe('');
    });

    test('should mark task as complete when clicking checkbox', async () => {
      // Mock successful put response
      mockedAxios.put.mockResolvedValueOnce({
        data: {
          id: 1,
          title: 'Test Todo',
          is_completed: true,
          todo_category_id: 1,
          category_name: 'Work'
        }
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Find the checkbox for the first todo
      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0];

      // Click checkbox to mark as complete
      fireEvent.click(firstCheckbox);

      // Verify API call was made
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          '/api/todos/1',
          {
            id: 1,
            title: 'Test Todo',
            todo_category_id: 1,
            category_name: 'Work',
            is_completed: true
          },
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });
    });

    test('should unmark completed task when clicking checkbox', async () => {
      // Mock successful put response
      mockedAxios.put.mockResolvedValueOnce({
        data: {
          id: 2,
          title: 'Completed Todo',
          is_completed: false,
          todo_category_id: null,
          category_name: null
        }
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
      });

      // Find the checkbox for the completed todo (should be checked)
      const checkboxes = screen.getAllByRole('checkbox');
      const completedCheckbox = checkboxes.find(checkbox => checkbox.checked);

      // Click checkbox to unmark as complete
      fireEvent.click(completedCheckbox);

      // Verify API call was made
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          '/api/todos/2',
          {
            id: 2,
            title: 'Completed Todo',
            todo_category_id: null,
            category_name: null,
            is_completed: false
          },
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });
    });

    test('should delete todo when clicking delete button', async () => {
      // Mock successful delete response
      mockedAxios.delete.mockResolvedValueOnce({});

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Find and click delete button
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[0]);

      // Verify API call was made
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          '/api/todos/1',
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });
    });

    test('should open edit dialog when clicking edit button', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Find and click edit button
      const editButtons = screen.getAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);

      // Verify edit dialog opens
      await waitFor(() => {
        expect(screen.getByText('ToDoを編集')).toBeInTheDocument();
      });

      // Verify the form is pre-filled with existing data
      const titleInput = screen.getByDisplayValue('Test Todo');
      expect(titleInput).toBeInTheDocument();
    });

    test('should update todo when editing and saving', async () => {
      // Mock successful put response
      mockedAxios.put.mockResolvedValueOnce({
        data: {
          id: 1,
          title: 'Updated Todo',
          is_completed: false,
          todo_category_id: 2,
          category_name: 'Personal'
        }
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Open edit dialog
      const editButtons = screen.getAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('ToDoを編集')).toBeInTheDocument();
      });

      // Edit the title
      const titleInput = screen.getByDisplayValue('Test Todo');
      fireEvent.change(titleInput, { target: { value: 'Updated Todo' } });

      // Click save button
      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      // Verify API call was made
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          '/api/todos/1',
          {
            title: 'Updated Todo',
            todo_category_id: 1,
            is_completed: false
          },
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });
    });

    test('should add todo with category selection', async () => {
      // Mock successful post response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          id: 3,
          title: 'Work Task',
          is_completed: false,
          todo_category_id: 1,
          category_name: 'Work'
        }
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Fill in title
      const titleInput = screen.getByRole('textbox', { name: /タイトル/i });
      fireEvent.change(titleInput, { target: { value: 'Work Task' } });

      // Select category
      const categorySelect = screen.getByRole('combobox');
      fireEvent.mouseDown(categorySelect);

      // Wait for dropdown to appear and select Work category
      await waitFor(() => {
        const workOption = screen.getByRole('option', { name: 'Work' });
        fireEvent.click(workOption);
      });

      // Click add button
      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      // Verify API call was made with category
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/todos',
          { title: 'Work Task', todo_category_id: 1 },
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });
    });
  });

  describe('Failure Cases', () => {
    test('should show warning when trying to add empty task', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Click add button without entering title
      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      // Verify no API call was made
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should show warning when trying to save empty todo title in edit dialog', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Open edit dialog
      const editButtons = screen.getAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('ToDoを編集')).toBeInTheDocument();
      });

      // Clear the title
      const titleInput = screen.getByDisplayValue('Test Todo');
      fireEvent.change(titleInput, { target: { value: '' } });

      // Click save button
      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      // Verify no API call was made
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });

    test('should handle API error when adding todo', async () => {
      // Mock API error
      mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Try to add todo
      const titleInput = screen.getByRole('textbox', { name: /タイトル/i });
      const addButton = screen.getByRole('button', { name: '追加' });

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.click(addButton);

      // Verify API call was made but failed
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test('should handle API error when toggling todo completion', async () => {
      // Mock API error
      mockedAxios.put.mockRejectedValueOnce(new Error('Server error'));

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Try to toggle completion
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Verify API call was made but failed
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalled();
      });
    });
  });

  describe('Category Management', () => {
    test('should show category management section when clicking manage button', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Click category management button
      const manageButton = screen.getByText('カテゴリーを管理する');
      fireEvent.click(manageButton);

      // Verify category management section appears
      expect(screen.getByText('新しいカテゴリーを追加')).toBeInTheDocument();
      expect(screen.getByText('既存のカテゴリー')).toBeInTheDocument();
    });

    test('should add new category', async () => {
      // Mock successful post response
      mockedAxios.post.mockResolvedValueOnce({});
      // Mock category fetch after adding
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/api/todo-categories')) {
          return Promise.resolve({
            data: [
              { id: 1, name: 'Work' },
              { id: 2, name: 'Personal' },
              { id: 3, name: 'New Category' }
            ]
          });
        }
        return Promise.resolve({ data: [] });
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Open category management
      const manageButton = screen.getByText('カテゴリーを管理する');
      fireEvent.click(manageButton);

      // Add new category
      const categoryInput = screen.getByRole('textbox', { name: /新しいカテゴリー名/i });
      const addCategoryButton = screen.getAllByRole('button', { name: '追加' })[1]; // Second '追加' button for categories

      fireEvent.change(categoryInput, { target: { value: 'New Category' } });
      fireEvent.click(addCategoryButton);

      // Verify API call was made
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/todo-categories',
          { name: 'New Category' },
          { headers: { Authorization: 'Bearer fake-jwt-token' } }
        );
      });
    });
  });

  describe('Empty State', () => {
    test('should display empty state when no todos exist', async () => {
      // Mock empty todos response
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/api/todos')) {
          return Promise.resolve({ data: [] });
        }
        if (url.includes('/api/todo-categories')) {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: [] });
      });

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('まだToDoがありません')).toBeInTheDocument();
      });

      expect(screen.getByText('上のフォームから最初の目標を追加してみましょう！')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('should show loading spinner while fetching data', () => {
      // Mock delayed response
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Should show loading spinner
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('should require title field to be filled', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ToDoリスト')).toBeInTheDocument();
      });

      // Try to submit form with empty title
      const titleInput = screen.getByRole('textbox', { name: /タイトル/i });
      const addButton = screen.getByRole('button', { name: '追加' });

      // Focus and blur to trigger validation
      fireEvent.focus(titleInput);
      fireEvent.blur(titleInput);
      fireEvent.click(addButton);

      // Verify no API call was made
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    test('should close edit dialog when clicking cancel', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Open edit dialog
      const editButtons = screen.getAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('ToDoを編集')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);

      // Verify dialog is closed
      await waitFor(() => {
        expect(screen.queryByText('ToDoを編集')).not.toBeInTheDocument();
      });
    });

    test('should display completed todos with strikethrough styling', async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
      });

      // Check if completed todo has strikethrough style
      const completedTodo = screen.getByText('Completed Todo').closest('div');
      expect(completedTodo).toHaveStyle('text-decoration: line-through');
    });
  });
});