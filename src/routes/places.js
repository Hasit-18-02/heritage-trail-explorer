  const express = require('express');
  const { z } = require('zod');
  const Place = require('../models/Place');
  const { optionalAuth, allowRoles } = require('../middleware/auth');
  const router = express.Router();
  const placeSchema = z.object({ name: z.string().trim().min(2).max(160), slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), city: z.string().trim().min(2).max(100), address: z.string().max(300).optional(), summary: z.string().trim().min(10).max(1200), history: z.string().max(12000).optional(), category: z.string().max(80).optional(), visitingHours: z.string().max(300).optional(), visitDurationMinutes: z.number().int().min(5).max(1440).optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() });
  router.get('/', async (req, res, next) => { try {
    const filter = { status: 'approved' }; if (req.query.city) filter.city = new RegExp(String(req.query.city).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 100) };
    const places = await Place.find(filter).select('-createdBy -__v').sort({ name: 1 }).limit(Math.min(Number(req.query.limit) || 30, 100)); res.json({ success: true, places });
  } catch (e) { next(e); } });
  router.get('/:id', async (req, res, next) => { try { const p = await Place.findOne({ $or: [{ slug: req.params.id }, ...( /^[a-f\d]{24}$/i.test(req.params.id) ? [{ _id: req.params.id }] : [])], status: 'approved' }).select('-createdBy -__v'); if (!p) return res.status(404).json({ success: false, error: 'Place not found.' }); res.json({ success: true, place: p }); } catch (e) { next(e); } });
  router.post('/', optionalAuth, allowRoles('curator', 'admin'), async (req, res, next) => { try { const p = placeSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ success: false, error: p.error.issues[0].message }); const place = await Place.create({ ...p.data, createdBy: req.user._id, status: 'pending' }); res.status(201).json({ success: true, place }); } catch (e) { next(e); } });
  router.patch('/:id/review', optionalAuth, allowRoles('admin'), async (req, res, next) => { try { const status = req.body.status; if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, error: 'status must be approved or rejected.' }); const place = await Place.findByIdAndUpdate(req.params.id, { status, approvedBy: req.user._id, approvedAt: status === 'approved' ? new Date() : null }, { new: true, runValidators: true }); if (!place) return res.status(404).json({ success: false, error: 'Place not found.' }); res.json({ success: true, place }); } catch (e) { next(e); } });
  module.exports = router;
