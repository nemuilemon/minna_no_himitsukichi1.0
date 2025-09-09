// src/api/axios.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

// リクエストインターセプター：すべてのリクエストにトークンを付与
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター：認証エラー時に自動ログアウト
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 認証エラーの場合
      console.log('認証エラーを検知しました。');
      
      // ★★★ 変更点 ★★★
      // localStorageからトークンを削除
      localStorage.removeItem('token'); 
      // 'auth-error' という名前のイベントを発行してApp.jsに通知
      window.dispatchEvent(new Event('auth-error')); 
      // ★★★ ここまで ★★★
    }
    return Promise.reject(error);
  }
);

export default apiClient;