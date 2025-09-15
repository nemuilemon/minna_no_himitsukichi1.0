import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import theme from './theme';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoggedIn ? <Dashboard /> : <Login />}
    </ThemeProvider>
  );
}

export default App;