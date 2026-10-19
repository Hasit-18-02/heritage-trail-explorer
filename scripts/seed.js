const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Place = require('../src/models/Place');
const Story = require('../src/models/Story');
async function run() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing in .env');
  await mongoose.connect(process.env.MONGODB_URI);
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) admin = await User.create({ name: 'Heritage Administrator', email, passwordHash: await bcrypt.hash(process.env.BOOTSTRAP_ADMIN_PASSWORD || 'ChangeThisAdminPassword123!', 12), role: 'admin' });
  const sample = [
    { name: 'Charminar', slug: 'charminar', city: 'Hyderabad', address: 'Charminar Road, Hyderabad, Telangana', summary: 'A landmark monument in the historic heart of Hyderabad, known for its four grand arches and surrounding old-city markets.', history: 'Charminar is one of Hyderabad’s best-known historic landmarks. Confirm current access rules and opening hours with official local sources before visiting.', category: 'monument', visitingHours: 'Check official local information before visiting', visitDurationMinutes: 60 },
    { name: 'Golconda Fort', slug: 'golconda-fort', city: 'Hyderabad', address: 'Khair Complex, Hyderabad, Telangana', summary: 'A historic fortified complex associated with the Qutb Shahi period and renowned for its hilltop views and fortifications.', history: 'Golconda Fort was an important fortified centre in the Deccan. Verify detailed dates and visitor arrangements from trusted sources.', category: 'fort', visitingHours: 'Check official local information before visiting', visitDurationMinutes: 120 },
    { name: 'Qutb Shahi Tombs', slug: 'qutb-shahi-tombs', city: 'Hyderabad', address: 'Ibrahim Bagh, Hyderabad, Telangana', summary: 'A historic necropolis with domed tombs and architectural features associated with the Qutb Shahi dynasty.', history: 'The tomb complex preserves an important part of the region’s architectural heritage. Check current conservation and visitor guidance before travel.', category: 'heritage', visitingHours: 'Check official local information before visiting', visitDurationMinutes: 75 }
  ];
  for (const item of sample) {
    let place = await Place.findOne({ slug: item.slug });
    if (!place) place = await Place.create({ ...item, createdBy: admin._id, status: 'approved', approvedBy: admin._id, approvedAt: new Date() });
    const title = `${item.name}: visitor and heritage overview`;
    if (!(await Story.exists({ title }))) await Story.create({ title, body: item.history, sourceTitle: 'Seed overview — verify with official sources before relying on historical specifics', sourceUrl: '', place: place._id, visibility: 'public', status: 'approved', createdBy: admin._id, reviewedBy: admin._id, reviewedAt: new Date() });
  }
  console.log('Seed complete. Admin email:', email);
  console.log('Sample records are marked as seed overviews; verify historical details and add authoritative source links before production.');
  await mongoose.disconnect();
}
run().catch(async e => { console.error(e.message); await mongoose.disconnect().catch(() => {}); process.exit(1); });
