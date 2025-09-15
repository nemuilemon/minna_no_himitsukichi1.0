// src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Box, CssBaseline, Button, Grid, Paper, CircularProgress, Alert, Link, Tooltip,
  LinearProgress, Chip, IconButton
} from '@mui/material';
import {
  Checklist, Event, AccountBalanceWallet, Dashboard as DashboardIcon,
  Task, Celebration as CelebrationIcon, Assignment as AssignmentIcon, Savings as SavingsIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, CalendarToday as CalendarTodayIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import TodoList from './TodoList';
import EventCalendar from './Calendar';
import Transactions from './Transactions';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
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
  const { showError } = useNotification();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, eventsRes, todosRes] = await Promise.all([
          axios.get('/api/transactions/summary/current-month', { headers }),
          axios.get('/api/events/upcoming?days=7', { headers }),
          axios.get('/api/todos/priority', { headers })
        ]);

        setSummary(summaryRes.data);
        setEvents(eventsRes.data);
        setTodos(todosRes.data);
        setError('');
      } catch (err) {
        console.error("ダッシュボードデータの取得に失敗しました:", err);
        setError('データの取得に失敗しました。ページを再読み込みしてください。');
        showError('ダッシュボードデータの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, showError]);

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
        

                {/* 優先ToDo */}
        <Grid item xs={12} md={4}>
          <Paper className="summary-card todo-summary">
            <Typography variant="h6" className="summary-card-title">
              <Task sx={{ mr: 1 }} /> ToDo
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


        {/* 今後の予定 (7日間) */}
        <Grid item xs={12} md={4}>
          <Paper className="summary-card event-summary">
            <Typography variant="h6" className="summary-card-title">
              <CalendarTodayIcon sx={{ mr: 1 }} /> 今後の予定 (7日間)
            </Typography>
            {events.length > 0 ? (
              <List dense>
                {events.slice(0, 4).map(event => {
                  const eventDate = new Date(event.start_at);
                  const isToday = eventDate.toDateString() === new Date().toDateString();
                  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                  let dateLabel = eventDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
                  if (isToday) dateLabel = '今日';
                  else if (isTomorrow) dateLabel = '明日';

                  return (
                    <ListItem key={event.id} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {event.title}
                            </Typography>
                            <Chip
                              label={dateLabel}
                              size="small"
                              color={isToday ? 'primary' : isTomorrow ? 'secondary' : 'default'}
                              variant={isToday ? 'filled' : 'outlined'}
                            />
                          </Box>
                        }
                        secondary={`${eventDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <EmptyState
                icon={<CelebrationIcon sx={{ fontSize: 40 }} />}
                title="今後の予定はありません"
                message="新しい予定を追加しましょう！"
              />
            )}
            <Link component="button" variant="body2" onClick={() => setSelectedComponent('calendar')} sx={{ mt: 2 }}>
              カレンダー全体を見る
            </Link>
          </Paper>
        </Grid>
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

                {/* 支出率の視覚化 */}
                {summary.income > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        支出率
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((summary.expense / summary.income) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((summary.expense / summary.income) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: summary.expense > summary.income * 0.8
                            ? '#f44336' // Red if over 80%
                            : summary.expense > summary.income * 0.6
                            ? '#ff9800' // Orange if over 60%
                            : '#4caf50' // Green if under 60%
                        }
                      }}
                    />
                  </Box>
                )}

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

        
      </Grid>
    </Box>
  );
};


// --- メインのダッシュボードコンポーネント ---
const Dashboard = () => {
  const { logout } = useAuth();
  const [selectedComponent, setSelectedComponent] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth > 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setDrawerOpen(false);
        setMobileOpen(false);
      } else {
        setDrawerOpen(true);
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const drawerWidth = drawerOpen ? 240 : 70;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            皆の秘密基地
          </Typography>
          <Button color="inherit" onClick={logout}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        anchor="left"
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <Tooltip title={drawerOpen ? '' : item.text} placement="right" key={item.text}>
              <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedComponent === item.component}
                    onClick={() => setSelectedComponent(item.component)}
                    sx={{ justifyContent: drawerOpen ? 'initial' : 'center', px: 2.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen ? 3 : 'auto', justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: drawerOpen ? 1 : 0 }} />
                  </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItem disablePadding>
            <Tooltip title={drawerOpen ? "折りたたむ" : "展開する"} placement="right">
              <ListItemButton onClick={handleDrawerToggle} sx={{ justifyContent: 'center', py: 2 }}>
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                  {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
        anchor="left"
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={selectedComponent === item.component}
                onClick={() => {
                  setSelectedComponent(item.component);
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: { xs: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        {renderComponent()}
      </Box>
    </Box>
  );
};

export default Dashboard;