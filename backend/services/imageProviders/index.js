/**
 * Image Provider Factory and Orchestrator
 * Uses Pollinations.ai (Flux model) exclusively for image generation.
 */

const pollinations = require('./pollinationsProvider');

/**
 * Get available providers - Pollinations only.
 */
function getEnabledProviders() {
    return [pollinations];
}

/**
 * Generate an image using Pollinations.ai.
 * Keeps retrying until successful.
 */
async function generateImageWithFallback(prompt, options = {}) {
    console.log(`[NeuralNarrative] Generating image using Pollinations (Flux)...`);
    const result = await pollinations.generateImage(prompt, options);
    console.log(`[NeuralNarrative] Image generated successfully with Pollinations`);
    return {
        ...result,
        provider: 'pollinations'
    };
}

module.exports = {
    generateImageWithFallback,
    getEnabledProviders
};
