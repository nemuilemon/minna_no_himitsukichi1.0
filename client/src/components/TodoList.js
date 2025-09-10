// src/components/TodoList.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Box, Paper, Typography, Grid, TextField, Button, Select, MenuItem, 
  List, ListItem, ListItemText, IconButton, Dialog, DialogActions, 
  DialogContent, DialogTitle, Snackbar, Alert, FormControl, InputLabel, Checkbox,
  CircularProgress, Icon
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, PlaylistAddCheck as PlaylistAddCheckIcon } from '@mui/icons-material';

const TodoList = () => {
  // --- ステート定義 ---
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // 編集用
  const [editingTodo, setEditingTodo] = useState(null);

  // カテゴリー管理用
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);

  // UI制御用
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const token = localStorage.getItem('token');

  // --- データ取得 ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [todosRes, categoriesRes] = await Promise.all([
        axios.get('/api/todos', { headers }),
        axios.get('/api/todo-categories', { headers })
      ]);
      setTodos(todosRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setNotification({ open: true, message: 'データの取得に失敗しました。', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ToDo操作ハンドラ ---
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setNotification({ open: true, message: 'タイトルを入力してください。', severity: 'warning' });
      return;
    }
    try {
      const newTodoData = { title, todo_category_id: categoryId || null };
      const response = await axios.post('/api/todos', newTodoData, { headers: { Authorization: `Bearer ${token}` } });
      setTodos([response.data, ...todos]);
      setTitle('');
      setCategoryId('');
      setNotification({ open: true, message: 'ToDoを追加しました。', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'ToDoの追加に失敗しました。', severity: 'error' });
    }
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) {
      setNotification({ open: true, message: 'タイトルを入力してください。', severity: 'warning' });
      return;
    }
    try {
      const { id, title, todo_category_id, is_completed } = editingTodo;
      const updatedData = { title, todo_category_id, is_completed };
      const response = await axios.put(`/api/todos/${id}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
      setEditingTodo(null);
      setNotification({ open: true, message: 'ToDoを更新しました。', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'ToDoの更新に失敗しました。', severity: 'error' });
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const updatedData = { ...todo, is_completed: !todo.is_completed };
      const response = await axios.put(`/api/todos/${todo.id}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
      setTodos(todos.map(t => (t.id === todo.id ? response.data : t)));
    } catch (err) {
       setNotification({ open: true, message: 'ToDoの状態更新に失敗しました。', severity: 'error' });
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTodos(todos.filter(todo => todo.id !== id));
      setNotification({ open: true, message: 'ToDoを削除しました。', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'ToDoの削除に失敗しました。', severity: 'error' });
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);

    try {
      await axios.put('/api/todos/reorder', { todos: items }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      setNotification({ open: true, message: 'ToDoの並び替えに失敗しました。', severity: 'error' });
      fetchData(); // エラー時はサーバーの状態に同期
    }
  };

  // --- カテゴリー操作ハンドラ ---
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setNotification({ open: true, message: 'カテゴリー名を入力してください。', severity: 'warning' });
      return;
    }
    try {
      await axios.post('/api/todo-categories', { name: newCategoryName }, { headers: { Authorization: `Bearer ${token}` } });
      setNewCategoryName('');
      // カテゴリだけ再取得
      axios.get('/api/todo-categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => setCategories(res.data));
      setNotification({ open: true, message: 'カテゴリーを追加しました。', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'カテゴリーの追加に失敗しました。', severity: 'error' });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) return;
    try {
      await axios.put(`/api/todo-categories/${editCategory.id}`, { name: editCategory.name }, { headers: { Authorization: `Bearer ${token}` } });
      axios.get('/api/todo-categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => setCategories(res.data));
      setEditCategory(null);
      setNotification({ open: true, message: 'カテゴリーを更新しました。', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.error || 'カテゴリーの更新に失敗しました。', severity: 'error' });
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategory) return;
    try {
      await axios.delete(`/api/todo-categories/${deleteCategory.id}`, { headers: { Authorization: `Bearer ${token}` } });
      axios.get('/api/todo-categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => setCategories(res.data));
      setDeleteCategory(null);
      setNotification({ open: true, message: 'カテゴリーを削除しました。', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.error || 'カテゴリーの削除に失敗しました。', severity: 'error' });
    }
  };

  // --- レンダリング ---
  const renderTodoList = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (todos.length === 0) {
      return (
        <Paper elevation={0} sx={{ textAlign: 'center', p: 4, mt: 3, backgroundColor: '#f9f9f9' }}>
          <PlaylistAddCheckIcon sx={{ fontSize: 60, color: 'grey.400' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>まだToDoがありません</Typography>
          <Typography color="textSecondary">上のフォームから最初の目標を追加してみましょう！</Typography>
        </Paper>
      );
    }
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <Paper elevation={3} ref={provided.innerRef} {...provided.droppableProps}>
              <List>
                {todos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={String(todo.id)} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        divider
                        sx={{ bgcolor: todo.is_completed ? '#f5f5f5' : '#fff' }}
                      >
                        <Checkbox checked={todo.is_completed} onChange={() => handleToggleComplete(todo)} />
                        <ListItemText 
                          primary={todo.title}
                          secondary={todo.category_name || ''}
                          sx={{ textDecoration: todo.is_completed ? 'line-through' : 'none' }}
                        />
                        <IconButton onClick={() => setEditingTodo(todo)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDeleteTodo(todo.id)}><DeleteIcon /></IconButton>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </Paper>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>ToDoリスト</Typography>

      {/* ToDo追加フォーム */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>新しい目標を追加</Typography>
        <Box component="form" onSubmit={handleAddTodo}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
                <InputLabel>カテゴリ</InputLabel>
                <Select value={categoryId} label="カテゴリ" onChange={(e) => setCategoryId(e.target.value)}>
                  <MenuItem value=""><em>カテゴリなし</em></MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '56px' }}>追加</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* カテゴリー管理 */}
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => setIsManagingCategories(!isManagingCategories)}>
          {isManagingCategories ? 'カテゴリー管理を閉じる' : 'カテゴリーを管理する'}
        </Button>
        {isManagingCategories && (
          <Paper elevation={2} sx={{ p: 2, mt: 1 }}>
            <Typography variant="h6">新しいカテゴリーを追加</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={9}>
                <TextField label="新しいカテゴリー名" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button onClick={handleAddCategory} variant="contained" fullWidth>追加</Button>
              </Grid>
            </Grid>
            <hr />
            <Typography variant="h6" sx={{ mt: 2 }}>既存のカテゴリー</Typography>
            <List dense>
              {categories.map(cat => (
                <ListItem key={cat.id} secondaryAction={
                  <>
                    <IconButton edge="end" onClick={() => setEditCategory(cat)}><EditIcon /></IconButton>
                    <IconButton edge="end" onClick={() => setDeleteCategory(cat)}><DeleteIcon /></IconButton>
                  </>
                }>
                  <ListItemText primary={cat.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* ToDoリスト本体 */}
      {renderTodoList()}

      {/* ダイアログ */}
      <Dialog open={!!editingTodo} onClose={() => setEditingTodo(null)} fullWidth>
        <DialogTitle>ToDoを編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="タイトル"
            type="text"
            fullWidth
            value={editingTodo?.title || ''}
            onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select 
              value={editingTodo?.todo_category_id || ''} 
              label="カテゴリ" 
              onChange={(e) => setEditingTodo({...editingTodo, todo_category_id: e.target.value})}
            >
              <MenuItem value=""><em>カテゴリなし</em></MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTodo(null)}>キャンセル</Button>
          <Button onClick={handleUpdateTodo}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editCategory} onClose={() => setEditCategory(null)}>
        <DialogTitle>カテゴリーを編集</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="カテゴリー名" type="text" fullWidth value={editCategory?.name || ''} onChange={(e) => setEditCategory({...editCategory, name: e.target.value})} />
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
          <Typography variant="caption">このカテゴリーを使用しているToDoがある場合は削除できません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCategory(null)}>キャンセル</Button>
          <Button onClick={confirmDeleteCategory} color="error">削除</Button>
        </DialogActions>
      </Dialog>

      {/* 通知 */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TodoList;