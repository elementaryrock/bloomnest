/**
 * Pollinations.ai Image Provider
 * Free, no signup, high-quality image generation using the FLUX model.
 */

/**
 * Generate an image using Pollinations.ai.
 */
async function generateImage(prompt, options = {}) {
    const {
        width = 768,
        height = 768,
        seed = Math.floor(Math.random() * 1000000),
        model = 'flux-schnell', // User specifically requested flux-schnell
        nologo = true
    } = options;

    const encodedPrompt = encodeURIComponent(prompt);

    // We'll try flux-schnell first, then flux as fallback if needed
    const modelsToTry = [model, 'flux'];
    let lastError;

    for (const currentModel of modelsToTry) {
        try {
            // Pollinations GET endpoint
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${currentModel}${nologo ? '&nologo=true' : ''}&safe=true`;

            console.log(`[NeuralNarrative] Requesting Pollinations (${currentModel}) image...`);

            const headers = {
                'Content-Type': 'application/json'
            };
            if (process.env.POLLINATIONS_API_KEY) {
                headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers,
                signal: AbortSignal.timeout(60000)
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No error text');
                throw new Error(`Status ${response.status}: ${errorText.substring(0, 50)}`);
            }

            const contentType = response.headers.get('content-type') || 'image/png';
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');

            return {
                base64,
                mimeType: contentType
            };
        } catch (error) {
            console.warn(`[NeuralNarrative] Pollinations model ${currentModel} failed: ${error.message}`);
            lastError = error;
            // Continue to fallback model
        }
    }

    throw new Error(`Pollinations API failed for all models. Last error: ${lastError.message}`);
}

module.exports = {
    name: 'pollinations',
    generateImage
};
