/**
 * Image Generation Service
 * Uses Imagen 4 (imagen-4.0-generate-001) for image generation via the predict API.
 * Uses Gemini 3 Flash Preview for story outline text generation.
 * Includes automatic retry with backoff for rate limit errors.
 */

const GEMINI_TEXT_MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash'];
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
function buildPagePrompt(childName, scenario, comfortObject, pageNumber, totalPages, pageDescription, theme) {
    let prompt = `Create a warm, friendly, cartoon-style illustration for a children's storybook. `;
    prompt += `This is page ${pageNumber} of ${totalPages}. `;
    prompt += `The main character is a cheerful child named "${childName}". `;
    prompt += `The story involves: "${scenario}"${theme ? ` with a focus on ${theme}` : ''}. `;
    prompt += `Scene for this page: ${pageDescription}. `;

    if (comfortObject) {
        prompt += `The child has their favorite comfort object/hero "${comfortObject}" with them for support. `;
    }

    prompt += `Style: Breathtakingly colorful, warm, and delightful modern cartoon storybook art with rich saturated colors. Use warm peachy, coral, blue, green, and pink tones. `;
    prompt += `CRITICAL: The image MUST feature extremely vibrant, bright, dazzling colors with warm lighting. Rich color palette with warm browns, peachy oranges, sky blues, and warm yellows. `;
    prompt += `IMPORTANT: Fully render with rich, saturated, eye-catching, and vivid colors that children adore. Include cozy home elements and warm atmospheric details. `;
    prompt += `NEGATIVE PROMPT: ABSOLUTELY NO black and white, grayscale, monochrome, dull, muted, or pale images. Avoid sepia tones and washed-out colors. `;
    prompt += `The child should look happy, brave, and confident with warm, friendly facial expressions. `;
    prompt += `Do NOT include any text or words in the image. Focus on emotional warmth and visual richness.`;

    return prompt;
}

/**
 * Story archetype templates for variety.
 * One is selected at random each generation to prevent repetitive plots.
 */
const STORY_ARCHETYPES = [
    {
        name: 'Magical Adventure',
        beats: [
            'Open with CHILD discovering something unexpected and wondrous — a glowing doorway, a talking animal, a mysterious map. Set the scene with vivid sensory details.',
            'CHILD steps into the new world or begins the quest. Everything feels enchanted. Describe the amazement and wonder through specific sensory details — what they see, hear, smell.',
            'An obstacle or puzzle appears. CHILD must think creatively, using something from their real interests/favorites to solve it in a clever, surprising way.',
            'The climactic moment arrives — CHILD accomplishes something they never thought possible. Make this dramatic, joyful, and cinematic.',
            'CHILD returns home changed — braver and wiser. End with a cozy, warm, emotionally resonant moment that lingers.'
        ]
    },
    {
        name: 'Friendship Tale',
        beats: [
            'CHILD encounters someone (or a creature) who is lonely, lost, or different. Show CHILD\'s empathy and curiosity.',
            'The two begin an unlikely friendship. They discover shared interests and have a genuinely fun moment together. Be specific and playful.',
            'A misunderstanding or challenge threatens the friendship. Show real emotions — confusion, sadness, the desire to make things right.',
            'CHILD makes a selfless, creative gesture to repair the bond. This moment should feel earned and heartfelt, not generic.',
            'The friendship is stronger than ever. End with them sharing a quiet, beautiful moment that captures the warmth of true connection.'
        ]
    },
    {
        name: 'Mystery Quest',
        beats: [
            'CHILD finds a curious clue in an everyday place — a strange note, unusual footprints, a sound that shouldn\'t be there. Intrigue builds.',
            'Following the trail, CHILD discovers the second clue in a surprising location. The world transforms as they look at ordinary things with detective eyes.',
            'The clues lead somewhere unexpected. CHILD must piece things together using their cleverness. Build suspense — what could the answer be?',
            'The mystery is solved! The reveal should be delightful and surprising — something heartwarming, not scary. CHILD\'s unique skills made the difference.',
            'CHILD shares the discovery with someone they love. The ordinary world now feels richer because of the adventure. End with a smile-inducing twist or warm conclusion.'
        ]
    },
    {
        name: 'Creative Quest',
        beats: [
            'CHILD has a big, ambitious creative idea — building, painting, performing, inventing. Show the spark of inspiration and excitement.',
            'Work begins! Things go well at first, but the project is harder than expected. Show CHILD experimenting, making a mess, and laughing through the chaos.',
            'A setback strikes — something breaks, goes wrong, or doesn\'t work as planned. CHILD feels frustrated but refuses to give up.',
            'With a flash of inspiration (connected to their real interests), CHILD tries a completely new approach. It works beautifully — even better than the original plan!',
            'The creation is complete and CHILD proudly shows it to someone special. Their reaction makes CHILD glow with pride. End with warmth and celebration.'
        ]
    },
    {
        name: 'Nature Journey',
        beats: [
            'CHILD ventures into a beautiful natural setting — a forest, garden, seashore, or meadow. Describe it through their wonder-filled eyes with rich sensory language.',
            'CHILD discovers something extraordinary in nature — a hidden nest, a rainbow reflection, a tiny creature. This sparks a sense of awe and connection.',
            'Nature presents a gentle challenge — a path to cross, weather to navigate, or a creature that needs help. CHILD approaches it with kindness and ingenuity.',
            'Through patience and care, CHILD accomplishes something meaningful in harmony with nature. Describe this moment as truly magical and cinematic.',
            'As the day ends, CHILD carries the experience in their heart. Describe a gorgeous natural scene (sunset, stars, fireflies) as a backdrop for CHILD\'s peaceful contentment.'
        ]
    },
    {
        name: 'Courage Challenge',
        beats: [
            'CHILD faces something that makes them nervous — it could be anything age-appropriate. Show the butterflies-in-tummy feeling honestly and gently.',
            'CHILD remembers something comforting — a memory, a person\'s words, or a beloved object. This gives them a small spark of courage. Describe the emotional shift.',
            'CHILD takes one brave step forward. The scary thing starts to seem less frightening as they engage with it. Describe the transformation of perspective.',
            'CHILD does it! They face the challenge fully and discover it was actually wonderful. The fear melts away into excitement and exhilaration.',
            'Afterwards, CHILD feels a deep glow of pride. They realize courage isn\'t the absence of fear — it\'s doing something even when you feel scared. End with warm celebration.'
        ]
    }
];

