import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar
} from '@mui/material';
import {
  Checklist, Event, AccountBalanceWallet, Dashboard as DashboardIcon
} from '@mui/icons-material';

const Sidebar = ({ selectedComponent, setSelectedComponent, drawerWidth = 240 }) => {
  const menuItems = [
    { text: 'ダッシュボード', icon: <DashboardIcon />, component: 'dashboard' },
    { text: 'ToDoリスト', icon: <Checklist />, component: 'todo' },
    { text: '日程管理', icon: <Event />, component: 'calendar' },
    { text: '家計簿', icon: <AccountBalanceWallet />, component: 'budget' },
  ];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={selectedComponent === item.component}
              onClick={() => setSelectedComponent(item.component)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;