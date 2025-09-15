import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const UserProfile = ({ drawerWidth = 240 }) => {
  const { logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          皆の秘密基地
        </Typography>
        <Button color="inherit" onClick={logout}>
          ログアウト
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default UserProfile;