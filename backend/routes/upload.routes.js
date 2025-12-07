const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary, getUploadSignature } = require('../utils/cloudinary');
const authenticate = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload file endpoint
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { message: 'No file uploaded' }
            });
        }

        // Convert buffer to base64 data URL
        const base64 = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(dataUrl, {
            folder: 'therapy-booking/patients'
        });

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Upload failed' }
        });
    }
});

// Get upload signature for direct frontend uploads
router.get('/signature', authenticate, (req, res) => {
    try {
        const signatureData = getUploadSignature();
        res.status(200).json({
            success: true,
            data: signatureData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { message: 'Failed to generate signature' }
        });
    }
});

module.exports = router;
