import React from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="App">
      {isLoggedIn ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;