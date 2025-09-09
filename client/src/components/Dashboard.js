// src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Box, CssBaseline, Button, Grid, Paper, CircularProgress, Alert, Link
} from '@mui/material';
import { 
  Checklist, Event, AccountBalanceWallet, Dashboard as DashboardIcon,
  Schedule, Task, Celebration as CelebrationIcon, Assignment as AssignmentIcon, Savings as SavingsIcon
} from '@mui/icons-material';
import TodoList from './TodoList';
import EventCalendar from './Calendar'; 
import Transactions from './Transactions';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // Dashboard用のCSSをインポート

// --- Empty Stateコンポーネント ---
const EmptyState = ({ icon, title, message }) => (
  <Box sx={{ textAlign: 'center', p: 2, color: 'grey.600' }}>
    {icon}
    <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>{title}</Typography>
    <Typography variant="body2">{message}</Typography>
  </Box>
);

// --- ダッシュボードサマリーコンポーネント ---
const DashboardSummary = ({ setSelectedComponent }) => {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        
        const [summaryRes, eventsRes, todosRes] = await Promise.all([
          axios.get('/api/transactions/summary/current-month', { headers }),
          axios.get('/api/events/today', { headers }),
          axios.get('/api/todos/priority', { headers })
        ]);

        setSummary(summaryRes.data);
        setEvents(eventsRes.data);
        setTodos(todosRes.data);
        setError('');
      } catch (err) {
        console.error("ダッシュボードデータの取得に失敗しました:", err);
        setError('データの取得に失敗しました。ページを再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>ダッシュボード</Typography>
      <Grid container spacing={3}>
        
        {/* 家計簿サマリー */}
        <Grid item xs={12} md={4}>
          <Paper className="summary-card budget-summary">
            <Typography variant="h6" className="summary-card-title">
              <AccountBalanceWallet sx={{ mr: 1 }} /> 今月の家計簿
            </Typography>
            {summary && (summary.income > 0 || summary.expense > 0) ? (
              <Box>
                <Box className="summary-item">
                  <Typography>収入</Typography>
                  <Typography className="income-text">{summary.income.toLocaleString()} 円</Typography>
                </Box>
                <Box className="summary-item">
                  <Typography>支出</Typography>
                  <Typography className="expense-text">{summary.expense.toLocaleString()} 円</Typography>
                </Box>
                <hr />
                <Box className="summary-item">
                  <Typography variant="h6">差引</Typography>
                  <Typography variant="h6" className={summary.balance >= 0 ? 'income-text' : 'expense-text'}>
                    {summary.balance.toLocaleString()} 円
                  </Typography>
                </Box>
              </Box>
            ) : (
              <EmptyState 
                icon={<SavingsIcon sx={{ fontSize: 40 }} />}
                title="取引がありません"
                message="最初の取引を追加しましょう！"
              />
            )}
            <Link component="button" variant="body2" onClick={() => setSelectedComponent('budget')} sx={{ mt: 2 }}>
              家計簿全体を見る
            </Link>
          </Paper>
        </Grid>

        {/* 今日の予定 */}
        <Grid item xs={12} md={4}>
          <Paper className="summary-card event-summary">
            <Typography variant="h6" className="summary-card-title">
              <Schedule sx={{ mr: 1 }} /> 今日の予定
            </Typography>
            {events.length > 0 ? (
              <List dense>
                {events.slice(0, 3).map(event => (
                  <ListItem key={event.id}>
                    <ListItemText 
                      primary={event.title}
                      secondary={`${new Date(event.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState 
                icon={<CelebrationIcon sx={{ fontSize: 40 }} />}
                title="今日の予定はありません"
                message="ゆっくりリラックスしましょう！"
              />
            )}
            <Link component="button" variant="body2" onClick={() => setSelectedComponent('calendar')} sx={{ mt: 2 }}>
              カレンダー全体を見る
            </Link>
          </Paper>
        </Grid>

        {/* 優先ToDo */}
        <Grid item xs={12} md={4}>
          <Paper className="summary-card todo-summary">
            <Typography variant="h6" className="summary-card-title">
              <Task sx={{ mr: 1 }} /> 優先ToDo
            </Typography>
            {todos.length > 0 ? (
              <List dense>
                {todos.map(todo => (
                  <ListItem key={todo.id}>
                    <ListItemText 
                      primary={todo.title}
                      secondary={todo.due_date ? `期限: ${new Date(todo.due_date).toLocaleDateString()}` : '期限なし'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState 
                icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
                title="優先ToDoはありません"
                message="新しい目標を追加しましょう！"
              />
            )}
            <Link component="button" variant="body2" onClick={() => setSelectedComponent('todo')} sx={{ mt: 2 }}>
              ToDoリスト全体を見る
            </Link>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};


// --- メインのダッシュボードコンポーネント ---
const Dashboard = () => { 
  const { logout } = useAuth();
  const [selectedComponent, setSelectedComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'dashboard':
        return <DashboardSummary setSelectedComponent={setSelectedComponent} />;
      case 'todo':
        return <TodoList />;
      case 'calendar':
        return <EventCalendar />;
      case 'budget':
        return <Transactions />;
      default:
        return <DashboardSummary setSelectedComponent={setSelectedComponent} />;
    }
  };

  const menuItems = [
    { text: 'ダッシュボード', icon: <DashboardIcon />, component: 'dashboard' },
    { text: 'ToDoリスト', icon: <Checklist />, component: 'todo' },
    { text: '日程管理', icon: <Event />, component: 'calendar' },
    { text: '家計簿', icon: <AccountBalanceWallet />, component: 'budget' },
  ];

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
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
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        {renderComponent()}
      </Box>
    </Box>
  );
};

export default Dashboard;