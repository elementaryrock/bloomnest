/**
 * Image Generation Service
 * Uses Imagen 4 (imagen-4.0-generate-001) for image generation via the predict API.
 * Uses Gemini 2.5 Flash for story outline text generation.
 * Includes automatic retry with backoff for rate limit errors.
 */

const GEMINI_TEXT_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite'];
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Import our new multi-provider image generation system
const { generateImageWithFallback } = require('./imageProviders');

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse retry delay from a Gemini/Imagen 429 error response.
 */
function parseRetryDelay(errorText) {
    try {
        const parsed = JSON.parse(errorText);
        const retryInfo = parsed?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
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
async function apiCallWithRetry(url, body, apiKey, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            console.log(`[NeuralNarrative] Retry attempt ${attempt}/${maxRetries}...`);
        }

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

        const errorText = await response.text();

        if (response.status === 429 && attempt < maxRetries) {
            const retryMs = parseRetryDelay(errorText) || (15000 * (attempt + 1));
            console.log(`[NeuralNarrative] Rate limited. Waiting ${Math.ceil(retryMs / 1000)}s before retry...`);
            await sleep(retryMs);
            continue;
        }

        lastError = `API error ${response.status}: ${errorText.substring(0, 200)}`;
    }

    throw new Error(lastError);
}

/**
 * Build a rich prompt for a single storybook page.
 */
function buildPagePrompt(childName, scenario, comfortObject, pageNumber, totalPages, pageDescription) {
    let prompt = `Create a warm, friendly, cartoon-style illustration for a children's storybook. `;
    prompt += `This is page ${pageNumber} of ${totalPages}. `;
    prompt += `The main character is a cheerful child named "${childName}". `;
    prompt += `The story is about: "${scenario}". `;
    prompt += `Scene for this page: ${pageDescription}. `;

    if (comfortObject) {
        prompt += `The child has their favorite comfort object/hero "${comfortObject}" with them for support. `;
    }

    prompt += `Style: Bright colors, soft rounded shapes, child-friendly cartoon art style. `;
    prompt += `The child should look happy, brave, and confident. `;
    prompt += `Do NOT include any text or words in the image.`;

    return prompt;
}

/**
 * Generate a story outline using Gemini text generation.
 * Tries multiple models as fallback if one is rate-limited.
 */
async function generateStoryOutline(childName, scenario, comfortObject, apiKey) {
    const totalPages = 5;
    if (!apiKey) {
        console.log('[NeuralNarrative] GEMINI_API_KEY not set, using default story outline');
        return getDefaultOutline(childName, scenario, comfortObject);
    }

    const prompt = `You are a children's storybook writer specializing in social scripts for children who might be anxious or afraid.

Create a short ${totalPages}-page storybook outline for a child named "${childName}" about the scenario: "${scenario}".
${comfortObject ? `The child's favorite comfort object or hero is "${comfortObject}" and it should appear as support.` : ''}

The story should:
1. Start with preparation and feeling ready
2. Show the child arriving and being greeted warmly
3. Show the child going through the experience calmly, step by step
4. Show a moment of bravery or accomplishment
5. End with the child feeling proud and getting a reward/celebration

For each page, provide:
- A short caption (1-2 sentences, written for a child aged 3-8)
- A scene description for an illustrator (1-2 sentences describing the visual)

Format your response EXACTLY as a JSON array with ${totalPages} objects, each having "caption" and "sceneDescription" keys. 
Return ONLY the JSON array, no other text.`;

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024
        }
    };

    // Try each text model in order
    let lastError;
    for (const model of GEMINI_TEXT_MODELS) {
        const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
        console.log(`[NeuralNarrative] Trying text model: ${model}`);

        try {
            const data = await apiCallWithRetry(url, requestBody, apiKey, 2);
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('No text content returned');
            }

            // Parse JSON from the response (handle markdown code fences)
            let jsonStr = textContent.trim();
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }

            try {
                const outline = JSON.parse(jsonStr);
                if (!Array.isArray(outline) || outline.length === 0) {
                    throw new Error('Invalid outline format');
                }
                console.log(`[NeuralNarrative] Story outline generated successfully with ${model}`);
                return outline.slice(0, totalPages);
            } catch (parseError) {
                console.error('[NeuralNarrative] Failed to parse story outline, using default');
                return getDefaultOutline(childName, scenario, comfortObject);
            }
        } catch (error) {
            console.warn(`[NeuralNarrative] Model ${model} failed: ${error.message?.substring(0, 100)}`);
            lastError = error;
            continue;
        }
    }

    // All models failed — use default outline instead of crashing
    console.warn('[NeuralNarrative] All text models failed, using default outline');
    return getDefaultOutline(childName, scenario, comfortObject);
}

/**
 * Default fallback outline when AI generation fails.
 */
function getDefaultOutline(childName, scenario, comfortObject) {
    const comfortText = comfortObject ? ` ${childName} brings their friend ${comfortObject} along.` : '';
    return [
        {
            caption: `${childName} is getting ready for a big day! It's time for ${scenario}.${comfortText}`,
            sceneDescription: `A cheerful child at home, looking in a mirror and smiling, preparing to go out.${comfortObject ? ` A ${comfortObject} is nearby.` : ''}`
        },
        {
            caption: `${childName} arrives and meets nice, friendly people who say hello!`,
            sceneDescription: `The child arriving at the location, being warmly greeted by a smiling adult.`
        },
        {
            caption: `${childName} is doing great! Everything is going smoothly and ${childName} stays calm.`,
            sceneDescription: `The child calmly going through the activity, looking relaxed and comfortable.`
        },
        {
            caption: `Look how brave ${childName} is! ${childName} did it all by themselves!`,
            sceneDescription: `The child showing a proud, accomplished expression with a thumbs up.`
        },
        {
            caption: `All done! ${childName} is so proud and gets a special treat for being so brave!`,
            sceneDescription: `The child celebrating with a big smile, receiving a small reward like a sticker or treat.`
        }
    ];
}

