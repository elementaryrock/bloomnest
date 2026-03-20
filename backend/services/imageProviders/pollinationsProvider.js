/**
 * Pollinations.ai Image Provider
 * Uses FLUX model for image generation.
 * Requires API key from enter.pollinations.ai
 */

/**
 * Check if Pollinations is configured.
 */
function isConfigured() {
    return !!process.env.POLLINATIONS_API_KEY && process.env.POLLINATIONS_API_KEY !== 'your-api-key-here';
}

/**
 * Generate an image using Pollinations.ai.
 * No timeout - keeps trying until image is generated.
 */
async function generateImage(prompt, options = {}) {
    const {
        width = 768,
        height = 768,
        seed = Math.floor(Math.random() * 1000000),
        nologo = true,
        retries = 5
    } = options;

    const apiKey = process.env.POLLINATIONS_API_KEY;
    const encodedPrompt = encodeURIComponent(prompt);

    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`[Pollinations] Attempt ${attempt}/${retries} - Generating image with Flux...`);

            const url = `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=${!!nologo}&safe=true`;

            const headers = {
                'accept': 'image/jpeg, image/png'
            };

            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(`Pollinations API error (${response.status}): ${errorBody.error?.message || response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || 'image/png';
            
            if (!contentType.includes('image')) {
                throw new Error(`Unexpected content type: ${contentType}`);
            }

            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');

            console.log(`[Pollinations] Image generated! (${buffer.length} bytes)`);

            return {
                base64,
                mimeType: contentType
            };
        } catch (error) {
            console.warn(`[Pollinations] Attempt ${attempt} failed: ${error.message}`);
            lastError = error;
            
            if (attempt < retries) {
                const waitTime = attempt * 2000;
                console.log(`[Pollinations] Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw new Error(`Pollinations failed after ${retries} attempts. Last error: ${lastError?.message}`);
}

module.exports = {
    name: 'pollinations',
    generateImage,
    isConfigured
};
