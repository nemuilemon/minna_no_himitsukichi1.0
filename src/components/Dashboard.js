// src/components/Dashboard.js

import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, Container, Grid } from '@mui/material';
import Sidebar from './dashboard/Sidebar';
import UserProfile from './dashboard/UserProfile';
import DashboardSummary from './dashboard/DashboardSummary';
import TodoWidget from './dashboard/TodoWidget';
import CalendarWidget from './dashboard/CalendarWidget';
import TransactionsWidget from './dashboard/TransactionsWidget';

const Dashboard = () => {
  const [selectedComponent, setSelectedComponent] = useState('dashboard');
  const drawerWidth = 240;

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'dashboard':
        return <DashboardSummary setSelectedComponent={setSelectedComponent} />;
      case 'todo':
        return <TodoWidget />;
      case 'calendar':
        return <CalendarWidget />;
      case 'budget':
        return <TransactionsWidget />;
      default:
        return <DashboardSummary setSelectedComponent={setSelectedComponent} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <UserProfile drawerWidth={drawerWidth} />
      <Sidebar
        selectedComponent={selectedComponent}
        setSelectedComponent={setSelectedComponent}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          overflow: 'auto'
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderComponent()}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;