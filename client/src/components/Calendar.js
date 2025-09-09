// src/components/Calendar.js
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// MUI X Date Pickers と dayjs のインポート
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// MUI Core コンポーネントのインポート
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, 
  Typography, Snackbar, Alert, CircularProgress
} from '@mui/material';

// カレンダーの日本語化設定
dayjs.locale('ja');
const localizer = dayjsLocalizer(dayjs);

const messages = {
  allDay: '終日', previous: '前', next: '次', today: '今日', month: '月',
  week: '週', day: '日', agenda: '日程一覧', date: '日付', time: '時間',
  event: 'イベント', showMore: total => `他 ${total} 件`,
};

const EventCalendar = () => {
  // --- ステート定義 ---
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  
  // UI制御用ステート
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
  const onView = useCallback((newView) => setView(newView), [setView]);

  // --- データ取得 ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map(event => ({
          ...event,
          start: new Date(event.start_at),
          end: new Date(event.end_at),
        }));
        setEvents(formattedEvents);
      } else {
        console.error('予定の取得に失敗しました。');
        setNotification({ open: true, message: '予定の取得に失敗しました。', severity: 'error' });
      }
    } catch (error) {
      console.error('予定の取得中にエラーが発生しました:', error);
      setNotification({ open: true, message: '予定の取得中にエラーが発生しました。', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- イベントハンドラ ---
  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedEvent(null);
    setStartDate(dayjs(slotInfo.start));
    setEndDate(dayjs(slotInfo.end));
    setOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setStartDate(dayjs(event.start));
    setEndDate(dayjs(event.end));
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setStartDate(null);
    setEndDate(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title');
    const description = formData.get('description');

    if (!startDate || !endDate || endDate.isBefore(startDate)) {
      setNotification({ open: true, message: '終了日時は開始日時より後に設定してください。', severity: 'warning' });
      return;
    }

    const token = localStorage.getItem('token');
    const isNew = !selectedEvent;
    const endpoint = isNew ? '/api/events' : `/api/events/${selectedEvent.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const body = JSON.stringify({
      title,
      description,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
    });

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body,
      });

      if (response.ok) {
        setNotification({ open: true, message: '予定を保存しました。', severity: 'success' });
        fetchEvents();
        handleClose();
      } else {
        const errorData = await response.json();
        setNotification({ open: true, message: `保存に失敗しました: ${errorData.error || '不明なエラー'}`, severity: 'error' });
      }
    } catch (error) {
      console.error('保存処理中にエラー:', error);
      setNotification({ open: true, message: 'エラーが発生しました。', severity: 'error' });
    }
  };
  
  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (window.confirm(`「${selectedEvent.title}」を本当に削除しますか？`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/events/${selectedEvent.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setNotification({ open: true, message: '予定を削除しました。', severity: 'success' });
          fetchEvents();
          handleClose();
        } else {
          setNotification({ open: true, message: '削除に失敗しました。', severity: 'error' });
        }
      } catch (error) {
        console.error('削除処理中にエラー:', error);
        setNotification({ open: true, message: 'エラーが発生しました。', severity: 'error' });
      }
    }
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // --- レンダリング ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      <Box sx={{ height: '85vh', position: 'relative' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          date={date}
          view={view}
          onNavigate={onNavigate}
          onView={onView}
        />

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <Box component="form" onSubmit={handleSave}>
            <DialogTitle>{selectedEvent ? '予定の編集' : '新しい予定'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="タイトル"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue={selectedEvent?.title || ''}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
                <DateTimePicker
                  label="開始日時"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DateTimePicker
                  label="終了日時"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Box>
              <TextField
                margin="dense"
                name="description"
                label="詳細（メモ）"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                defaultValue={selectedEvent?.description || ''}
              />
            </DialogContent>
            <DialogActions>
              {selectedEvent && (
                <Button onClick={handleDelete} color="error">削除</Button>
              )}
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleClose}>キャンセル</Button>
              <Button type="submit">保存</Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleNotificationClose}>
          <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default EventCalendar;