/**
 * Generate a story outline using Gemini text generation.
 * Uses random story archetypes and a timestamp seed to ensure unique stories every time.
 * Tries multiple models as fallback if one is rate-limited.
 */
async function generateStoryOutline(childName, scenario, comfortObject, apiKey, theme) {
    const totalPages = 5;
    if (!apiKey) {
        console.log('[NeuralNarrative] GEMINI_API_KEY not set, using default story outline');
        return getDefaultOutline(childName, scenario, comfortObject, theme);
    }

    // Pick a random story archetype for variety
    const archetype = STORY_ARCHETYPES[Math.floor(Math.random() * STORY_ARCHETYPES.length)];
    const uniqueSeed = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    console.log(`[NeuralNarrative] Using story archetype: "${archetype.name}" (seed: ${uniqueSeed})`);

    // Build dynamic page structure from the chosen archetype
    const pageInstructions = archetype.beats.map((beat, i) => {
        return `Page ${i + 1}: ${beat.replace(/CHILD/g, childName)}`;
    }).join('\n');

    const prompt = `You are a world-renowned children's picture book author known for writing stories that make children feel seen, brave, and joyful.

Your task: Write a stunning, one-of-a-kind 5-page picture book story.

THE CHILD:
- Name: ${childName}
- Loves: ${scenario}
- Comfort item or hero: ${comfortObject || 'their own imagination and inner courage'}
${theme ? `- Story theme/lesson: ${theme}` : '- Theme: Choose a meaningful, age-appropriate theme that fits naturally'}

STORY BLUEPRINT ("${archetype.name}" arc):
${pageInstructions}

WRITING RULES — FOLLOW EXACTLY:
1. UNIQUENESS IS PARAMOUNT. Variation seed: ${uniqueSeed}. Use this to ensure THIS story is unlike any other. Vary settings, plot twists, dialogue, emotions, and vocabulary.
2. Write REAL picture book captions — lyrical, rhythmic, evocative prose. Think Mo Willems meets Oliver Jeffers. Each caption should be 2–3 rich sentences that a parent would LOVE reading aloud.
3. Weave ${childName}'s interests (${scenario}) organically into the plot as meaningful story elements — NOT as a checklist.
4. NEVER use generic phrases like: "is getting ready", "arrives at", "is doing great", "is so proud", "what a day", "all done", "big day". These are BANNED.
5. NEVER use meta-commentary: no "Based on", "Theme:", "Moral:", or breaking the fourth wall.
6. Each caption must advance the plot AND convey a specific emotion. Show, don't tell.
7. Give the story a SPECIFIC, CONCRETE setting (not just "a magical place" — name it, describe its unique details).
8. Include at least one line of simple, natural dialogue from ${childName} across the 5 pages.

For each page, provide:
- "caption": The actual storybook text (2–3 vivid, emotionally resonant sentences).
- "sceneDescription": A detailed, cinematic visual description for an illustrator (specify: setting details, character pose/expression, lighting quality, color palette, time of day, and atmosphere).

Return ONLY a JSON array of ${totalPages} objects. No markdown, no commentary.`;

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 2500,
            topP: 0.95,
            topK: 40
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
                return getDefaultOutline(childName, scenario, comfortObject, theme);
            }
        } catch (error) {
            console.warn(`[NeuralNarrative] Model ${model} failed: ${error.message?.substring(0, 100)}`);
            lastError = error;
            continue;
        }
    }

    // All models failed — use default outline instead of crashing
    console.warn('[NeuralNarrative] All text models failed, using default outline');
    return getDefaultOutline(childName, scenario, comfortObject, theme);
}

