const FamilyWellbeing = require('../models/FamilyWellbeing');
const Session = require('../models/Session');
const PDFDocument = require('pdfkit');

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

const STRESS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const FEELING_LABELS = { happy: 'Happy', neutral: 'Neutral', anxious: 'Anxious', frustrated: 'Frustrated', sad: 'Sad' };

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
        } else if (wellbeingEntries.length >= 2) {
            // Fallback insight based purely on stress logs if we lack session data
            const recent = wellbeingEntries.slice(-2);
            const currentStress = recent[1].stressLevel;
            const prevStress = recent[0].stressLevel;

            if (currentStress < prevStress) {
                trend = 'positive';
                insight = 'Family stress has decreased recently! Keep logging to see how this correlates with therapy progress.';
            } else if (currentStress > prevStress) {
                trend = 'inverse';
                insight = 'Family stress has increased recently. This is normal during challenging weeks — keep going!';
            } else {
                trend = 'neutral';
                insight = 'Family stress levels are steady. Remember to continue logging each week to uncover longer-term patterns.';
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

// GET /api/family-wellbeing/progress-pdf
const generateProgressPDF = async (req, res) => {
    try {
        const { specialId } = req.user;

        const [wellbeingEntries, sessions] = await Promise.all([
            FamilyWellbeing.find({ specialId }).sort({ weekStart: -1 }),
            Session.find({ specialId, completedAt: { $ne: null } }).sort({ sessionDate: -1 })
        ]);

        // ── Compute stats ──
        const totalLogs = wellbeingEntries.length;
        const totalSessions = sessions.length;
        const avgStress = totalLogs > 0
            ? (wellbeingEntries.reduce((s, e) => s + e.stressLevel, 0) / totalLogs).toFixed(1)
            : 'N/A';
        const bestWeek = totalLogs > 0
            ? wellbeingEntries.reduce((best, e) => e.stressLevel < best.stressLevel ? e : best, wellbeingEntries[0])
            : null;

        // ── Compute ripple scores (same logic as ripple-analysis) ──
        const recent4 = wellbeingEntries.slice(0, 4); // already sorted desc
        const avgStress4 = recent4.length
            ? recent4.reduce((s, e) => s + e.stressLevel, 0) / recent4.length
            : 3;
        const recent4Sessions = sessions.slice(0, 4);
        const avgChildProgress = recent4Sessions.length
            ? recent4Sessions.reduce((s, sess) => s + progressToScore(sess.progressLevel || 'Satisfactory'), 0) / recent4Sessions.length
            : 2;
        const sibScores = recent4.flatMap(e => (e.siblingEntries || []).map(s => feelingToScore(s.feeling)));
        const avgSibScore = sibScores.length ? sibScores.reduce((a, b) => a + b, 0) / sibScores.length : null;

        const rippleScores = {
            child: Math.round((avgChildProgress / 4) * 100),
            parent: Math.round(((6 - avgStress4) / 5) * 100),
            siblings: avgSibScore !== null ? Math.round((avgSibScore / 5) * 100) : null,
        };
        const scoresToAvg = [rippleScores.child, rippleScores.parent];
        if (rippleScores.siblings !== null) scoresToAvg.push(rippleScores.siblings);
        rippleScores.overall = Math.round(scoresToAvg.reduce((a, b) => a + b, 0) / scoresToAvg.length);

        // ── Correlation (simplified) ──
        const ascEntries = [...wellbeingEntries].reverse();
        const weeklyProgress = {};
        sessions.forEach(session => {
            if (session.progressLevel) {
                const wk = getWeekStart(session.sessionDate).toISOString();
                if (!weeklyProgress[wk]) weeklyProgress[wk] = [];
                weeklyProgress[wk].push(progressToScore(session.progressLevel));
            }
        });
        const timeline = ascEntries.map(entry => {
            const wk = entry.weekStart.toISOString();
            const pScores = weeklyProgress[wk] || [];
            const avgP = pScores.length ? pScores.reduce((a, b) => a + b, 0) / pScores.length : null;
            return { invertedStress: 6 - entry.stressLevel, childProgress: avgP };
        });
        const pts = timeline.filter(t => t.childProgress !== null);
        let correlationValue = null;
        let trend = 'insufficient_data';
        let insight = 'Log more weeks and complete more sessions to see correlations.';
        if (pts.length >= 3) {
            const n = pts.length;
            const sX = pts.reduce((s, p) => s + p.invertedStress, 0);
            const sY = pts.reduce((s, p) => s + p.childProgress, 0);
            const sXY = pts.reduce((s, p) => s + p.invertedStress * p.childProgress, 0);
            const sX2 = pts.reduce((s, p) => s + p.invertedStress ** 2, 0);
            const sY2 = pts.reduce((s, p) => s + p.childProgress ** 2, 0);
            const denom = Math.sqrt((n * sX2 - sX ** 2) * (n * sY2 - sY ** 2));
            correlationValue = denom !== 0 ? Math.round(((n * sXY - sX * sY) / denom) * 100) / 100 : 0;
            if (correlationValue > 0.5) { trend = 'positive'; insight = 'Strong positive ripple! Family stress reduction correlates with therapy progress.'; }
            else if (correlationValue > 0.2) { trend = 'moderate'; insight = 'Moderate positive connection between family wellbeing and therapy progress.'; }
            else if (correlationValue > -0.2) { trend = 'neutral'; insight = 'Family stress and child progress appear independent right now.'; }
            else { trend = 'inverse'; insight = 'The data shows some variability — common in early therapy stages.'; }
        } else if (wellbeingEntries.length >= 2) {
            // wellbeingEntries is sorted by weekStart: -1 (descending, so index 0 is newest)
            const recent = wellbeingEntries.slice(0, 2);
            const currentStress = recent[0].stressLevel;
            const prevStress = recent[1].stressLevel;

            if (currentStress < prevStress) {
                trend = 'positive';
                insight = 'Family stress has decreased recently! Keep logging to see how this correlates with therapy progress.';
            } else if (currentStress > prevStress) {
                trend = 'inverse';
                insight = 'Family stress has increased recently. This is normal during challenging weeks — keep going!';
            } else {
                trend = 'neutral';
                insight = 'Family stress levels are steady. Remember to continue logging each week to uncover longer-term patterns.';
            }
        }

        // ── Build PDF ──
        const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="TherapyRipple_Progress_${new Date().toISOString().slice(0, 10)}.pdf"`);
        doc.pipe(res);

        const purple = '#7c3aed';
        const gray = '#6b7280';
        const darkGray = '#1f2937';

        // ── Header ──
        doc.rect(0, 0, doc.page.width, 100).fill(purple);
        doc.fill('#ffffff').fontSize(24).font('Helvetica-Bold').text('Therapy Ripple', 50, 30);
        doc.fontSize(11).font('Helvetica').text('Family Wellbeing Progress Report', 50, 60);
        doc.fontSize(9).text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  |  ID: ${specialId}`, 50, 78);

        doc.fill(darkGray);

        // ── Summary Stats ──
        const statsY = 120;
        doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, statsY);
        doc.moveTo(50, statsY + 18).lineTo(545, statsY + 18).strokeColor('#e5e7eb').stroke();

        const statBoxes = [
            { label: 'Total Logs', value: String(totalLogs) },
            { label: 'Sessions', value: String(totalSessions) },
            { label: 'Avg Stress', value: String(avgStress) },
            { label: 'Best Week', value: bestWeek ? new Date(bestWeek.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A' },
        ];
        const boxW = 120;
        statBoxes.forEach((box, i) => {
            const x = 50 + i * (boxW + 5);
            doc.roundedRect(x, statsY + 26, boxW, 50, 6).fillAndStroke('#f9fafb', '#e5e7eb');
            doc.fill(purple).fontSize(18).font('Helvetica-Bold').text(box.value, x, statsY + 32, { width: boxW, align: 'center' });
            doc.fill(gray).fontSize(8).font('Helvetica').text(box.label, x, statsY + 56, { width: boxW, align: 'center' });
        });

        // ── Ripple Scores ──
        const ripY = statsY + 100;
        doc.fill(darkGray).fontSize(14).font('Helvetica-Bold').text('Ripple Scores (Last 4 Weeks)', 50, ripY);
        doc.moveTo(50, ripY + 18).lineTo(545, ripY + 18).strokeColor('#e5e7eb').stroke();

        const scoreItems = [
            { label: 'Child Progress', value: `${rippleScores.child}%`, color: '#8b5cf6' },
            { label: 'Parent Wellbeing', value: `${rippleScores.parent}%`, color: '#3b82f6' },
            { label: 'Siblings', value: rippleScores.siblings !== null ? `${rippleScores.siblings}%` : 'N/A', color: '#10b981' },
            { label: 'Overall', value: `${rippleScores.overall}%`, color: purple },
        ];
        scoreItems.forEach((item, i) => {
            const x = 50 + i * (boxW + 5);
            doc.roundedRect(x, ripY + 26, boxW, 50, 6).fillAndStroke('#f9fafb', '#e5e7eb');
            doc.fill(item.color).fontSize(18).font('Helvetica-Bold').text(item.value, x, ripY + 32, { width: boxW, align: 'center' });
            doc.fill(gray).fontSize(8).font('Helvetica').text(item.label, x, ripY + 56, { width: boxW, align: 'center' });
        });

        // ── AI Insight ──
        const insightY = ripY + 100;
        doc.fill(darkGray).fontSize(14).font('Helvetica-Bold').text('AI Insight', 50, insightY);
        doc.moveTo(50, insightY + 18).lineTo(545, insightY + 18).strokeColor('#e5e7eb').stroke();

        doc.roundedRect(50, insightY + 26, 495, 50, 6).fillAndStroke('#f5f3ff', '#ddd6fe');
        const trendLabel = { positive: 'Positive Ripple', moderate: 'Moderate Ripple', neutral: 'Neutral', inverse: 'Variable', insufficient_data: 'Need More Data' }[trend] || 'N/A';
        doc.fill(purple).fontSize(10).font('Helvetica-Bold').text(`Trend: ${trendLabel}${correlationValue !== null ? `  (r = ${correlationValue})` : ''}`, 60, insightY + 32);
        doc.fill(gray).fontSize(9).font('Helvetica').text(insight, 60, insightY + 48, { width: 475 });

        // ── Stress History Table ──
        const tableY = insightY + 100;
        doc.fill(darkGray).fontSize(14).font('Helvetica-Bold').text('Stress History', 50, tableY);
        doc.moveTo(50, tableY + 18).lineTo(545, tableY + 18).strokeColor('#e5e7eb').stroke();

        // Table header
        const cols = [
            { label: 'Week', x: 50, w: 80 },
            { label: 'Stress', x: 130, w: 70 },
            { label: 'Siblings', x: 200, w: 160 },
            { label: 'Notes', x: 360, w: 185 },
        ];
        let rowY = tableY + 28;
        doc.rect(50, rowY - 4, 495, 18).fill('#f3f4f6');
        doc.fill(darkGray).fontSize(8).font('Helvetica-Bold');
        cols.forEach(c => doc.text(c.label, c.x + 4, rowY, { width: c.w - 8 }));
        rowY += 20;

        // Table rows (limit to 20 for page space)
        const entriesToShow = wellbeingEntries.slice(0, 20);
        doc.font('Helvetica').fontSize(8).fill(gray);

        entriesToShow.forEach((entry, idx) => {
            if (rowY > doc.page.height - 60) {
                doc.addPage();
                rowY = 50;
            }

            if (idx % 2 === 0) {
                doc.rect(50, rowY - 4, 495, 18).fill('#fafafa');
                doc.fill(gray);
            }

            const weekLabel = new Date(entry.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
            const stressLabel = STRESS_LABELS[entry.stressLevel - 1] || String(entry.stressLevel);
            const siblingsText = (entry.siblingEntries || []).map(s => `${s.name}: ${FEELING_LABELS[s.feeling] || s.feeling}`).join(', ') || '—';
            const noteText = entry.notes ? (entry.notes.length > 60 ? entry.notes.substring(0, 57) + '...' : entry.notes) : '—';

            doc.text(weekLabel, cols[0].x + 4, rowY, { width: cols[0].w - 8 });
            doc.text(stressLabel, cols[1].x + 4, rowY, { width: cols[1].w - 8 });
            doc.text(siblingsText, cols[2].x + 4, rowY, { width: cols[2].w - 8 });
            doc.text(noteText, cols[3].x + 4, rowY, { width: cols[3].w - 8 });
            rowY += 20;
        });

        // ── Footer ──
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fill('#9ca3af').fontSize(7).font('Helvetica')
                .text(`Therapy Ripple Progress Report  •  Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 30, { width: 495, align: 'center' });
        }

        doc.end();
    } catch (error) {
        console.error('Error generating progress PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to generate progress PDF' }
            });
        }
    }
};

module.exports = {
    logWellbeing,
    getWellbeingHistory,
    getRippleAnalysis,
    generateProgressPDF
};