/**
 * Generate a single image using our multi-provider system.
 * Tries Pollinations, Cloudflare, and Imagen in order.
 */
async function generateImage(prompt, apiKey) {
    // For our wrapper, we'll pass the apiKey in options for Imagen fallback
    return await generateImageWithFallback(prompt, { apiKey });
}

/**
 * Upload a base64 image to Cloudinary and return the URL.
 */
async function uploadImageToCloudinary(base64Data, mimeType, cloudinaryUtil) {
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    const result = await cloudinaryUtil(dataUrl, {
        folder: 'therapy-booking/narratives'
    });
    return result.data.url || result.data.secure_url;
}

/**
 * Generate the full storybook: outline + images for each page.
 * Includes a delay between image requests to avoid rate limits.
 */
async function generateStorybook(childName, scenario, comfortObject, apiKey, cloudinaryUpload) {
    console.log(`[NeuralNarrative] Generating storybook for "${childName}" - scenario: "${scenario}"`);

    // Step 1: Generate the story outline
    const outline = await generateStoryOutline(childName, scenario, comfortObject, apiKey);
    console.log(`[NeuralNarrative] Generated ${outline.length}-page outline`);

    // Step 2: Generate images for each page in PARALLEL (with a bit of control)
    const pagePromises = outline.map(async (page, i) => {
        const pageNum = i + 1;

        // Slightly stagger the start to be nice to APIs
        if (i > 0) await sleep(500 * i);

        console.log(`[NeuralNarrative] Starting generation for page ${pageNum}/${outline.length}...`);

        const imagePrompt = buildPagePrompt(
            childName,
            scenario,
            comfortObject,
            pageNum,
            outline.length,
            page.sceneDescription
        );

        try {
            const imageResult = await generateImage(imagePrompt, apiKey);

            // Upload to Cloudinary
            let imageUrl;
            if (cloudinaryUpload) {
                imageUrl = await uploadImageToCloudinary(imageResult.base64, imageResult.mimeType, cloudinaryUpload);
            } else {
                // Fallback: use base64 data URL directly
                imageUrl = `data:${imageResult.mimeType};base64,${imageResult.base64}`;
            }

            return {
                pageNumber: pageNum,
                caption: page.caption,
                imageUrl: imageUrl,
                provider: imageResult.provider
            };
        } catch (imgError) {
            console.error(`[NeuralNarrative] Failed to generate image for page ${pageNum}:`, imgError.message);
            return {
                pageNumber: pageNum,
                caption: page.caption,
                imageUrl: `https://placehold.co/768x768/E8F5E9/2E7D32?text=Page+${pageNum}`,
                provider: 'placeholder',
                error: true
            };
        }
    });

    const pages = await Promise.all(pagePromises);

    // Ensure they are sorted by page number
    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    return pages;
}

module.exports = {
    generateStorybook,
    generateStoryOutline,
    generateImage
};
