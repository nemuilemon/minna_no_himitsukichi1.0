// src/components/Login.js

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ mb: 3, fontWeight: 500 }}
          >
            皆の秘密基地
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            ログイン
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="ユーザー名"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />

              <TextField
                fullWidth
                label="パスワード"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{ py: 1.5 }}
              >
                ログイン
              </Button>

              <Divider sx={{ my: 2 }}>または</Divider>

              <Button
                type="button"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={handleGuestLogin}
                sx={{ py: 1.5 }}
              >
                ゲストとしてログイン
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;