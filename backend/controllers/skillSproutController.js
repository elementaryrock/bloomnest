const SkillGoal = require('../models/SkillGoal');
const GrowthLog = require('../models/GrowthLog');
const ChildXP = require('../models/ChildXP');

// ─────────────────────────────────────────────────────────────
// Helper: get or create the XP record for a patient
// ─────────────────────────────────────────────────────────────
async function getOrCreateXP(patientId) {
    let xp = await ChildXP.findOne({ patientId });
    if (!xp) xp = await ChildXP.create({ patientId });
    return xp;
}

// ─────────────────────────────────────────────────────────────
// GET /api/skillsprout/goals/:patientId
// Returns all active goals (garden view) for a patient
// ─────────────────────────────────────────────────────────────
exports.getGardenByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Parents can only see their own child's data
        if (req.user.role === 'parent' && req.user.specialId !== patientId) {
            return res.status(403).json({ success: false, error: { message: 'Access denied' } });
        }

        const goals = await SkillGoal.find({ patientId, isActive: true })
            .sort({ isCompleted: 1, createdAt: -1 });

        const xp = await getOrCreateXP(patientId);

        return res.json({ success: true, data: { goals, xp } });
    } catch (err) {
        console.error('getGardenByPatient error:', err);
        return res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/skillsprout/forest/:patientId
// Returns completed goals (trees) for the forest view
// ─────────────────────────────────────────────────────────────
exports.getForestByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (req.user.role === 'parent' && req.user.specialId !== patientId) {
            return res.status(403).json({ success: false, error: { message: 'Access denied' } });
        }

        const trees = await SkillGoal.find({ patientId, isCompleted: true, isActive: true })
            .sort({ completedAt: -1 });

        return res.json({ success: true, data: trees });
    } catch (err) {
        console.error('getForestByPatient error:', err);
        return res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/skillsprout/goals
// Create a new therapy goal (therapist / parent)
// ─────────────────────────────────────────────────────────────
exports.createGoal = async (req, res) => {
    try {
        const {
            patientId, goalName, description, skillCategory,
            difficultyLevel, requiredCompletions, rewardMilestone,
            xpReward, targetDate
        } = req.body;

        if (!patientId || !goalName || !skillCategory) {
            return res.status(400).json({
                success: false,
                error: { message: 'patientId, goalName, and skillCategory are required' }
            });
        }

        const goal = await SkillGoal.create({
            patientId,
            createdBy: req.user.userId,
            createdByRole: req.user.role,
            goalName,
            description,
            skillCategory,
            difficultyLevel: difficultyLevel || 'easy',
            requiredCompletions: requiredCompletions || 10,
            rewardMilestone,
            xpReward: xpReward || 100,
            targetDate
        });

        return res.status(201).json({ success: true, data: goal });
    } catch (err) {
        console.error('createGoal error:', err);
        return res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/skillsprout/goals/:goalId/complete
// Log one activity completion → grow the plant
// ─────────────────────────────────────────────────────────────
exports.completeActivity = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { note } = req.body;

        const goal = await SkillGoal.findById(goalId);
        if (!goal) return res.status(404).json({ success: false, error: { message: 'Goal not found' } });
        if (goal.isCompleted) {
            return res.status(400).json({ success: false, error: { message: 'Goal already completed' } });
        }

        // Check parent access
        if (req.user.role === 'parent' && req.user.specialId !== goal.patientId) {
            return res.status(403).json({ success: false, error: { message: 'Access denied' } });
        }

        const stageBefore = goal.growthStage;
        goal.currentCompletions = Math.min(goal.currentCompletions + 1, goal.requiredCompletions);
        await goal.save(); // pre-save hook recalculates growthStage & isCompleted

        // Award XP
        const xpGained = goal.isCompleted ? goal.xpReward : Math.floor(goal.xpReward / goal.requiredCompletions);
        const xp = await getOrCreateXP(goal.patientId);
        xp.totalXP += xpGained;
        if (goal.isCompleted) xp.treesGrown += 1;

        // Award badges
        if (goal.isCompleted) {
            xp.badges.push({
                badgeName: `${goal.plantSpecies} Master`,
                badgeEmoji: goal.plantEmoji
            });
            if (xp.treesGrown === 1) xp.forestMilestones.push({ milestone: 'First Tree Grown! 🌳' });
            if (xp.treesGrown === 5) xp.forestMilestones.push({ milestone: 'Tiny Forest Begun! 🌲🌲🌲' });
            if (xp.treesGrown === 10) xp.forestMilestones.push({ milestone: 'A Whole Forest! 🌳🌲🌴' });
        }
        await xp.save();

        // Log the activity
        const log = await GrowthLog.create({
            goalId: goal._id,
            patientId: goal.patientId,
            activityType: 'completion',
            note,
            xpEarned: xpGained,
            stageBeforeActivity: stageBefore,
            stageAfterActivity: goal.growthStage,
            loggedBy: req.user.userId,
            loggedByRole: req.user.role
        });

        return res.json({
            success: true,
            data: {
                goal,
                xp,
                log,
                newStage: goal.growthStage,
                stageAdvanced: goal.growthStage > stageBefore,
                isCompleted: goal.isCompleted,
                xpGained
            }
        });
    } catch (err) {
        console.error('completeActivity error:', err);
        return res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/skillsprout/goals/:goalId/water
// Daily watering — builds streak, gives XP bonus
// ─────────────────────────────────────────────────────────────
exports.waterPlant = async (req, res) => {
    try {
        const { goalId } = req.params;
        const patientId = req.user.specialId || req.body.patientId;

        const goal = await SkillGoal.findById(goalId);
        if (!goal) return res.status(404).json({ success: false, error: { message: 'Goal not found' } });

        // Prevent double-watering in same day
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (goal.lastWatered) {
            const lastDay = new Date(goal.lastWatered); lastDay.setHours(0, 0, 0, 0);
            if (lastDay.getTime() === today.getTime()) {
                return res.status(400).json({ success: false, error: { message: 'Already watered today! Come back tomorrow 💧' } });
            }
        }

        goal.lastWatered = new Date();
        await goal.save();

        // Update XP streak
        const xp = await getOrCreateXP(goal.patientId);
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0, 0, 0, 0);
        if (xp.lastWateredDate) {
            const lastWD = new Date(xp.lastWateredDate); lastWD.setHours(0, 0, 0, 0);
            if (lastWD.getTime() === yesterday.getTime()) {
                xp.wateringStreak += 1;
            } else if (lastWD.getTime() < yesterday.getTime()) {
                xp.wateringStreak = 1; // reset streak
            }
        } else {
            xp.wateringStreak = 1;
        }
        xp.lastWateredDate = new Date();
        const bonusXP = 5 + (xp.wateringStreak >= 7 ? 10 : 0); // extra bonus for 7-day streak
        xp.totalXP += bonusXP;
        await xp.save();

        await GrowthLog.create({
            goalId: goal._id,
            patientId: goal.patientId,
            activityType: 'watering',
            xpEarned: bonusXP,
            stageBeforeActivity: goal.growthStage,
            stageAfterActivity: goal.growthStage,
            loggedBy: req.user.userId,
            loggedByRole: req.user.role || 'parent',
            note: `Watered! Streak: ${xp.wateringStreak} days`
        });

        return res.json({
            success: true,
            data: { streak: xp.wateringStreak, bonusXP, totalXP: xp.totalXP }
        });
    } catch (err) {
        console.error('waterPlant error:', err);
        return res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/skillsprout/logs/:patientId
// Growth history log for therapist analytics
// ─────────────────────────────────────────────────────────────
exports.getGrowthLogs = async (req, res) => {
    try {
        const { patientId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const logs = await GrowthLog.find({ patientId })
            .populate('goalId', 'goalName plantSpecies plantEmoji skillCategory')
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.json({ success: true, data: logs });
    } catch (err) {
        console.error('getGrowthLogs error:', err);
        return res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/skillsprout/analytics/:patientId
// Therapist dashboard analytics
// ─────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    try {
        const { patientId } = req.params;

        const [goals, xp, recentLogs] = await Promise.all([
            SkillGoal.find({ patientId, isActive: true }),
            getOrCreateXP(patientId),
            GrowthLog.find({ patientId }).sort({ createdAt: -1 }).limit(30)
        ]);

        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.isCompleted).length;
        const inProgressGoals = goals.filter(g => !g.isCompleted && g.currentCompletions > 0).length;
        const avgProgress = totalGoals > 0
            ? Math.round(goals.reduce((sum, g) => sum + (g.currentCompletions / g.requiredCompletions) * 100, 0) / totalGoals)
            : 0;

        // Group by skill category
        const categoryBreakdown = goals.reduce((acc, g) => {
            if (!acc[g.skillCategory]) acc[g.skillCategory] = { total: 0, completed: 0 };
            acc[g.skillCategory].total += 1;
            if (g.isCompleted) acc[g.skillCategory].completed += 1;
            return acc;
        }, {});

        // Activity in last 7 days
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivity = recentLogs.filter(l => new Date(l.createdAt) > sevenDaysAgo).length;

        return res.json({
            success: true,
            data: {
                totalGoals, completedGoals, inProgressGoals, avgProgress,
                categoryBreakdown, recentActivity,
                xp,
                recentLogs: recentLogs.slice(0, 10)
            }
        });
    } catch (err) {
        console.error('getAnalytics error:', err);
        return res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/skillsprout/goals/:goalId
// Soft-delete a goal (therapist / admin only)
// ─────────────────────────────────────────────────────────────
exports.deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        await SkillGoal.findByIdAndUpdate(goalId, { isActive: false });
        return res.json({ success: true, message: 'Goal removed from garden' });
    } catch (err) {
        return res.status(500).json({ success: false, error: { message: err.message } });
    }
};
