/**
 * Image Generation Service
 * Uses Gemini 3 Flash Preview for story outline text generation.
 * Uses multi-provider system for image generation.
 * Includes automatic retry with backoff for rate limit errors.
 *
 * Story Diversity System:
 *   - 12 unique story archetypes with distinct narrative structures
 *   - "Story DNA" randomization: setting × tone × time × weather
 *   - Few-shot caption examples in the prompt for quality
 *   - Caption quality validation with retry
 *   - 4 fallback outline variants
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
 * Build a rich prompt for a single storybook page illustration.
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

// ─────────────────────────────────────────────────────────────
// STORY DNA SYSTEM — Random elements combined to create
// thousands of unique story "fingerprints"
// ─────────────────────────────────────────────────────────────

const STORY_SETTINGS = [
    'a cozy treehouse village hidden in an ancient forest',
    'a cheerful seaside town with painted boats and lighthouses',
    'a mountaintop kingdom above the clouds',
    'a bustling market square in a town where everything is made of candy',
    'a secret garden behind a crumbling stone wall',
    'a floating island drifting through a cotton-candy sky',
    'a tiny cottage at the edge of a sparkling frozen lake',
    'a sun-dappled meadow full of wildflowers and buzzing bees',
    'a colorful neighborhood where every house tells a story',
    'a moonlit bamboo forest filled with glowing lanterns',
    'a cozy underground burrow with round windows and warm hearths',
    'a rainbow bridge connecting two friendly hilltop villages'
];

const EMOTIONAL_TONES = [
    'gently humorous and playful — with moments that make you giggle',
    'tender and poetic — like being wrapped in a warm blanket',
    'wonder-filled and awe-inspiring — everything feels magical and new',
    'brave and triumphant — a little heart swelling with courage',
    'cozy and comforting — like hot cocoa on a rainy afternoon',
    'curious and whimsical — full of delightful surprises'
];

const TIMES_OF_DAY = [
    'sunrise, with the world waking up in peach and gold',
    'a bright, sparkly mid-morning',
    'a lazy, golden afternoon',
    'the magical hour just before sunset when everything glows',
    'a gentle twilight painted in lavender and rose',
    'a starry, moonlit night full of quiet wonder'
];

const WEATHER_MOODS = [
    'a perfect warm day with puffy clouds drifting by',
    'a light, sparkling rain that makes everything shimmer',
    'the first crisp morning of autumn with swirling colorful leaves',
    'soft snowflakes falling like tiny stars',
    'a warm breeze carrying the scent of flowers',
    'a spectacular rainbow arching across the sky after a gentle shower'
];

/**
 * Pick a random element from an array.
 */
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a unique "Story DNA" — random combination of setting, tone, time, weather.
 */
function generateStoryDNA() {
    return {
        setting: pickRandom(STORY_SETTINGS),
        tone: pickRandom(EMOTIONAL_TONES),
        timeOfDay: pickRandom(TIMES_OF_DAY),
        weather: pickRandom(WEATHER_MOODS)
    };
}

