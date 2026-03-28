require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudflareProvider = require('./services/imageProviders/cloudflareProvider');

async function runTest() {
    try {
        console.log('Testing Cloudflare Worker Image Generation...');
        
        if (!cloudflareProvider.isConfigured()) {
            console.error('Error: CLOUDFLARE_WORKERS_TOKEN is missing or invalid in your .env file');
            process.exit(1);
        }

        const testPrompt = "Style: Breathtakingly colorful, warm, and delightful modern cartoon storybook art with rich saturated colors. Use warm peachy, coral, blue, green, and pink tones. CRITICAL: The image MUST feature extremely vibrant, bright, dazzling colors with warm lighting. Rich color palette with warm browns, peachy oranges, sky blues, and warm yellows. IMPORTANT: Fully render with rich, saturated, eye-catching, and vivid colors that children adore. Include cozy home elements and warm atmospheric details. NEGATIVE PROMPT: ABSOLUTELY NO black and white, grayscale, monochrome, dull, muted, or pale images. Avoid sepia tones and washed-out colors. The child should look happy, brave, and confident with warm, friendly facial expressions. Do NOT include any text or words in the image. Focus on emotional warmth and visual richness.";
        
        console.log('Sending prompt to Cloudflare Workers AI...');
        
        const result = await cloudflareProvider.generateImage(testPrompt);
        
        if (result && result.base64) {
            const imageBuffer = Buffer.from(result.base64, 'base64');
            const outputPath = path.join(__dirname, 'cloudflare-test-output.png');
            
            fs.writeFileSync(outputPath, imageBuffer);
            console.log(`\n✅ Success! Image saved locally to: ${outputPath}`);
        } else {
            console.error('❌ Failed to extract base64 data from response.');
        }
    } catch (error) {
        console.error('\n❌ Test completely failed:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

runTest();
