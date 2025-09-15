const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: true,
      message: 'アクセス権限がありません。'
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: true,
      message: '重複するデータが存在します。'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: true,
      message: '参照されているデータが存在しません。'
    });
  }

  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'サーバーエラーが発生しました。'
  });
};

module.exports = errorHandler;