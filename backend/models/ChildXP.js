const mongoose = require('mongoose');

const childXPSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    totalXP: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    wateringStreak: {
        type: Number,
        default: 0
    },
    lastWateredDate: {
        type: Date
    },
    treesGrown: {
        type: Number,
        default: 0
    },
    badges: [{
        badgeName: String,
        badgeEmoji: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    forestMilestones: [{
        milestone: String,
        achievedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Calculate level from XP: each level needs levelNum * 50 XP
childXPSchema.pre('save', function (next) {
    this.level = Math.floor(this.totalXP / 100) + 1;
    next();
});

module.exports = mongoose.model('ChildXP', childXPSchema);
