/**
 * Cloudflare Workers AI Image Provider
 * Uses FLUX-2-Klein-4B model via Cloudflare Workers AI proxy.
 * Endpoint: https://free-image-generation.sentientjoker.workers.dev
 */

/**
 * Check if Cloudflare Workers AI is configured.
 */
function isConfigured() {
    return !!process.env.CLOUDFLARE_WORKERS_TOKEN && process.env.CLOUDFLARE_WORKERS_TOKEN !== 'your-cloudflare-workers-token-here';
}

/**
 * Generate an image using Cloudflare Workers AI (flux-2-klein-4b).
 * The endpoint returns raw image binary data.
 */
async function generateImage(prompt, options = {}) {
    const {
        retries = 5
    } = options;

    const apiToken = process.env.CLOUDFLARE_WORKERS_TOKEN;

    if (!apiToken) {
        throw new Error('Cloudflare Workers token not configured. Set CLOUDFLARE_WORKERS_TOKEN in .env');
    }

    const url = 'https://free-image-generation.sentientjoker.workers.dev';

    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`[Cloudflare] Attempt ${attempt}/${retries} - Generating image with flux-2-klein-4b...`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt }),
                signal: AbortSignal.timeout(120000)
            });

            if (!response.ok) {
                let errorMsg = `Cloudflare Workers AI failed with status ${response.status}`;
                try {
                    const errorBody = await response.text();
                    errorMsg += `: ${errorBody}`;
                } catch (e) { /* ignore parse error */ }
                throw new Error(errorMsg);
            }

            const contentType = response.headers.get('content-type') || 'image/png';
            const buffer = await response.arrayBuffer();

            if (buffer.byteLength === 0) {
                throw new Error('Received empty image response from Cloudflare Workers AI');
            }

            const base64 = Buffer.from(buffer).toString('base64');

            console.log(`[Cloudflare] Image generated successfully! (${buffer.byteLength} bytes)`);

            return {
                base64,
                mimeType: contentType.includes('image') ? contentType : 'image/png'
            };
        } catch (error) {
            console.warn(`[Cloudflare] Attempt ${attempt} failed: ${error.message}`);
            lastError = error;

            if (attempt < retries) {
                const waitTime = attempt * 2000;
                console.log(`[Cloudflare] Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw new Error(`Cloudflare Workers AI failed after ${retries} attempts. Last error: ${lastError?.message}`);
}

module.exports = {
    name: 'cloudflare',
    generateImage,
    isConfigured
};
