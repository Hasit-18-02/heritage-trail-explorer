const crypto = require('crypto');
const secret = () => process.env.SESSION_SECRET;
function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}
function safeEqual(a, b) {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function makeToken() { return crypto.randomBytes(32).toString('hex'); }
function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
module.exports = { sign, safeEqual, makeToken, hashToken };
