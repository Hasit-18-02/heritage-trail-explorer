const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const Session = require('../models/Session');
const { makeToken, hashToken } = require('../config/security');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const router = express.Router();
const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(200), password: z.string().min(10).max(128) });
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) });
function publicUser(user) { return { id: user._id, name: user.name, email: user.email, role: user.role }; }
async function createSession(user, res) {
  const token = makeToken();
  await Session.create({ tokenHash: hashToken(token), user: user._id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `heritage_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`);
}
router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    const { name, email, password } = parsed.data;
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'visitor' });
    await createSession(user, res); res.status(201).json({ success: true, user: publicUser(user) });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: 'Enter a valid email and password.' });
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select('+passwordHash');
    if (!user || user.status !== 'active' || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
    await createSession(user, res); res.json({ success: true, user: publicUser(user) });
  } catch (e) { next(e); }
});
router.post('/logout', optionalAuth, async (req, res, next) => {
  try { if (req.session) await req.session.deleteOne(); res.setHeader('Set-Cookie', 'heritage_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); res.json({ success: true, message: 'Logged out.' }); } catch (e) { next(e); }
});
router.get('/me', optionalAuth, (req, res) => res.json({ success: true, user: req.user ? publicUser(req.user) : null }));
router.post('/change-password', optionalAuth, requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 10 || newPassword.length > 128) return res.status(400).json({ success: false, error: 'Provide your current password and a new password of 10–128 characters.' });
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    user.passwordHash = await bcrypt.hash(newPassword, 12); await user.save();
    await Session.deleteMany({ user: user._id }); res.setHeader('Set-Cookie', 'heritage_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (e) { next(e); }
});
module.exports = router;
