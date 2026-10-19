const Session = require('../models/Session');
const { hashToken } = require('../config/security');
function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const item of raw.split(';')) { const [k, ...v] = item.trim().split('='); if (k === name) return decodeURIComponent(v.join('=')); }
  return null;
}
async function optionalAuth(req, _res, next) {
  try {
    const token = readCookie(req, 'heritage_session') || (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || null;
    if (!token) return next();
    const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).populate('user');
    if (session && session.user && session.user.status === 'active') { req.user = session.user; req.session = session; }
    next();
  } catch (e) { next(e); }
}
function requireAuth(req, res, next) { if (!req.user) return res.status(401).json({ success: false, error: 'Please log in.' }); next(); }
function allowRoles(...roles) { return (req, res, next) => { if (!req.user) return res.status(401).json({ success: false, error: 'Please log in.' }); if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, error: 'You do not have permission to do that.' }); next(); }; }
module.exports = { optionalAuth, requireAuth, allowRoles, readCookie };
