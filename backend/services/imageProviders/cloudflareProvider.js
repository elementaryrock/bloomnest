/**
 * Cloudflare Workers AI Image Provider
 * Uses Stable Diffusion XL (SDXL) via Cloudflare's free trial/worker credits.
 */

/**
 * Generate an image using Cloudflare Workers AI.
 * Requires ACCOUNT_ID and API_TOKEN.
 */
async function generateImage(prompt, options = {}) {
    const {
        accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
        apiToken = process.env.CLOUDFLARE_AI_TOKEN,
        width = 768,
        height = 768,
        numSteps = 20
    } = options;

    if (!accountId || !apiToken) {
        throw new Error('Cloudflare credentials not configured');
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

    console.log(`[NeuralNarrative] Requesting Cloudflare image...`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt,
            width,
            height,
            num_steps: numSteps
        }),
        signal: AbortSignal.timeout(90000)
    });

    if (!response.ok) {
        let errorMsg = `Cloudflare API failed with status ${response.status}`;
        try {
            const errorObj = await response.json();
            errorMsg = errorObj.errors?.[0]?.message || errorMsg;
        } catch (e) { /* ignore parse error */ }
        throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
        base64,
        mimeType: contentType
    };
}

module.exports = {
    name: 'cloudflare',
    generateImage,
    isConfigured: () => !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_TOKEN)
};
