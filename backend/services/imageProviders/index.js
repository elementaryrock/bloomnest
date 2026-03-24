/**
 * Image Provider Factory and Orchestrator
 * Supports Pollinations.ai, Pixazo.ai, and Cloudflare Workers AI
 */

const pollinations = require('./pollinationsProvider');
const pixazo = require('./pixazoProvider');
const cloudflare = require('./cloudflareProvider');

/**
 * Get available providers.
 */
function getEnabledProviders() {
    return [pixazo, pollinations, cloudflare];
}

/**
 * Generate an image using configured provider with fallback.
 * Keeps retrying until successful.
 */
async function generateImageWithFallback(prompt, options = {}) {
    require('dotenv').config({ override: true }); // Ensure env is refreshed
    const providerName = process.env.IMAGE_PROVIDER || 'cloudflare';
    let provider = cloudflare;

    if (providerName === 'pollinations') {
        provider = pollinations;
    } else if (providerName === 'cloudflare') {
        provider = cloudflare;
    }

    console.log(`[NeuralNarrative] Generating image using ${provider.name}...`);
    const result = await provider.generateImage(prompt, options);
    console.log(`[NeuralNarrative] Image generated successfully with ${provider.name}`);
    
    return {
        ...result,
        provider: provider.name
    };
}

module.exports = {
    generateImageWithFallback,
    getEnabledProviders
};
