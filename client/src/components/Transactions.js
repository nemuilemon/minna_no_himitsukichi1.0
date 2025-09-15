// src/components/Transactions.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Paper, Typography, Grid, TextField, Button, Select, MenuItem,
  List, ListItem, ListItemText, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel, LinearProgress,
  CircularProgress
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import { 
  Delete as DeleteIcon, Edit as EditIcon, Fastfood, ShoppingCart, Commute, 
  Home, Receipt, AddCard as AddCardIcon 
} from '@mui/icons-material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Transactions.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Transactions = () => {
  // --- ステート変数の定義 ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [budget, setBudget] = useState(0);
  const [chartData, setChartData] = useState({ datasets: [{ data: [] }] });

  // UI制御用のステート
  const [loading, setLoading] = useState(true);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const token = localStorage.getItem('token');

  // --- データ取得 ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        axios.get('/api/transactions', { headers }),
        axios.get('/api/categories', { headers })
      ]);
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      showError('データの取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- サマリー計算 ---
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.transaction_date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === 'income') {
          income += parseFloat(t.amount);
        } else if (t.type === 'expense') {
          expense += parseFloat(t.amount);
        }
      }
    });

    setSummary({ income, expense, balance: income - expense });
  }, [transactions]);

  // --- グラフデータと予算使用率の計算 ---
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expenseByCategory = transactions
      .filter(t => {
        const tDate = new Date(t.transaction_date);
        return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => {
        const categoryName = t.category_name || '未分類';
        acc[categoryName] = (acc[categoryName] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const labels = Object.keys(expenseByCategory);
    const data = Object.values(expenseByCategory);

    setChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
        },
      ],
    });

  }, [transactions]);

  const budgetUsage = budget > 0 ? (summary.expense / budget) * 100 : 0;

  // --- イベントハンドラ ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !amount || !transactionDate || !categoryId) {
      showWarning('必須項目をすべて入力してください。');
      return;
    }
    try {
      const newTransaction = { type, amount: parseFloat(amount), transaction_date: transactionDate, category_id: parseInt(categoryId), description };
      await axios.post('/api/transactions', newTransaction, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // 全データを再取得して同期
      setAmount('');
      setCategoryId('');
      setDescription('');
      showSuccess('取引を追加しました。');
    } catch (err) {
      showError('取引の追加に失敗しました。');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(transactions.filter(t => t.id !== id));
      showSuccess('取引を削除しました。');
    } catch (err) {
      showError('削除に失敗しました。');
      console.error(err);
    }
  };

  // --- カテゴリー管理 ---
  const handleAddCategory = async () => {
    if (!newCategoryName) {
      showWarning('カテゴリー名を入力してください。');
      return;
    }
    try {
      await axios.post('/api/categories', { name: newCategoryName, type: newCategoryType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCategoryName('');
      axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => setCategories(res.data));
      showSuccess('カテゴリーを追加しました。');
    } catch (err) {
      showError('カテゴリーの追加に失敗しました。');
      console.error(err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) {
      showWarning('カテゴリー名を入力してください。');
      return;
    }
    try {
      await axios.put(`/api/categories/${editCategory.id}`, { name: editCategory.name, type: editCategory.type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => setCategories(res.data));
      setEditCategory(null);
      showSuccess('カテゴリーを更新しました。');
    } catch (err) {
      showError(err.response?.data?.error || 'カテゴリーの更新に失敗しました。');
      console.error(err);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategory) return;
    try {
      await axios.delete(`/api/categories/${deleteCategory.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => setCategories(res.data));
      setDeleteCategory(null);
      showSuccess('カテゴリーを削除しました。');
    } catch (err) {
      showError(err.response?.data?.error || 'カテゴリーの削除に失敗しました。');
      console.error(err);
    }
  };

  // --- レンダリング ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box className="transactions-container">
      <Typography variant="h4" gutterBottom>家計簿</Typography>
      
      {/* サマリーとグラフ */}
      <Grid container spacing={3}>
        {/* サマリー */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="summary-card" sx={{ height: '100%' }}>
            <Box p={2}>
              <Typography variant="h5" gutterBottom>今月のサマリー</Typography>
              <Box className="summary-content">
                <Typography><strong>収入:</strong> <span className="income-text">{summary.income.toLocaleString()} 円</span></Typography>
                <Typography><strong>支出:</strong> <span className="expense-text">{summary.expense.toLocaleString()} 円</span></Typography>
                <Typography><strong>差引:</strong> <span className="balance-text">{summary.balance.toLocaleString()} 円</span></Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 円グラフ */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ height: '100%' }}>
            <Box p={2}>
              <Typography variant="h5" gutterBottom>今月の支出カテゴリー</Typography>
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {chartData.datasets[0].data.length > 0 ? (
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Typography>データがありません</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 予算管理 */}
      <Paper elevation={3} sx={{ my: 2, p: 2 }}>
          <Typography variant="h5" gutterBottom>予算管理</Typography>
          <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                  <TextField
                      type="number"
                      label="今月の予算"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      fullWidth
                  />
              </Grid>
              <Grid item xs={12} sm={6}>
                  <Button variant="contained" onClick={() => showInfo('予算が設定されました！')}>予算を設定</Button>
              </Grid>
          </Grid>
          {budget > 0 && (
              <Box sx={{ mt: 2 }}>
                  <Typography>支出: {summary.expense.toLocaleString()}円 / {parseInt(budget).toLocaleString()}円</Typography>
                  <LinearProgress variant="determinate" value={budgetUsage} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
          )}
      </Paper>
      
      {/* 取引追加フォーム */}
      <Paper elevation={3} className="form-card">
        <Box p={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" gutterBottom>新しい取引を追加</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>種別</InputLabel>
                <Select value={type} label="種別" onChange={(e) => { setType(e.target.value); setCategoryId(''); }}>
                  <MenuItem value="expense">支出</MenuItem>
                  <MenuItem value="income">収入</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField type="number" label="金額" value={amount} onChange={(e) => setAmount(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth required>
                <InputLabel>カテゴリ</InputLabel>
                <Select value={categoryId} label="カテゴリ" onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.filter(c => c.type === type).map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="メモ (任意)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: '100%' }}>追加</Button>
        </Box>
      </Paper>

      {/* カテゴリー管理 */}
      <Box className="category-management-container">
        <Button variant="outlined" onClick={() => setIsManagingCategories(!isManagingCategories)}>
          {isManagingCategories ? 'カテゴリー管理を閉じる' : 'カテゴリーを管理する'}
        </Button>
        {isManagingCategories && (
          <Paper elevation={2} sx={{ p: 2, mt: 1 }}>
            <Typography variant="h6">新しいカテゴリーを追加</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={5}>
                <TextField label="新しいカテゴリー名" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>種別</InputLabel>
                  <Select value={newCategoryType} label="種別" onChange={(e) => setNewCategoryType(e.target.value)}>
                    <MenuItem value="expense">支出</MenuItem>
                    <MenuItem value="income">収入</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button onClick={handleAddCategory} variant="contained" fullWidth>追加</Button>
              </Grid>
            </Grid>
            <hr />
            <Typography variant="h6" sx={{ mt: 2 }}>既存のカテゴリー</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">支出</Typography>
                <List dense>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <ListItem key={cat.id} secondaryAction={
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={() => setEditCategory(cat)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => setDeleteCategory(cat)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }>
                      <ListItemText primary={cat.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">収入</Typography>
                <List dense>
                  {categories.filter(c => c.type === 'income').map(cat => (
                    <ListItem key={cat.id} secondaryAction={
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={() => setEditCategory(cat)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => setDeleteCategory(cat)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }>
                      <ListItemText primary={cat.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* 取引履歴 */}
      <Paper elevation={3}>
        <Box p={2}>
          <Typography variant="h5" gutterBottom>取引履歴</Typography>
          {transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4, backgroundColor: '#f9f9f9' }}>
              <AddCardIcon sx={{ fontSize: 60, color: 'grey.400' }} />
              <Typography variant="h6" sx={{ mt: 2 }}>まだ取引がありません</Typography>
              <Typography color="textSecondary">最初の取引を上のフォームから追加してみましょう。</Typography>
            </Box>
          ) : (
            <List>
              {transactions.map(t => {
                const categoryName = t.category_name || '未分類';
                let categoryIcon;
                switch (categoryName) {
                  case '食費': categoryIcon = <Fastfood />;
                    break;
                  case '買い物': categoryIcon = <ShoppingCart />;
                    break;
                  case '交通費': categoryIcon = <Commute />;
                    break;
                  case '住居': categoryIcon = <Home />;
                    break;
                  case '請求書': categoryIcon = <Receipt />;
                    break;
                  default: categoryIcon = <Receipt />;
                }

                return (
                  <ListItem key={t.id} className="transaction-list-item" secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(t.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>{categoryIcon}</Box>
                    <ListItemText 
                      primary={categoryName}
                      secondary={`${new Date(t.transaction_date).toLocaleDateString()} - ${t.description || ''}`}
                      secondaryTypographyProps={{ style: { color: 'gray' } }}
                    />
                    <Typography variant="body1" className={t.type === 'income' ? 'income-text' : 'expense-text'}>
                      {t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toLocaleString()} 円
                    </Typography>
                  </ListItem>
                )
              })}
            </List>
          )}
        </Box>
      </Paper>

      {/* ダイアログ */}
      <Dialog open={!!editCategory} onClose={() => setEditCategory(null)}>
        <DialogTitle>カテゴリーを編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="カテゴリー名"
            type="text"
            fullWidth
            variant="standard"
            value={editCategory?.name || ''}
            onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategory(null)}>キャンセル</Button>
          <Button onClick={handleUpdateCategory}>更新</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteCategory} onClose={() => setDeleteCategory(null)}>
        <DialogTitle>カテゴリーを削除</DialogTitle>
        <DialogContent>
          <Typography>「{deleteCategory?.name}」を本当に削除しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCategory(null)}>キャンセル</Button>
          <Button onClick={confirmDeleteCategory} color="error">削除</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Transactions;