// ─────────────────────────────────────────────────────────────
// STORY ARCHETYPES — 12 unique narrative structures
// ─────────────────────────────────────────────────────────────

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
    },
    // ──── NEW ARCHETYPES (7-12) ────
    {
        name: 'Tiny Hero',
        beats: [
            'CHILD discovers a very small creature (a ladybug, a baby bird, a tiny fairy) in trouble — trapped, scared, or lost. CHILD kneels down gently, heart full of concern.',
            'CHILD decides to help. The rescue mission begins — gathering supplies, building a tiny shelter, or clearing a path. Show CHILD being resourceful and tender.',
            'Things get complicated: the creature is more frightened than expected, or an obstacle blocks the way. CHILD must be patient, gentle, and creative.',
            'With a whispered encouragement and one last clever idea, CHILD succeeds! The tiny creature is safe. They share a magical moment of gratitude — perhaps a chirp, a glow, or a tiny nuzzle.',
            'CHILD watches the creature return to its home, feeling an enormous warmth inside. They realize that even the smallest act of kindness can be the biggest adventure of all.'
        ]
    },
    {
        name: 'Dream Journey',
        beats: [
            'CHILD falls asleep in a cozy, safe place — and the dream begins. The world slowly transforms: walls dissolve into waterfalls, the ceiling becomes a sky full of swirling colors.',
            'In the dream world, something impossible and wonderful happens — CHILD can fly, or talk to the clouds, or paint with starlight. Describe the pure surreal joy.',
            'The dream shifts — a puzzle or a riddle appears in a strange, beautiful form. CHILD must use their imagination and something from their waking life to solve it.',
            'CHILD unlocks something spectacular in the dream: a door opens to a sky full of music, a sleeping dragon smiles, or a garden blooms from nothing. Cinematic magic.',
            'CHILD wakes up smiling, hugging their pillow. Was it just a dream? But then they notice something — a tiny, impossible token left behind. The magic was real after all.'
        ]
    },
    {
        name: 'Season\'s Gift',
        beats: [
            'A new season is arriving — describe the world transforming through CHILD\'s senses. The smell of the air, the color of the light, the feeling on their skin. Everything is changing.',
            'CHILD finds a gift from the season: the first snowflake, a perfect autumn leaf, the first flower of spring, or a firefly at the start of summer. They hold it like treasure.',
            'CHILD wants to share this seasonal wonder with someone — a friend, a grandparent, a sibling. But the gift is fragile: it might melt, blow away, or fade.',
            'CHILD comes up with a creative, heartfelt way to preserve or share the moment — drawing it, singing about it, creating a little ceremony. The gesture is deeply personal.',
            'The season settles in fully. CHILD sits with their loved one, surrounded by the beauty of the changed world. The real gift wasn\'t the leaf or snowflake — it was the moment they shared.'
        ]
    },
    {
        name: 'Lost & Found',
        beats: [
            'Something precious to CHILD has gone missing — not just any object, but something deeply meaningful (a special stone, a drawing, a gift from someone they love). Show the pang of loss.',
            'CHILD retraces their steps, visiting familiar places that now look different through searching eyes. Each place holds a memory. Show the emotional journey, not just the physical one.',
            'The search leads CHILD somewhere unexpected — they discover something new and surprising along the way. A beautiful distraction that almost makes them forget what they were looking for.',
            'CHILD finds the lost item — in a place that makes perfect poetic sense. The reunion with the object is emotional and sweet. Maybe the object was "waiting" for them.',
            'CHILD realizes the journey itself was the real treasure. They hold the found object close, but they also carry all the wonderful things they discovered while searching. End with a deep, contented sigh.'
        ]
    },
    {
        name: 'The Invitation',
        beats: [
            'CHILD receives a mysterious, beautiful invitation — a folded note under a door, a message in a bottle, a whisper from the wind. Where does it lead? Excitement and curiosity build.',
            'CHILD follows the invitation to a place being prepared for something special — lanterns being hung, tables being set, music rehearsing. Who is behind all this?',
            'Preparations need help! Something isn\'t ready, and CHILD volunteers to use their special talents. Show them joyfully contributing — decorating, cooking, performing, problem-solving.',
            'The event begins — and it\'s more magical than CHILD imagined. A feast, a dance, a concert, a celebration of something meaningful. CHILD is at the center, glowing with belonging.',
            'As the event winds down, the host reveals a secret: the whole celebration was for CHILD — to thank them for being exactly who they are. Tears of joy. Pure, radiant warmth.'
        ]
    },
    {
        name: 'Upside-Down Day',
        beats: [
            'CHILD wakes up to discover that everything is hilariously, wonderfully wrong — breakfast is on the ceiling, the dog is speaking French, shoes are on hands. CHILD giggles uncontrollably.',
            'CHILD explores the upside-down world. Rules are reversed: bedtime is in the morning, dinner is dessert first, and homework is playing. Show the giddy, silly delight.',
            'But the topsy-turvy world has a gentle problem: someone (a friend, a pet, a neighbor) is confused or upset by all the changes. They need help understanding the new rules.',
            'CHILD uses their real-world knowledge combined with upside-down logic to help. The solution is creative, funny, and surprisingly wise for such a little person.',
            'The world slowly rights itself again — but one tiny, delightful thing stays upside-down as a souvenir. CHILD laughs, realizing that a little bit of silliness makes the ordinary world sparkle.'
        ]
    }
];

