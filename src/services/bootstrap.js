const bcrypt = require('bcryptjs');
const User = require('../models/User');
async function ensureBootstrapAdmin() {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
  if (!email || !password) { console.log('Bootstrap admin skipped (set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to enable).'); return; }
  const existing = await User.findOne({ email });
  if (existing) return;
  if (password.length < 12) { console.warn('Bootstrap admin password must be at least 12 characters; skipping admin creation.'); return; }
  await User.create({ name: 'Heritage Administrator', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' });
  console.log(`Created bootstrap admin account: ${email}`);
}
module.exports = { ensureBootstrapAdmin };
