/**
 * Gemini Flash Image Provider
 * Uses Gemini 2.5 Flash with image generation via generateContent API.
 * FREE tier: ~500 images/day with your existing GEMINI_API_KEY.
 * No billing required — uses the same key as text generation.
 */

const MODELS_TO_TRY = [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.5-flash-image'
];
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate an image using Gemini Flash's generateContent with responseModalities: ["IMAGE"].
 */
async function generateImage(prompt, options = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Enhance prompt for children's storybook style
    const enhancedPrompt = `Generate a high-quality children's storybook illustration: ${prompt}. Style: warm, colorful, cartoon, safe for children, no text or words in the image.`;

    let lastError;

    for (const model of MODELS_TO_TRY) {
        try {
            const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
            console.log(`[NeuralNarrative] Trying Gemini model: ${model}...`);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: enhancedPrompt }]
                    }],
                    generationConfig: {
                        responseModalities: ["IMAGE", "TEXT"],
                        temperature: 1.0,
                    }
                }),
                signal: AbortSignal.timeout(90000)
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`Gemini API error ${response.status}: ${errorText.substring(0, 150)}`);
            }

            const data = await response.json();

            const candidates = data.candidates;
            if (!candidates || candidates.length === 0) {
                throw new Error('Gemini returned no candidates');
            }

            const parts = candidates[0].content?.parts;
            if (!parts) {
                throw new Error('Gemini returned no content parts');
            }

            for (const part of parts) {
                if (part.inlineData) {
                    console.log(`[NeuralNarrative] Gemini Flash image generated successfully (model: ${model})`);
                    return {
                        base64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png'
                    };
                }
            }

            throw new Error('Gemini response did not contain an image');
        } catch (error) {
            console.warn(`[NeuralNarrative] Gemini model ${model} failed: ${error.message.substring(0, 80)}`);
            lastError = error;
        }
    }

    throw new Error(`Gemini Flash Image failed for all models. Last: ${lastError.message}`);
}

module.exports = {
    name: 'gemini-image',
    generateImage,
    isConfigured: () => !!process.env.GEMINI_API_KEY
};
