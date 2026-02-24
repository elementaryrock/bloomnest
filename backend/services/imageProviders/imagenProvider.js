/**
 * Imagen Provider
 * Extracts the existing Imagen 4 logic from imageGenerationService.js.
 * This is the paid premium fallback.
 */

const IMAGEN_MODEL = 'imagen-4.0-generate-001';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse retry delay from a Gemini/Imagen 429 error response.
 */
function parseRetryDelay(errorData) {
    try {
        const retryInfo = errorData?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
            const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
            if (!isNaN(seconds)) return Math.ceil(seconds * 1000);
        }
    } catch (e) { /* ignore parse errors */ }
    return null;
}

/**
 * Make an API call with automatic retry on 429 errors.
 */
async function apiCallWithRetry(url, body, apiKey, maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                return await response.json();
            }

            const errorData = await response.json();

            if (response.status === 429 && attempt < maxRetries) {
                const retryMs = parseRetryDelay(errorData) || (20000 * (attempt + 1));
                console.log(`[NeuralNarrative] Imagen rate limited. Waiting ${Math.ceil(retryMs / 1000)}s...`);
                await sleep(retryMs);
                continue;
            }

            lastError = `Imagen API error ${response.status}: ${JSON.stringify(errorData).substring(0, 200)}`;
        } catch (err) {
            lastError = err.message;
            if (attempt < maxRetries) {
                await sleep(5000 * (attempt + 1));
                continue;
            }
        }
    }

    throw new Error(lastError);
}

/**
 * Generate an image using Imagen 4.
 */
async function generateImage(prompt, options = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured for Imagen');
    }

    const url = `${API_BASE}/${IMAGEN_MODEL}:predict`;

    console.log(`[NeuralNarrative] Requesting Imagen 4 image...`);

    const data = await apiCallWithRetry(url, {
        instances: [{ prompt }],
        parameters: { sampleCount: 1 }
    }, apiKey);

    const predictions = data.predictions;
    if (!predictions || predictions.length === 0) {
        throw new Error('No predictions returned from Imagen API');
    }

    const prediction = predictions[0];
    if (!prediction.bytesBase64Encoded) {
        throw new Error('No image data in Imagen response');
    }

    return {
        base64: prediction.bytesBase64Encoded,
        mimeType: prediction.mimeType || 'image/png'
    };
}

module.exports = {
    name: 'imagen',
    generateImage,
    isConfigured: () => !!process.env.GEMINI_API_KEY
};
