const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path or base64 data URL
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadToCloudinary = async (filePath, options = {}) => {
    const defaultOptions = {
        folder: 'therapy-booking',
        resource_type: 'auto',
        transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' }
        ]
    };

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            ...defaultOptions,
            ...options
        });

        return {
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height
            }
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file');
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: result.result === 'ok' };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file');
    }
};

/**
 * Generate signed upload URL for direct uploads
 * @returns {Object} Signature data for frontend upload
 */
const getUploadSignature = () => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: 'therapy-booking' },
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY
    };
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getUploadSignature,
    cloudinary
};
