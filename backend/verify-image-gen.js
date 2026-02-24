/**
 * Verification script for Multi-Provider Image Generation
 * Run with: node verify-image-gen.js
 */

require('dotenv').config();
const { generateImageWithFallback } = require('./services/imageProviders');

async function testGeneration() {
    console.log('--- NeuralNarrative Image Generation Test ---');
    console.log('Testing setup:');
    console.log('- IMAGE_PROVIDER:', process.env.IMAGE_PROVIDER || 'pollinations (default)');
    console.log('- Cloudflare Configured:', !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_TOKEN));
    console.log('- Imagen Configured:', !!process.env.GEMINI_API_KEY);
    console.log('-------------------------------------------');

    const prompt = "A cheerful child sitting at a dentist's office, smiling bravely. Cartoon style, bright colors.";

    try {
        console.log('\n--- SINGLE IMAGE TEST ---');
        const startTime = Date.now();
        console.log('Sending prompt to orchestrator...');

        const result = await generateImageWithFallback(prompt);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n✅ Success!');
        console.log(`- Provider used: ${result.provider}`);
        console.log(`- Mime Type: ${result.mimeType}`);
        console.log(`- Base64 Length: ${result.base64.length}`);
        console.log(`- Time taken: ${duration}s`);

        // Test parallel generation
        console.log('\nStarting parallel test (3 images)...');
        const parallelStart = Date.now();

        const promises = [
            generateImageWithFallback(prompt + " (Image 1)"),
            generateImageWithFallback(prompt + " (Image 2)"),
            generateImageWithFallback(prompt + " (Image 3)")
        ];

        const results = await Promise.allSettled(promises);

        const parallelDuration = ((Date.now() - parallelStart) / 1000).toFixed(2);
        console.log(`\nParallel Results (${parallelDuration}s):`);
        results.forEach((res, i) => {
            if (res.status === 'fulfilled') {
                console.log(`- Image ${i + 1}: SUCCESS (Provider: ${res.value.provider})`);
            } else {
                console.log(`- Image ${i + 1}: FAILED (${res.reason.message})`);
            }
        });

    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error(error.message);
    }
}

testGeneration();