// ─────────────────────────────────────────────────────────────
// BANNED PHRASES — Generic language the AI must never use
// ─────────────────────────────────────────────────────────────

const BANNED_PHRASES = [
    'is getting ready', 'arrives at', 'is doing great', 'is so proud',
    'what a day', 'all done', 'big day', 'goes to', 'decides to',
    'learns a lesson', 'has a great time', 'and they lived', 'the end',
    'once upon a time', 'happily ever after', 'and so ', 'it was time to',
    'had so much fun', 'was very happy', 'was so excited', 'feeling proud',
    'learned that', 'what an adventure', 'time for bed', 'ready for',
    'based on', 'theme:', 'moral:'
];

/**
 * Validate a single caption for quality.
 * Returns true if the caption passes quality checks.
 */
function validateCaption(caption) {
    if (!caption || typeof caption !== 'string') return false;
    if (caption.trim().length < 40) return false;

    const lower = caption.toLowerCase();
    for (const phrase of BANNED_PHRASES) {
        if (lower.includes(phrase)) return false;
    }

    return true;
}

/**
 * Validate the entire story outline for quality.
 * Returns the cleaned outline if valid, or null if it needs regeneration.
 */
function validateOutline(outline) {
    if (!Array.isArray(outline) || outline.length === 0) return null;

    let passCount = 0;
    for (const page of outline) {
        if (!page.caption || !page.sceneDescription) return null;
        if (validateCaption(page.caption)) passCount++;
    }

    // At least 60% of captions must pass (allows 1-2 weak ones)
    return (passCount / outline.length) >= 0.6 ? outline : null;
}

/**
 * Generate a story outline using Gemini text generation.
 * Uses random story archetypes + Story DNA for maximum diversity.
 * Tries multiple models as fallback if one is rate-limited.
 */
