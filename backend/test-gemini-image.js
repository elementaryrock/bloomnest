require('dotenv').config();
const aiHorde = require('./services/imageProviders/aiHordeProvider');

async function test() {
    console.log('Testing AI Horde...');
    try {
        const result = await aiHorde.generateImage('A cute cat sitting on a pillow, cartoon style');
        console.log('SUCCESS!');
        console.log('mimeType:', result.mimeType);
        console.log('base64 length:', result.base64.length);
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}

test();
