const mongoose = require('mongoose');

const narrativeSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    childName: {
        type: String,
        required: true
    },
    scenario: {
        type: String,
        required: true
    },
    comfortObject: {
        type: String,
        default: ''
    },
    childPhotoUrl: {
        type: String,
        default: ''
    },
    pages: [{
        pageNumber: { type: Number, required: true },
        caption: { type: String, required: true },
        imageUrl: { type: String, required: true },
        provider: { type: String, default: '' },
        error: { type: Boolean, default: false }
    }],
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed'],
        default: 'generating'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Narrative', narrativeSchema);
