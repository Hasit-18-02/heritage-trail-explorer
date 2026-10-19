
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const Place = require("../src/models/Place");
const User = require("../src/models/User");

const wonders = [
  {
    name: "Great Wall of China",
    slug: "great-wall-of-china",
    city: "Beijing",
    address: "Northern China",
    category: "Ancient fortification",
    summary: "The Great Wall of China is an extensive network of defensive walls and fortifications built and rebuilt across different Chinese dynasties.",
    history: "The wall system developed over many centuries, with major surviving sections associated with the Ming dynasty. It served defensive and border-control purposes.",
    visitingHours: "Hours vary by section; check the official site before visiting.",
    visitDurationMinutes: 180,
    latitude: 40.4319,
    longitude: 116.5704
  },
  {
    name: "Petra",
    slug: "petra-jordan",
    city: "Wadi Musa",
    address: "Petra Archaeological Park, Jordan",
    category: "Archaeological city",
    summary: "Petra is an ancient Nabataean city famous for monumental architecture carved into rose-colored sandstone cliffs.",
    history: "Petra flourished as a Nabataean trading center and is renowned for its rock-cut tombs, temples, and sophisticated water-management systems.",
    visitingHours: "Hours vary by season; check the official visitor information.",
    visitDurationMinutes: 240,
    latitude: 30.3285,
    longitude: 35.4444
  },
  {
    name: "Christ the Redeemer",
    slug: "christ-the-redeemer",
    city: "Rio de Janeiro",
    address: "Mount Corcovado, Rio de Janeiro, Brazil",
    category: "Monument",
    summary: "Christ the Redeemer is a monumental statue overlooking Rio de Janeiro from the summit of Mount Corcovado.",
    history: "The reinforced-concrete and soapstone statue was inaugurated in 1931 and has become one of Brazil's most recognizable landmarks.",
    visitingHours: "Check official visitor and transport schedules.",
    visitDurationMinutes: 120,
    latitude: -22.9519,
    longitude: -43.2105
  },
  {
    name: "Machu Picchu",
    slug: "machu-picchu",
    city: "Machu Picchu",
    address: "Cusco Region, Peru",
    category: "Inca archaeological site",
    summary: "Machu Picchu is an Inca archaeological site in the Andes, celebrated for its carefully fitted stone structures and mountain scenery.",
    history: "Built during the fifteenth century, Machu Picchu contains agricultural terraces, ceremonial spaces, and residential structures associated with the Inca civilization.",
    visitingHours: "Entry requires compliance with official ticket and circuit schedules.",
    visitDurationMinutes: 240,
    latitude: -13.1631,
    longitude: -72.5450
  },
  {
    name: "Chichen Itza",
    slug: "chichen-itza",
    city: "Tinum",
    address: "Yucatan, Mexico",
    category: "Maya archaeological city",
    summary: "Chichen Itza is a major Maya archaeological site featuring monumental architecture, including the stepped pyramid known as El Castillo.",
    history: "Chichen Itza was an important political, religious, and economic center in the northern Maya lowlands. Its buildings reflect multiple architectural influences.",
    visitingHours: "Check official site hours and ticket information.",
    visitDurationMinutes: 180,
    latitude: 20.6843,
    longitude: -88.5678
  },
  {
    name: "Colosseum",
    slug: "colosseum-rome",
    city: "Rome",
    address: "Piazza del Colosseo, Rome, Italy",
    category: "Roman amphitheater",
    summary: "The Colosseum is an enormous ancient Roman amphitheater built for public spectacles and events.",
    history: "Construction began under Emperor Vespasian and the amphitheater opened under Titus in the first century CE. It remains a major monument of ancient Roman engineering.",
    visitingHours: "Opening times vary by season; check the official ticketing site.",
    visitDurationMinutes: 120,
    latitude: 41.8902,
    longitude: 12.4922
  },
  {
    name: "Taj Mahal",
    slug: "taj-mahal",
    city: "Agra",
    address: "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh, India",
    category: "Mughal monument",
    summary: "The Taj Mahal is a white-marble mausoleum in Agra commissioned by Mughal emperor Shah Jahan in memory of Mumtaz Mahal.",
    history: "Construction began in 1632 and the complex developed over subsequent years. It is renowned for its Mughal architecture, marble inlay, gardens, and symmetry.",
    visitingHours: "Generally closed on Fridays for regular sightseeing; verify current official timings.",
    visitDurationMinutes: 180,
    latitude: 27.1751,
    longitude: 78.0421
  }
];

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from your .env file.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  // Find an existing admin account to satisfy the required createdBy field.
  const admin = await User.findOne({ role: "admin" });

  if (!admin) {
    throw new Error(
      "No admin user found. Create or identify an admin account before seeding."
    );
  }

  let inserted = 0;
  let updated = 0;

  for (const wonder of wonders) {
    const existing = await Place.findOne({ slug: wonder.slug });

    await Place.updateOne(
      { slug: wonder.slug },
      {
        $set: {
          ...wonder,
          status: "approved",
          createdBy: existing?.createdBy || admin._id,
          approvedBy: admin._id,
          approvedAt: existing?.approvedAt || new Date()
        }
      },
      { upsert: true, runValidators: true }
    );

    if (existing) {
      updated++;
    } else {
      inserted++;
    }

    console.log(`Seeded: ${wonder.name}`);
  }

  console.log(`\nFinished! Inserted: ${inserted}, updated: ${updated}`);
  await mongoose.disconnect();
}

main().catch(async (error) => { 
  console.error("Seeding failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
