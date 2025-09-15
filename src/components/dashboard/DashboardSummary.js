import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Link, List, ListItem, ListItemText, Divider
} from '@mui/material';
import {
  AccountBalanceWallet, Schedule, Task,
  Celebration as CelebrationIcon, Assignment as AssignmentIcon, Savings as SavingsIcon
} from '@mui/icons-material';

const EmptyState = ({ icon, title, message }) => (
  <Box sx={{ textAlign: 'center', p: 2, color: 'grey.600' }}>
    {icon}
    <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>{title}</Typography>
    <Typography variant="body2">{message}</Typography>
  </Box>
);

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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>ダッシュボード</Typography>
      <Grid container spacing={3}>

        {/* 家計簿サマリー */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                今月の家計簿
              </Typography>
              {summary && (summary.income > 0 || summary.expense > 0) ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">収入</Typography>
                    <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {summary.income.toLocaleString()} 円
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary">支出</Typography>
                    <Typography sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      {summary.expense.toLocaleString()} 円
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h6">差引</Typography>
                    <Typography variant="h6" sx={{ color: summary.balance >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
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
              <Link component="button" variant="body2" onClick={() => setSelectedComponent('budget')} sx={{ mt: 2, display: 'block' }}>
                家計簿全体を見る
              </Link>
            </CardContent>
          </Card>
        </Grid>

        {/* 今日の予定 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                今日の予定
              </Typography>
              {events.length > 0 ? (
                <List dense sx={{ py: 0 }}>
                  {events.slice(0, 3).map(event => (
                    <ListItem key={event.id} sx={{ px: 0 }}>
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
              <Link component="button" variant="body2" onClick={() => setSelectedComponent('calendar')} sx={{ mt: 2, display: 'block' }}>
                カレンダー全体を見る
              </Link>
            </CardContent>
          </Card>
        </Grid>

        {/* 優先ToDo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Task sx={{ mr: 1, color: 'primary.main' }} />
                優先ToDo
              </Typography>
              {todos.length > 0 ? (
                <List dense sx={{ py: 0 }}>
                  {todos.map(todo => (
                    <ListItem key={todo.id} sx={{ px: 0 }}>
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
              <Link component="button" variant="body2" onClick={() => setSelectedComponent('todo')} sx={{ mt: 2, display: 'block' }}>
                ToDoリスト全体を見る
              </Link>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardSummary;