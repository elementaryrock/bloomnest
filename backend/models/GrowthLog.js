const mongoose = require('mongoose');

const growthLogSchema = new mongoose.Schema({
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillGoal',
        required: true,
        index: true
    },
    patientId: {
        type: String,
        required: true,
        index: true
    },
    activityType: {
        type: String,
        enum: ['completion', 'watering', 'reward_gift', 'milestone'],
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    xpEarned: {
        type: Number,
        default: 0
    },
    stageBeforeActivity: {
        type: Number,
        default: 0
    },
    stageAfterActivity: {
        type: Number,
        default: 0
    },
    loggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    loggedByRole: {
        type: String,
        enum: ['therapist', 'admin', 'parent', 'system'],
        default: 'parent'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GrowthLog', growthLogSchema);
