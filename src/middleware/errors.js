function notFound(req, res) { res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` }); }
function errorHandler(err, req, res, _next) {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, error: err.message });
  if (err.code === 11000) return res.status(409).json({ success: false, error: 'A record with that value already exists.' });
  const status = Number(err.status || 500);
  res.status(status).json({ success: false, error: status >= 500 ? 'Internal server error' : err.message });
}
module.exports = { notFound, errorHandler };
