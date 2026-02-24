const FamilyWellbeing = require('../models/FamilyWellbeing');
const Session = require('../models/Session');

// Helper: get the Monday of the week for a given date
const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust if Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
};

// Helper: map progressLevel string to numeric score
const progressToScore = (level) => {
    const map = {
        'Excellent': 4,
        'Good': 3,
        'Satisfactory': 2,
        'Needs Improvement': 1
    };
    return map[level] || 0;
};

// Helper: map feeling to numeric value for analysis
const feelingToScore = (feeling) => {
    const map = {
        'happy': 5,
        'neutral': 3,
        'anxious': 2,
        'frustrated': 1,
        'sad': 1
    };
    return map[feeling] || 3;
};

// POST /api/family-wellbeing/log
const logWellbeing = async (req, res) => {
    try {
        const { specialId } = req.user;
        const { stressLevel, siblingEntries, notes, weekStart: customWeekStart } = req.body;

        if (!stressLevel || stressLevel < 1 || stressLevel > 5) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Stress level must be between 1 and 5' }
            });
        }

        const weekStart = customWeekStart ? getWeekStart(new Date(customWeekStart)) : getWeekStart(new Date());

        // Upsert: update if entry for this week exists, otherwise create
        const entry = await FamilyWellbeing.findOneAndUpdate(
            { specialId, weekStart },
            {
                specialId,
                weekStart,
                stressLevel,
                siblingEntries: siblingEntries || [],
                notes: notes || '',
                loggedBy: 'parent'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({
            success: true,
            message: 'Wellbeing log saved successfully',
            data: entry
        });
    } catch (error) {
        console.error('Error logging wellbeing:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to save wellbeing log' }
        });
    }
};

// GET /api/family-wellbeing/history
const getWellbeingHistory = async (req, res) => {
    try {
        const { specialId } = req.user;

        const entries = await FamilyWellbeing.find({ specialId })
            .sort({ weekStart: -1 })
            .limit(52); // last year

        res.json({
            success: true,
            data: entries
        });
    } catch (error) {
        console.error('Error fetching wellbeing history:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch wellbeing history' }
        });
    }
};

// GET /api/family-wellbeing/ripple-analysis
const getRippleAnalysis = async (req, res) => {
    try {
        const { specialId } = req.user;

        // Fetch wellbeing entries and completed sessions in parallel
        const [wellbeingEntries, sessions] = await Promise.all([
            FamilyWellbeing.find({ specialId }).sort({ weekStart: 1 }),
            Session.find({ specialId, completedAt: { $ne: null } }).sort({ sessionDate: 1 })
        ]);

        // Build weekly session progress map
        const weeklyProgress = {};
        sessions.forEach((session) => {
            if (session.progressLevel) {
                const wk = getWeekStart(session.sessionDate).toISOString();
                if (!weeklyProgress[wk]) weeklyProgress[wk] = [];
                weeklyProgress[wk].push(progressToScore(session.progressLevel));
            }
        });

        // Build timeline data points
        const timeline = wellbeingEntries.map((entry) => {
            const wk = entry.weekStart.toISOString();
            const progressScores = weeklyProgress[wk] || [];
            const avgProgress = progressScores.length
                ? progressScores.reduce((a, b) => a + b, 0) / progressScores.length
                : null;

            // Calculate average sibling wellbeing
            const siblingScores = (entry.siblingEntries || []).map(s => feelingToScore(s.feeling));
            const avgSiblingWellbeing = siblingScores.length
                ? siblingScores.reduce((a, b) => a + b, 0) / siblingScores.length
                : null;

            return {
                week: entry.weekStart,
                stressLevel: entry.stressLevel,
                invertedStress: 6 - entry.stressLevel, // higher = better for correlation
                childProgress: avgProgress,
                siblingWellbeing: avgSiblingWellbeing,
                hasSiblingData: siblingScores.length > 0
            };
        });

        // Compute correlations
        const pointsWithBoth = timeline.filter(t => t.childProgress !== null);
        let correlation = null;
        let trend = 'insufficient_data';
        let insight = 'Log more weeks and complete more sessions to see correlations.';

        if (pointsWithBoth.length >= 3) {
            // Simple Pearson correlation between inverted stress and child progress
            const n = pointsWithBoth.length;
            const sumX = pointsWithBoth.reduce((s, p) => s + p.invertedStress, 0);
            const sumY = pointsWithBoth.reduce((s, p) => s + p.childProgress, 0);
            const sumXY = pointsWithBoth.reduce((s, p) => s + p.invertedStress * p.childProgress, 0);
            const sumX2 = pointsWithBoth.reduce((s, p) => s + p.invertedStress ** 2, 0);
            const sumY2 = pointsWithBoth.reduce((s, p) => s + p.childProgress ** 2, 0);

            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
            correlation = denominator !== 0 ? Math.round((numerator / denominator) * 100) / 100 : 0;

            if (correlation > 0.5) {
                trend = 'positive';
                insight = 'Strong positive ripple! As family stress decreases, the child\'s therapy progress improves. The whole family is healing together.';
            } else if (correlation > 0.2) {
                trend = 'moderate';
                insight = 'Moderate positive connection. Family wellbeing and child progress are moving in a good direction together.';
            } else if (correlation > -0.2) {
                trend = 'neutral';
                insight = 'Family stress and child progress appear independent right now. Keep logging to see patterns emerge.';
            } else {
                trend = 'inverse';
                insight = 'The data shows some variability. This is common in early therapy stages — keep going!';
            }
        }

        // Compute ripple scores for visualization rings
        const recentEntries = wellbeingEntries.slice(-4); // last 4 weeks
        const avgStress = recentEntries.length
            ? recentEntries.reduce((s, e) => s + e.stressLevel, 0) / recentEntries.length
            : 3;
        const recentSessions = sessions.slice(-4);
        const avgChildProgress = recentSessions.length
            ? recentSessions.reduce((s, sess) => s + progressToScore(sess.progressLevel || 'Satisfactory'), 0) / recentSessions.length
            : 2;

        const allSiblingScores = recentEntries.flatMap(e =>
            (e.siblingEntries || []).map(s => feelingToScore(s.feeling))
        );
        const avgSiblingScore = allSiblingScores.length
            ? allSiblingScores.reduce((a, b) => a + b, 0) / allSiblingScores.length
            : null;

        const rippleScores = {
            child: Math.round((avgChildProgress / 4) * 100),       // 0-100%
            parent: Math.round(((6 - avgStress) / 5) * 100),       // 0-100% (inverted stress)
            siblings: avgSiblingScore !== null ? Math.round((avgSiblingScore / 5) * 100) : null,
            overall: null
        };

        // Compute overall family score
        const scoresToAvg = [rippleScores.child, rippleScores.parent];
        if (rippleScores.siblings !== null) scoresToAvg.push(rippleScores.siblings);
        rippleScores.overall = Math.round(scoresToAvg.reduce((a, b) => a + b, 0) / scoresToAvg.length);

        res.json({
            success: true,
            data: {
                timeline,
                correlation: {
                    value: correlation,
                    trend,
                    insight,
                    dataPoints: pointsWithBoth.length
                },
                rippleScores,
                totalLogs: wellbeingEntries.length,
                totalSessions: sessions.length
            }
        });
    } catch (error) {
        console.error('Error computing ripple analysis:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to compute ripple analysis' }
        });
    }
};

module.exports = {
    logWellbeing,
    getWellbeingHistory,
    getRippleAnalysis
};