async function generateStoryOutline(childName, scenario, comfortObject, apiKey, theme) {
    const totalPages = 5;
    if (!apiKey) {
        console.log('[NeuralNarrative] GEMINI_API_KEY not set, using default story outline');
        return getDefaultOutline(childName, scenario, comfortObject, theme);
    }

    // Pick a random story archetype for structural variety
    const archetype = pickRandom(STORY_ARCHETYPES);
    const storyDNA = generateStoryDNA();
    const uniqueSeed = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

    console.log(`[NeuralNarrative] Story DNA: archetype="${archetype.name}", setting="${storyDNA.setting.substring(0, 40)}...", tone="${storyDNA.tone.substring(0, 30)}..." (seed: ${uniqueSeed})`);

    // Build dynamic page structure from the chosen archetype
    const pageInstructions = archetype.beats.map((beat, i) => {
        return `Page ${i + 1}: ${beat.replace(/CHILD/g, childName)}`;
    }).join('\n');

    const prompt = `You are a world-renowned children's picture book author — imagine the love of Mo Willems, the poetry of Oliver Jeffers, and the warmth of Miyazaki, all in one voice.

Your task: Write a stunning, one-of-a-kind ${totalPages}-page picture book story that a child will BEG to hear again.

═══════════════════════════════════════
THE CHILD (your main character):
═══════════════════════════════════════
- Name: ${childName}
- Loves: ${scenario}
- Comfort item or hero: ${comfortObject || 'their own imagination and inner courage'}
${theme ? `- Story theme/lesson: ${theme}` : '- Theme: Choose a meaningful, age-appropriate theme that fits naturally'}

═══════════════════════════════════════
STORY DNA (use ALL of these):
═══════════════════════════════════════
- Narrative Arc: "${archetype.name}"
- Setting: ${storyDNA.setting}
- Emotional Tone: ${storyDNA.tone}
- Time of Day: ${storyDNA.timeOfDay}
- Weather/Atmosphere: ${storyDNA.weather}
- Uniqueness Seed: ${uniqueSeed}

═══════════════════════════════════════
STORY BLUEPRINT ("${archetype.name}" arc):
═══════════════════════════════════════
${pageInstructions}

═══════════════════════════════════════
CAPTION QUALITY EXAMPLES (match this level):
═══════════════════════════════════════

EXAMPLE 1 (lyrical wonder):
"The wind carried a whisper only ${childName} could hear — soft as dandelion fluff, warm as a grandmother's laugh. ${childName} pressed an ear to the old willow tree and grinned. 'I knew you had a secret,' ${childName} said."

EXAMPLE 2 (sensory immersion):
"The puddle wasn't just a puddle. It sparkled with tiny galaxies — swirling purples and blues that smelled like rain and birthday cake. ${childName} dipped one finger in and the whole world rippled."

EXAMPLE 3 (emotional resonance):
"${childName}'s heart felt too big for such a small chest. The baby bird looked up with eyes like black dewdrops, and something inside ${childName} whispered: you were made for this moment."

═══════════════════════════════════════
WRITING RULES — FOLLOW EXACTLY:
═══════════════════════════════════════
1. UNIQUENESS IS PARAMOUNT. Make THIS story feel like it has never existed before. The setting, characters met, specific events, and emotional moments must be fresh and specific.
2. Write REAL picture book captions — lyrical, rhythmic, evocative prose. Each caption MUST be 2–3 rich sentences that a parent would LOVE reading aloud. Use varied sentence structures.
3. Weave ${childName}'s interests (${scenario}) organically into the plot — NOT as a checklist but as meaningful story elements that drive the action.
4. BANNED PHRASES (never use these): "is getting ready", "arrives at", "is doing great", "is so proud", "what a day", "all done", "big day", "goes to", "decides to", "has a great time", "learned that", "what an adventure", "once upon a time", "happily ever after", "was so excited", "was very happy", "time for bed".
5. NEVER use meta-commentary: no "Based on", "Theme:", "Moral:", or breaking the fourth wall.
6. Each caption MUST: (a) advance the plot, (b) convey a specific emotion through sensory language, (c) contain at least one vivid image or sensory detail.
7. Include at least 2 lines of simple, natural dialogue from ${childName} spread across the ${totalPages} pages. Dialogue should reveal character.
8. Give the story a SPECIFIC, CONCRETE setting using the Story DNA above — describe unique visual details of this world.
9. The story MUST have a meaningful emotional arc: not just "fun things happen" but a genuine journey of feeling.

═══════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════
For each page, provide:
- "caption": The actual storybook text (2–3 vivid, emotionally resonant sentences that match the quality of the examples above).
- "sceneDescription": A detailed, cinematic visual description for an illustrator (specify: setting details, character pose/expression, lighting quality, color palette, time of day, atmosphere, and key objects in the scene).
- "storyTitle": (FIRST PAGE ONLY) A charming, unique title for this story (e.g., "${childName} and the Whispering Willows" or "The Night ${childName} Painted the Sky").

Return ONLY a JSON array of ${totalPages} objects. No markdown, no commentary, no code fences.`;

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 3000,
            topP: 0.95,
            topK: 64
        }
    };

    // Try each text model in order, with up to 2 attempts per model
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
                const validated = validateOutline(outline);
                if (!validated) {
                    console.warn('[NeuralNarrative] Outline failed quality validation, using default');
                    return getDefaultOutline(childName, scenario, comfortObject, theme);
                }
                console.log(`[NeuralNarrative] Story outline generated successfully with ${model} — title: "${validated[0]?.storyTitle || 'untitled'}"`);
                return validated.slice(0, totalPages);
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
 * 4 distinctive variants for variety even in fallback mode.
 */
