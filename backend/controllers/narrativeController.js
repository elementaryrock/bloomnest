const Narrative = require('../models/Narrative');
const { generateStorybook } = require('../services/imageGenerationService');

let cloudinaryUpload = null;
try {
    const { uploadToCloudinary } = require('../utils/cloudinary');
    cloudinaryUpload = uploadToCloudinary;
} catch (e) {
    console.warn('[NeuralNarrative] Cloudinary not configured, images will use data URLs');
}

/**
 * POST /api/narrative/generate
 * Generate a new NeuralNarrative storybook.
 */
const generateNarrative = async (req, res) => {
    try {
        const { childName, scenario, comfortObject, childPhotoUrl } = req.body;

        // Validation
        if (!childName || !scenario) {
            return res.status(400).json({
                success: false,
                error: { message: 'childName and scenario are required' }
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                success: false,
                error: { message: 'AI service is not configured. Please add GEMINI_API_KEY to your .env file.' }
            });
        }

        // Create a narrative record with status 'generating'
        const narrative = new Narrative({
            userId: req.user.userId,
            patientId: req.user.specialId || req.user.userId,
            childName,
            scenario,
            comfortObject: comfortObject || '',
            childPhotoUrl: childPhotoUrl || '',
            status: 'generating',
            pages: []
        });
        await narrative.save();

        // Generate storybook asynchronously — but we await it here for simplicity
        try {
            const pages = await generateStorybook(
                childName,
                scenario,
                comfortObject || '',
                apiKey,
                cloudinaryUpload
            );

            narrative.pages = pages;
            narrative.status = 'completed';
            await narrative.save();

            return res.status(200).json({
                success: true,
                data: narrative
            });
        } catch (genError) {
            console.error('[NeuralNarrative] Generation failed:', genError);
            narrative.status = 'failed';
            await narrative.save();

            return res.status(500).json({
                success: false,
                error: { message: 'Story generation failed. Please try again.' }
            });
        }
    } catch (error) {
        console.error('[NeuralNarrative] Controller error:', error);
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Internal server error' }
        });
    }
};

/**
 * GET /api/narrative/history
 * Get all narratives for the current user.
 */
const getNarrativeHistory = async (req, res) => {
    try {
        const narratives = await Narrative.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            data: narratives
        });
    } catch (error) {
        console.error('[NeuralNarrative] History error:', error);
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to fetch narrative history' }
        });
    }
};

/**
 * GET /api/narrative/:id
 * Get a specific narrative by ID.
 */
const getNarrativeById = async (req, res) => {
    try {
        const narrative = await Narrative.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!narrative) {
            return res.status(404).json({
                success: false,
                error: { message: 'Narrative not found' }
            });
        }

        return res.status(200).json({
            success: true,
            data: narrative
        });
    } catch (error) {
        console.error('[NeuralNarrative] Get by ID error:', error);
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to fetch narrative' }
        });
    }
};

module.exports = {
    generateNarrative,
    getNarrativeHistory,
    getNarrativeById
};
