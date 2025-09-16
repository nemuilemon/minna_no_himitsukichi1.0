import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

// Mock the fetch function
global.fetch = jest.fn();

// Mock useAuth hook
const mockLogin = jest.fn();
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    login: mockLogin
  })
}));

// Test wrapper with AuthProvider
const TestWrapper = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLogin.mockClear();
  });

  describe('Success Cases', () => {
    test('should navigate to dashboard after successful login', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'fake-jwt-token' })
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Fill in username and password
      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Click login button
      fireEvent.click(loginButton);

      // Wait for the login function to be called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('fake-jwt-token');
      });

      // Verify API was called with correct data
      expect(fetch).toHaveBeenCalledWith('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      });
    });

    test('should successfully login as guest', async () => {
      // Mock successful guest login response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'guest-jwt-token' })
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const guestLoginButton = screen.getByRole('button', { name: 'ゲストとしてログイン' });

      // Click guest login button
      fireEvent.click(guestLoginButton);

      // Wait for the login function to be called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('guest-jwt-token');
      });

      // Verify API was called
      expect(fetch).toHaveBeenCalledWith('/api/guest-login', {
        method: 'POST',
      });
    });
  });

  describe('Failure Cases', () => {
    test('should display error message for empty username field', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Fill in only password, leave username empty
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Click login button
      fireEvent.click(loginButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('ユーザー名とパスワードを入力してください。')).toBeInTheDocument();
      });

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should display error message for empty password field', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText('ユーザー名');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Fill in only username, leave password empty
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      // Click login button
      fireEvent.click(loginButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('ユーザー名とパスワードを入力してください。')).toBeInTheDocument();
      });

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should display error message for empty username and password fields', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Click login button without filling fields
      fireEvent.click(loginButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('ユーザー名とパスワードを入力してください。')).toBeInTheDocument();
      });

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should display error message for invalid credentials', async () => {
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Fill in username and password
      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      // Click login button
      fireEvent.click(loginButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('should display default error message when API returns no specific error', async () => {
      // Mock failed API response without specific error
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Fill in username and password
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Click login button
      fireEvent.click(loginButton);

      // Check default error message appears
      await waitFor(() => {
        expect(screen.getByText('ログインに失敗しました。')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('should display error message when guest login fails', async () => {
      // Mock failed guest login response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Guest login unavailable' })
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const guestLoginButton = screen.getByRole('button', { name: 'ゲストとしてログイン' });

      // Click guest login button
      fireEvent.click(guestLoginButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('Guest login unavailable')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('should handle network error during login', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Fill in username and password
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Click login button
      fireEvent.click(loginButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('UI Elements', () => {
    test('should render all necessary UI elements', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Check if all form elements are present
      expect(screen.getByText('皆の秘密基地へようこそ！')).toBeInTheDocument();
      expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ゲストとしてログイン' })).toBeInTheDocument();
    });

    test('should clear error message when user starts typing after error', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // Click login button without filling fields to trigger error
      fireEvent.click(loginButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('ユーザー名とパスワードを入力してください。')).toBeInTheDocument();
      });

      // Start typing in username field
      const usernameInput = screen.getByLabelText('ユーザー名');
      fireEvent.change(usernameInput, { target: { value: 'u' } });

      // Error should still be there as both fields are required
      expect(screen.getByText('ユーザー名とパスワードを入力してください。')).toBeInTheDocument();
    });
  });
});