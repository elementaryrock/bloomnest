/**
 * Image Provider Factory and Orchestrator
 * Manages multiple image generation providers with automatic failover.
 */

const pollinations = require('./pollinationsProvider');
const cloudflare = require('./cloudflareProvider');
const imagen = require('./imagenProvider');

const ALL_PROVIDERS = [pollinations, cloudflare, imagen];

/**
 * Get available providers in their priority order.
 * Priority: Configured in env, then fallback list.
 */
function getEnabledProviders() {
    const preferredProviderName = process.env.IMAGE_PROVIDER;

    // Sort providers based on preference and whether they are configured
    let providers = [...ALL_PROVIDERS];

    if (preferredProviderName) {
        const preferred = providers.find(p => p.name === preferredProviderName);
        if (preferred) {
            providers = [preferred, ...providers.filter(p => p.name !== preferredProviderName)];
        }
    }

    // Filter to only those that can run (configured)
    return providers.filter(p => !p.isConfigured || p.isConfigured());
}

/**
 * Generate an image with automatic provider failover.
 */
async function generateImageWithFallback(prompt, options = {}) {
    const enabledProviders = getEnabledProviders();
    let lastError;

    if (enabledProviders.length === 0) {
        throw new Error('No image generation providers are configured');
    }

    for (const provider of enabledProviders) {
        try {
            console.log(`[NeuralNarrative] Attempting image generation with provider: ${provider.name}`);
            const result = await provider.generateImage(prompt, options);
            console.log(`[NeuralNarrative] Successfully generated image with ${provider.name}`);
            return {
                ...result,
                provider: provider.name
            };
        } catch (error) {
            console.warn(`[NeuralNarrative] Provider ${provider.name} failed: ${error.message}`);
            lastError = error;
            // Continue to the next provider
        }
    }

    throw new Error(`All image providers failed. Last error: ${lastError?.message}`);
}

module.exports = {
    generateImageWithFallback,
    getEnabledProviders
};