function getDefaultOutline(childName, scenario, comfortObject, theme) {
    const interests = scenario.split(',').map(s => s.trim()).filter(Boolean);
    const mainInterest = interests[0] || 'adventure';
    const secondInterest = interests[1] || 'discovery';
    const comfortItem = comfortObject || 'a warm, glowing feeling inside';
    const storyTheme = theme || 'discovering something wonderful';

    const variants = [
        // ── Variant 1: Magical Garden Discovery ──
        [
            {
                storyTitle: `${childName} and the Singing Garden`,
                caption: `The morning sun painted ${childName}'s room in stripes of gold, and today felt different — like the air itself was humming with a secret. "Something amazing is going to happen," ${childName} whispered, pressing a palm flat against the warm window glass.`,
                sceneDescription: `A child's cozy bedroom bathed in warm golden morning light streaming through curtains. The child sits up in bed with wide, excited eyes and a gentle smile. Warm color palette — amber, soft peach, cream. Plush toys and drawings on the walls. Dust motes float in the light beams.`
            },
            {
                caption: `And there it was — tucked behind the old oak tree in the garden — a doorway woven entirely from wild roses and morning glory, humming with a light the color of ${mainInterest}. ${childName} clutched ${comfortItem} tight and took one brave, deep breath.`,
                sceneDescription: `A magical doorway made of intertwined flowers and vines at the base of a grand oak tree in a lush garden. The child stands before it, holding their comfort object, face lit with wonder and determination. Ethereal golden-green light spills from the doorway. Butterflies circle the entrance. Warm, enchanting atmosphere.`
            },
            {
                caption: `Inside, the world was made of ${secondInterest} and starlight. Flowers sang tiny melodies — not with words, but with colors that drifted upward like soap bubbles. The path ahead sparkled as if it had been waiting, patiently, just for ${childName}.`,
                sceneDescription: `A breathtaking fantasy landscape — rolling hills of soft pastel colors, bioluminescent flowers glowing in varied hues, a sparkling winding path. The child walks forward with arms slightly outstretched in wonder. Warm, dreamy lighting with soft bokeh effects. Floating color-bubbles rise from singing flowers.`
            },
            {
                caption: `"I can do this," ${childName} said, and the words felt like magic of their own — warm and golden, spilling from lips to fingertips. With steady hands and an even steadier heart, ${childName} reached for the flower at the center of everything — and the whole garden held its breath.`,
                sceneDescription: `A dramatic, heroic moment: the child reaching upward toward a magnificent glowing flower at the center of a ring of singing plants. Dynamic pose, confident expression, one hand extended. Warm spotlighting from above, rich saturated colors — coral, teal, amber. Golden sparkle effects around the child's hands.`
            },
            {
                caption: `The stars themselves seemed to lean closer as ${childName} walked home through the twilight, one small petal tucked safely in a pocket, its glow warming everything it touched. Some adventures change you forever — and this gentle, singing one was the very best kind.`,
                sceneDescription: `The child walking along a beautiful twilight path toward a warmly-lit home in the distance. Stars twinkling above, fireflies swirling around, a content peaceful smile on the child's face. A faint glow comes from their pocket. Rich purple-blue sky with warm orange window-light. Cinematic wide shot.`
            }
        ],
        // ── Variant 2: Ocean Friendship ──
        [
            {
                storyTitle: `${childName} and the Tide Pool Secret`,
                caption: `The tide had left a gift — a hundred tiny mirrors reflecting a hundred tiny skies, all right there at ${childName}'s feet. "Hello?" ${childName} whispered into the closest pool, and something sparkled beneath the surface.`,
                sceneDescription: `A child kneeling by a cluster of colorful tide pools at a rocky beach during golden hour. Warm sunset light makes the water pools glow like gems — turquoise, coral, amber. The child leans in with curiosity. Scattered seashells, starfish, and sea glass. Gentle waves in the background.`
            },
            {
                caption: `A tiny seahorse, no bigger than ${childName}'s thumb, swirled up from the water wearing what looked remarkably like a smile. Its scales shimmered with every color ${childName} had ever loved — especially the blues of ${mainInterest}.`,
                sceneDescription: `Close-up of the child's amazed face reflected in a tide pool, with a tiny glowing seahorse surfacing. The seahorse shimmers with rainbow iridescence. Warm golden light catches the water droplets. The child's eyes are wide with wonder and delight. Coral and turquoise color palette.`
            },
            {
                caption: `But the seahorse was circling frantically — its tiny coral home had tumbled in the last big wave, scattered like puzzle pieces across the rocks. ${childName} looked at those pleading little eyes and felt a tug deeper than any tide.`,
                sceneDescription: `The child looking with concern at scattered coral pieces across wet rocks. The tiny seahorse hovers nearby, looking distressed. Warm but slightly worried atmosphere. Golden hour light with touches of blue shadow. The child begins gathering coral pieces carefully with both hands.`
            },
            {
                caption: `stone by stone, shell by shell, ${childName} rebuilt the tiny house — adding a seaglass window because even seahorses deserve to watch the sunset. "There," ${childName} breathed. "Even better than before."`,
                sceneDescription: `The child carefully placing the last piece on a beautiful rebuilt coral structure decorated with colorful sea glass. The seahorse watches with joy. Warm golden sunset light. The tiny coral home now has a small sea-glass window that catches the light like a prism. Pride and tenderness on the child's face.`
            },
            {
                caption: `As the tide came whispering back in, the seahorse did three perfect somersaults — its way of saying something that didn't need words at all. Walking home with salt on their cheeks and sand between their toes, ${childName} carried the biggest feeling in the smallest heart.`,
                sceneDescription: `Split scene: the seahorse doing joyful loops in rising water in one area, while the child walks along the beach toward home in warm evening light, carrying their shoes, smiling peacefully. Warm pink-orange-purple sunset. Footprints trailing behind in the wet sand. Cinematic, emotional wide shot.`
            }
        ],
        // ── Variant 3: Starlight Dream ──
        [
            {
                storyTitle: `The Night ${childName} Caught a Star`,
                caption: `${childName}'s pillow still held the warmth of a thousand goodnight kisses when the ceiling quietly dissolved into sky. Not the regular sky — this one had stars you could almost reach out and hold, pulsing gently, like they were breathing.`,
                sceneDescription: `A child lying in bed as the bedroom ceiling magically transforms into a vast, star-filled night sky. Stars are large, warm, and softly pulsing with golden-white light. The child reaches upward from their bed with awe. Cozy bedroom below transitions seamlessly into cosmic wonder above. Deep indigo-blue and warm gold color palette.`
            },
            {
                caption: `One star drifted lower, close enough for ${childName} to feel its warmth — like a tiny sun the size of a plum. It hummed a little tune that somehow smelled like ${mainInterest} and tasted like laughter.`,
                sceneDescription: `A small, warm, golden star floating down gently toward the child's outstretched hand. The star emits soft concentric rings of warm light. The child is now floating slightly above their bed, smiling in wonder. Warm amber glow illuminates their face. Dreamy, magical atmosphere with tiny sparkles surrounding them.`
            },
            {
                caption: `But the little star flickered — its light stuttering like a candle in wind. It had traveled too far from its constellation family and was growing dim. "Don't worry," ${childName} murmured, cupping the star gently. "I'll help you find your way home."`,
                sceneDescription: `The child gently cradling a small flickering star in cupped hands. Concern and determination on their face. They float through a dreamy cosmic landscape — nebula clouds in soft purples and pinks, distant constellation patterns visible. The star's light pulses weakly. Tender, emotional lighting.`
            },
            {
                caption: `${childName} reached up, up, up — standing on tiptoes on a moonbeam — and placed the star right where the empty space had been aching. The constellation blazed to life, and for one breathless moment, the entire sky applauded in light.`,
                sceneDescription: `Dramatic, cinematic moment: the child standing on a beam of moonlight, reaching up to place the star into its constellation. The completed constellation bursts into brilliant, warm light. Cascading sparkles rain down. The child's face glows with joy and triumph. Deep blue sky with warm golden starbursts. Epic scale.`
            },
            {
                caption: `${childName} woke up to ordinary morning light — warm, golden, lovely. But there, on the windowsill, sat a tiny crystal that hadn't been there before, catching the sun and throwing rainbows across the ceiling. Some gifts are too wonderful to be only dreams.`,
                sceneDescription: `Morning bedroom scene: warm sunlight streaming through the window. On the windowsill sits a small, beautiful crystal/gem that casts rainbow prisms across the white ceiling and walls. The child sits up in bed, eyes wide with delighted recognition, hugging their pillow. Warm, cozy, magical-mundane atmosphere. Soft peach and gold tones.`
            }
        ],
        // ── Variant 4: Autumn Kindness ──
        [
            {
                storyTitle: `${childName}'s Leaf of Many Colors`,
                caption: `The first leaf of autumn landed right on ${childName}'s nose — perfectly, like it had been aiming. It was the most impossible color: not quite red, not quite gold, but something in between that made ${childName}'s chest feel fizzy.`,
                sceneDescription: `A child in a park or garden, head tilted up with a colorful autumn leaf resting on their nose. Surprise and delight on their face. Trees behind them are ablaze with fall colors — amber, crimson, rust, gold. Warm afternoon light with leaves gently falling. Cozy sweater, scattered leaves on the ground.`
            },
            {
                caption: `${childName} wanted Grandma to see it — she always said autumn leaves were "Earth's way of showing off." But the leaf was already curling at the edges, its colors slowly fading like a sunset you can't quite hold onto. "I need to hurry," ${childName} said.`,
                sceneDescription: `The child carefully carrying the beautiful leaf in both hands, walking with purpose through a tree-lined path. The leaf glows with ember-like warmth. Wind swirls more leaves around them. Determination and tenderness on their face. Warm golden-amber light filtering through the canopy. Rich autumn color palette.`
            },
            {
                caption: `Along the way, ${childName} found three other treasures hiding in the fallen leaves — a perfect acorn wearing a tiny cap, a feather striped like a sunset, and a stone as smooth as a wish. Each one whispered ${secondInterest} in its own quiet way.`,
                sceneDescription: `The child crouching down to examine small treasures among colorful fallen leaves: an acorn, a striped feather, a smooth stone. Close-up showing the child's gentle, curious hands. Warm dappled light through trees. Each object seems to glow slightly. Rich autumn textures — crunchy leaves, soft moss, smooth bark.`
            },
            {
                caption: `${childName} spread everything out on Grandma's kitchen table and made something nobody had ever made before — a tiny autumn portrait, with the leaf as a sun and the feather as a tree and the acorn as a person who looked, if you squinted, just like Grandma.`,
                sceneDescription: `A warm kitchen table scene: the child arranging natural objects into a charming art piece while an elderly woman watches with a hand over her heart, deeply moved. Warm kitchen light, a cup of tea nearby, lace curtains. The "portrait" on the table is inventive and childlike-beautiful. Rich, cozy interior atmosphere.`
            },
            {
                caption: `Grandma didn't say anything for a long moment. She just pulled ${childName} into a hug that smelled like cinnamon and felt like the warmest blanket in the entire universe. Outside, the trees kept showing off — but nothing was more beautiful than this.`,
                sceneDescription: `An emotional embrace between the child and grandmother in the warm kitchen. Through the window behind them, a spectacular autumn landscape glows in late afternoon light. The grandmother has tears of joy. The child is nestled close. Warm amber-cinnamon color tones. Soft, glowing, emotionally resonant lighting. The leaf portrait visible on the table.`
            }
        ]
    ];

    return pickRandom(variants);
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

    // Extract the story title from the first page (AI-generated or fallback)
    const storyTitle = outline[0]?.storyTitle || `${childName}'s Big Adventure`;
    console.log(`[NeuralNarrative] Story title: "${storyTitle}"`);

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

    // Attach the story title to the first page for the frontend
    if (pages.length > 0) {
        pages[0].storyTitle = storyTitle;
    }

    return pages;
}

module.exports = {
    generateStorybook,
    generateStoryOutline,
    generateImage
};
