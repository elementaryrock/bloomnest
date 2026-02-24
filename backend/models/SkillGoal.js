const mongoose = require('mongoose');

const skillGoalSchema = new mongoose.Schema({
    patientId: {
        type: String, // specialId of the patient
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    createdByRole: {
        type: String,
        enum: ['therapist', 'admin', 'parent'],
        default: 'therapist'
    },

    // Goal Details
    goalName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    skillCategory: {
        type: String,
        enum: ['communication', 'cognitive', 'motor', 'social', 'emotional', 'speech', 'sensory', 'selfcare'],
        required: true
    },
    difficultyLevel: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    },

    // Plant Identity (auto-assigned based on category)
    plantSpecies: {
        type: String,
        required: true
    },
    plantEmoji: {
        type: String,
        required: true
    },

    // Progress Tracking
    requiredCompletions: {
        type: Number,
        required: true,
        min: 1,
        default: 10
    },
    currentCompletions: {
        type: Number,
        default: 0,
        min: 0
    },

    // Plant Growth Stage: 0=seed, 1=sprout, 2=small, 3=flower, 4=tree
    growthStage: {
        type: Number,
        default: 0,
        min: 0,
        max: 4
    },

    // Status
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Reward milestone message shown when goal is achieved
    rewardMilestone: {
        type: String,
        trim: true
    },

    // XP earned by child
    xpReward: {
        type: Number,
        default: 100
    },

    // Season theme for this plant (used in forest view)
    seasonTheme: {
        type: String,
        enum: ['spring', 'summer', 'autumn', 'winter'],
        default: 'spring'
    },

    // Track last watered date
    lastWatered: {
        type: Date
    },
    wateringStreak: {
        type: Number,
        default: 0
    },

    startDate: {
        type: Date,
        default: Date.now
    },
    targetDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Auto-assign plant species & emoji based on skill category
skillGoalSchema.pre('validate', function (next) {
    const plantMap = {
        communication: { species: 'Chatter Cherry', emoji: '🍒' },
        cognitive: { species: 'Think Thistle', emoji: '🌺' },
        motor: { species: 'Mighty Maple', emoji: '🍁' },
        social: { species: 'Kindness Clover', emoji: '🍀' },
        emotional: { species: 'Calm Cactus', emoji: '🌵' },
        speech: { species: 'Speak Sunflower', emoji: '🌻' },
        sensory: { species: 'Wonder Willow', emoji: '🌿' },
        selfcare: { species: 'Care Chrysanthemum', emoji: '🌸' }
    };
    if (this.skillCategory && plantMap[this.skillCategory]) {
        this.plantSpecies = plantMap[this.skillCategory].species;
        this.plantEmoji = plantMap[this.skillCategory].emoji;
    }
    next();
});

// Update growth stage whenever completions change
skillGoalSchema.pre('save', function (next) {
    const progress = this.currentCompletions / this.requiredCompletions;
    if (progress < 0.2) this.growthStage = 0; // seed
    else if (progress < 0.4) this.growthStage = 1; // sprout
    else if (progress < 0.6) this.growthStage = 2; // small plant
    else if (progress < 1.0) this.growthStage = 3; // flower
    else {
        this.growthStage = 4; // tree
        if (!this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('SkillGoal', skillGoalSchema);
