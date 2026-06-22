const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    code,
  });
};

module.exports = errorHandler;
