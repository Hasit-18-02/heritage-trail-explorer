function planTrail(places, maxMinutes = 240) {
  const chosen = []; let total = 0;
  for (const place of places) {
    const duration = Number(place.visitDurationMinutes || 45);
    if (total + duration <= maxMinutes) { chosen.push(place); total += duration; }
  }
  return { places: chosen, estimatedMinutes: total, omittedCount: places.length - chosen.length };
}
module.exports = { planTrail };
