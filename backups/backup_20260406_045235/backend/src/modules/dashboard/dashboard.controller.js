const EventRegistration = require('../../models/EventRegistration');
const ActivityLog       = require('../../models/ActivityLog');
const EngagementMetric  = require('../../models/EngagementMetric');

// ─── GET /api/v1/dashboard/summary ───────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const all      = await EventRegistration.find().lean();
    const total    = all.length;
    const high     = all.filter((r) => r.relevanceStatus === 'high').length;
    const moderate = all.filter((r) => r.relevanceStatus === 'moderate').length;
    const low      = all.filter((r) => r.relevanceStatus === 'low').length;

    const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
    const modPct  = total > 0 ? Math.round((moderate / total) * 100) : 0;
    const lowPct  = total > 0 ? Math.round((low / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAttendees:     total,
        totalAttendeesChange: 12.5,   // could be computed from time-windowed data
        highRelevance:  { count: high,     percentage: highPct },
        moderate:       { count: moderate, percentage: modPct  },
        lowRelevance:   { count: low,      percentage: lowPct  },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/dashboard/activity ──────────────────────────────────────────
exports.getActivity = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const activities = logs.map((l) => ({
      id:          l._id,
      type:        l.type,
      title:       l.title,
      description: l.description,
      createdAt:   l.createdAt,
    }));

    res.status(200).json({ success: true, activities });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/dashboard/engagement-trend ──────────────────────────────────
exports.getEngagementTrend = async (req, res, next) => {
  try {
    const metrics = await EngagementMetric.find().sort({ month: 1 }).lean();

    const months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const fallback = months.map((m, i) => ({
      month: m, engagement: 65 + i * 4, prediction: 62 + i * 5,
    }));

    const data = metrics.length
      ? metrics.map((m) => ({
          month:      new Date(m.month).toLocaleString('default', { month: 'short' }),
          engagement: m.engagementRate,
          prediction: m.predictedRate ?? m.engagementRate + 3,
        }))
      : fallback;

    res.status(200).json({ success: true, data, predictedGrowth: 15 });
  } catch (err) {
    next(err);
  }
};
