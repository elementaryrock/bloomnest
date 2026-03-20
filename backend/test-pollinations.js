require('dotenv').config();
process.env.POLLINATIONS_API_KEY = ''; // Bypass the key for testing
const pollinations = require('./services/imageProviders/pollinationsProvider');

async function test() {
    console.log('Testing Pollinations directly...');
    try {
        const result = await pollinations.generateImage('A cute cat');
        console.log('Success!');
        console.log('Mime:', result.mimeType);
        console.log('Base64 length:', result.base64.length);
    } catch (e) {
        console.error('Failed:', e);
    }
}

test();
