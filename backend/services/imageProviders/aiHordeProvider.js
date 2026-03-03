/**
 * AI Horde Image Provider
 * 100% free, community-powered Stable Diffusion image generation.
 * No API key needed (anonymous mode), or register at https://aihorde.net for priority.
 * Uses an async queue: submit → poll → retrieve.
 */

const HORDE_API_BASE = 'https://aihorde.net/api/v2';
const ANONYMOUS_KEY = '0000000000';  // Default anonymous API key
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;  // 40 * 3s = 2 minutes max wait

/**
 * Generate an image using AI Horde (Stable Diffusion).
 */
async function generateImage(prompt, options = {}) {
    const apiKey = process.env.AIHORDE_API_KEY || ANONYMOUS_KEY;

    // Enhanced prompt for children's storybook
    const enhancedPrompt = `${prompt}, children's book illustration, cartoon style, bright vibrant colors, warm lighting, safe for kids`;

    console.log(`[NeuralNarrative] Submitting image to AI Horde...`);

    // Step 1: Submit the generation request
    const submitResponse = await fetch(`${HORDE_API_BASE}/generate/async`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify({
            prompt: enhancedPrompt,
            params: {
                width: 512,
                height: 512,
                steps: 25,
                cfg_scale: 7.5,
                sampler_name: 'k_euler_a',
                n: 1
            },
            nsfw: false,
            censor_nsfw: true,
            models: ['stable_diffusion'],
            r2: true  // Use R2 storage for faster retrieval
        }),
        signal: AbortSignal.timeout(15000)
    });

    if (!submitResponse.ok) {
        const errorText = await submitResponse.text().catch(() => 'Unknown error');
        throw new Error(`AI Horde submit failed (${submitResponse.status}): ${errorText.substring(0, 100)}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.id;

    if (!requestId) {
        throw new Error('AI Horde did not return a request ID');
    }

    console.log(`[NeuralNarrative] AI Horde job submitted: ${requestId}`);

    // Step 2: Poll for completion
    for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

        const statusResponse = await fetch(`${HORDE_API_BASE}/generate/check/${requestId}`, {
            signal: AbortSignal.timeout(10000)
        });

        if (!statusResponse.ok) continue;

        const status = await statusResponse.json();

        if (status.done) {
            // Step 3: Retrieve the image
            const resultResponse = await fetch(`${HORDE_API_BASE}/generate/status/${requestId}`, {
                signal: AbortSignal.timeout(15000)
            });

            if (!resultResponse.ok) {
                throw new Error(`AI Horde status retrieval failed: ${resultResponse.status}`);
            }

            const result = await resultResponse.json();
            const generations = result.generations;

            if (!generations || generations.length === 0) {
                throw new Error('AI Horde returned no generations');
            }

            const imageUrl = generations[0].img;

            // Download the image and convert to base64
            const imageResponse = await fetch(imageUrl, {
                signal: AbortSignal.timeout(15000)
            });

            if (!imageResponse.ok) {
                throw new Error(`Failed to download AI Horde image: ${imageResponse.status}`);
            }

            const contentType = imageResponse.headers.get('content-type') || 'image/webp';
            const buffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');

            console.log(`[NeuralNarrative] AI Horde image generated successfully`);
            return { base64, mimeType: contentType };
        }

        if (status.faulted) {
            throw new Error('AI Horde generation faulted');
        }

        // Still processing, log progress
        if (i % 5 === 0) {
            console.log(`[NeuralNarrative] AI Horde: waiting... (queue: ${status.queue_position || '?'}, wait: ${status.wait_time || '?'}s)`);
        }
    }

    throw new Error('AI Horde timed out after polling');
}

module.exports = {
    name: 'aihorde',
    generateImage
    // No isConfigured — always available (anonymous mode)
};
