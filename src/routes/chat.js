
const express = require('express');
const { z } = require('zod');
const Place = require('../models/Place');
const Story = require('../models/Story');
const { askOllama } = require('../services/ollama');

const router = express.Router();

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const FALLBACK =
  'I do not have approved heritage information for this request yet. Please try another place or ask a curator to add verified information.';

router.post('/', async (req, res, next) => {
  try {
    const parsed = z.object({
      message: z.string().trim().min(2).max(1200),
      city: z.string().trim().max(100).optional()
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues[0].message
      });
    }

    const { message, city } = parsed.data;

    const placeFilter = { status: 'approved' };
    const storyFilter = {
      status: 'approved',
      visibility: 'public'
    };

    if (city) {
      const cityRegex = new RegExp(escapeRegex(city), 'i');
      placeFilter.city = cityRegex;
      storyFilter.place = { $exists: true };

      // Only include stories connected to places in the requested city.
      const cityPlaces = await Place.find({
        status: 'approved',
        city: cityRegex
      }).select('_id');

      storyFilter.place = {
        $in: cityPlaces.map((place) => place._id)
      };
    }

    const places = await Place.find(placeFilter)
      .select('name city summary history visitingHours address slug')
      .limit(30);

    const stories = await Story.find(storyFilter)
      .select('title body sourceTitle sourceUrl place')
      .limit(30);

    const context = [
      ...places.map((p) =>
        `PLACE: ${p.name} (${p.city})\n` +
        `Summary: ${p.summary}\n` +
        `History: ${p.history}\n` +
        `Visiting hours: ${p.visitingHours}\n` +
        `Address: ${p.address}\nSlug: ${p.slug}`
      ),
      ...stories.map((s) =>
        `STORY: ${s.title}\nContent: ${s.body}\n` +
        `Source: ${s.sourceTitle || 'Not supplied'} ` +
        `${s.sourceUrl || ''}`
      )
    ].join('\n\n---\n\n').slice(0, 18000);

    if (!context.trim()) {
      return res.json({
        success: true,
        answer: FALLBACK,
        citations: []
      });
    }

    const answer = await askOllama(message, context);

    // Handle the known safe-fallback wording explicitly.
    const isFallback =
      /do not have approved heritage information/i.test(answer) ||
      /context does not provide any information/i.test(answer);

    if (isFallback) {
      return res.json({
        success: true,
        answer: FALLBACK,
        citations: []
      });
    }

    // First-pass citation filtering: include only records named
    // explicitly in the answer. This does not prove factual support.
    const normalizedAnswer = answer.toLowerCase();

    const placeCitations = places
      .filter((p) =>
        normalizedAnswer.includes(p.name.toLowerCase())
      )
      .map((p) => ({
        title: p.name,
        type: 'place',
        slug: p.slug
      }));

    const storyCitations = stories
      .filter((s) =>
        normalizedAnswer.includes(s.title.toLowerCase())
      )
      .map((s) => ({
        title: s.title,
        type: 'story'
      }));

    const sourceCitations = stories
      .filter((s) =>
        s.sourceUrl &&
        normalizedAnswer.includes(s.title.toLowerCase())
      )
      .map((s) => ({
        title: s.sourceTitle || s.title,
        type: 'source',
        url: s.sourceUrl
      }));

    const citations = [
      ...new Map(
        [...placeCitations, ...storyCitations, ...sourceCitations]
          .map((citation) => [
            `${citation.type}:${citation.title}`,
            citation
          ])
      ).values()
    ];

    res.json({
      success: true,
      answer,
      citations
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
