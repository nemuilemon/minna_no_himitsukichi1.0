// src/components/Login.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください。');
      return;
    }

    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ログインに失敗しました。');
      }
      
      login(data.token);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    try {
      const response = await fetch(`/api/guest-login`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ゲストログインに失敗しました。');
      }
      
      login(data.token);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>皆の秘密基地へようこそ！</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">ログイン</button>
        <button type="button" onClick={handleGuestLogin} className="guest-login-btn">ゲストとしてログイン</button>
      </form>
    </div>
  );
};

export default Login;