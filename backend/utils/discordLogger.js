const https = require('https');

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1478666485210546259/c_cNMakzzozGQUzixMCc-huPrCL82NkxgZX_THmSnAy1_n6Zu6Cp17xkI2hlqSfV70Pq';

// Store original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Queue and rate-limiting to avoid Discord rate limits
let messageQueue = [];
let isSending = false;

function sendToDiscord(content) {
    // Discord embeds have a 4096 char limit; content field has 2000 char limit
    // Truncate if too long
    if (content.length > 1900) {
        content = content.substring(0, 1900) + '\n... (truncated)';
    }

    messageQueue.push(content);
    processQueue();
}

function processQueue() {
    if (isSending || messageQueue.length === 0) return;
    isSending = true;

    // Batch messages together (up to 1900 chars total)
    let batch = '';
    while (messageQueue.length > 0) {
        const next = messageQueue[0];
        if (batch.length + next.length + 1 > 1900) break;
        batch += (batch ? '\n' : '') + messageQueue.shift();
    }

    if (!batch) {
        // Single message too long, just take it
        batch = messageQueue.shift();
    }

    const payload = JSON.stringify({ content: '```\n' + batch + '\n```' });

    const url = new URL(DISCORD_WEBHOOK_URL);
    const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
        },
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            isSending = false;
            // If rate-limited, wait and retry
            if (res.statusCode === 429) {
                try {
                    const parsed = JSON.parse(data);
                    const retryAfter = (parsed.retry_after || 1) * 1000;
                    setTimeout(() => processQueue(), retryAfter);
                } catch {
                    setTimeout(() => processQueue(), 2000);
                }
            } else {
                // Process next batch after a small delay to avoid rate limits
                if (messageQueue.length > 0) {
                    setTimeout(() => processQueue(), 500);
                }
            }
        });
    });

    req.on('error', () => {
        // Silently fail — don't break the app if Discord is unreachable
        isSending = false;
        if (messageQueue.length > 0) {
            setTimeout(() => processQueue(), 5000);
        }
    });

    req.write(payload);
    req.end();
}

function formatArgs(args) {
    return args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
}

// Override console.log
console.log = function (...args) {
    originalLog.apply(console, args);
    const message = formatArgs(args);
    sendToDiscord(`[LOG] ${message}`);
};

// Override console.error
console.error = function (...args) {
    originalError.apply(console, args);
    const message = formatArgs(args);
    sendToDiscord(`[ERROR] ${message}`);
};

// Override console.warn
console.warn = function (...args) {
    originalWarn.apply(console, args);
    const message = formatArgs(args);
    sendToDiscord(`[WARN] ${message}`);
};

originalLog('[DiscordLogger] Discord webhook logging enabled');
sendToDiscord('[DiscordLogger] 🟢 Server logging started at ' + new Date().toISOString());

module.exports = { sendToDiscord };