/**
 * Default fallback outline when AI generation fails.
 * Uses richer, more narrative-quality language even in the fallback.
 */
function getDefaultOutline(childName, scenario, comfortObject, theme) {
    const interests = scenario.split(',').map(s => s.trim()).filter(Boolean);
    const mainInterest = interests[0] || 'adventure';
    const secondInterest = interests[1] || 'discovery';
    const comfortItem = comfortObject || 'a warm, glowing feeling inside';
    const storyTheme = theme || 'discovering something wonderful';

    // Multiple fallback variants for variety
    const variants = [
        [
            {
                caption: `The morning sun painted ${childName}'s room in stripes of gold, and today felt different — like the air itself was humming with a secret. "Something amazing is going to happen," ${childName} whispered.`,
                sceneDescription: `A child's cozy bedroom bathed in warm golden morning light streaming through curtains. The child sits up in bed with wide, excited eyes and a gentle smile. Warm color palette — amber, soft peach, cream. Plush toys and drawings on the walls.`
            },
            {
                caption: `And there it was — tucked behind the old oak tree in the garden — a doorway made entirely of shimmering ${mainInterest}-colored light. ${childName} clutched ${comfortItem} and took a deep breath.`,
                sceneDescription: `A magical glowing doorway at the base of a grand oak tree in a lush garden. The child stands before it, holding their comfort object, face lit with wonder and determination. Ethereal blue-green-gold light spills from the doorway. Butterflies and fireflies around.`
            },
            {
                caption: `Inside the doorway, the world was made of ${secondInterest} and starlight. Flowers sang tiny melodies and the path ahead sparkled like it had been waiting just for ${childName}.`,
                sceneDescription: `A breathtaking fantasy landscape — rolling hills of soft pastel colors, bioluminescent flowers, a sparkling winding path. The child walks forward with arms slightly outstretched in wonder. Warm, dreamy lighting with soft bokeh effects.`
            },
            {
                caption: `"I can do this," ${childName} said, and the words felt like magic of their own. With steady hands and an even steadier heart, ${childName} reached for the ${storyTheme} — and the whole world held its breath.`,
                sceneDescription: `A dramatic, heroic moment: the child reaching upward toward something glowing and beautiful. Dynamic pose, confident expression. Warm spotlighting from above, rich saturated colors — coral, teal, amber. Sparkle effects around the child's hands.`
            },
            {
                caption: `The stars themselves seemed to applaud as ${childName} walked home through the twilight, heart full of a warm glow that would never fade. Some adventures change you forever — and this was one of them.`,
                sceneDescription: `The child walking along a beautiful twilight path toward a warmly-lit home in the distance. Stars twinkling above, fireflies around, a content peaceful smile. Rich purple-blue sky with warm orange window-light. Cinematic wide shot with the child silhouetted gently.`
            }
        ]
    ];

    return variants[Math.floor(Math.random() * variants.length)];
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
async function generateStorybook(childName, scenario, comfortObject, apiKey, cloudinaryUpload, theme) {
    console.log(`[NeuralNarrative] Generating storybook for "${childName}" - scenario: "${scenario}"${theme ? `, theme: "${theme}"` : ''}`);

    // Step 1: Generate the story outline
    const outline = await generateStoryOutline(childName, scenario, comfortObject, apiKey, theme);
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
            page.sceneDescription,
            theme
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
