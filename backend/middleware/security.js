/**
 * Audit Logging Middleware
 * Logs sensitive operations for security and compliance
 */

// Audit log levels
const AUDIT_LEVELS = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL'
};

// Operations to audit
const AUDIT_OPERATIONS = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    OTP_REQUEST: 'OTP_REQUEST',
    OTP_VERIFY: 'OTP_VERIFY',
    PATIENT_CREATE: 'PATIENT_CREATE',
    PATIENT_UPDATE: 'PATIENT_UPDATE',
    PATIENT_DELETE: 'PATIENT_DELETE',
    BOOKING_CREATE: 'BOOKING_CREATE',
    BOOKING_CANCEL: 'BOOKING_CANCEL',
    SESSION_COMPLETE: 'SESSION_COMPLETE',
    ASSESSMENT_CREATE: 'ASSESSMENT_CREATE',
    ASSESSMENT_COMPLETE: 'ASSESSMENT_COMPLETE',
    THERAPIST_CREATE: 'THERAPIST_CREATE',
    THERAPIST_UPDATE: 'THERAPIST_UPDATE',
    ADMIN_ACTION: 'ADMIN_ACTION'
};

/**
 * Create an audit log entry
 */
const createAuditLog = (operation, userId, details, level = AUDIT_LEVELS.INFO) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        operation,
        userId,
        details,
        ip: details.ip || 'unknown'
    };

    // In production, this could write to a database or external logging service
    // For now, we log to console with structured format
    console.log('[AUDIT]', JSON.stringify(logEntry));

    return logEntry;
};

/**
 * Middleware to automatically log requests to sensitive endpoints
 */
const auditMiddleware = (operation, level = AUDIT_LEVELS.INFO) => {
    return (req, res, next) => {
        // Store original end function
        const originalEnd = res.end;

        // Override end to capture response
        res.end = function (...args) {
            // Log after response is sent
            const userId = req.user?.userId || req.body?.specialId || 'anonymous';

            createAuditLog(operation, userId, {
                method: req.method,
                path: req.path,
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
                userAgent: req.headers['user-agent'],
                statusCode: res.statusCode,
                success: res.statusCode < 400
            }, level);

            // Call original end
            originalEnd.apply(res, args);
        };

        next();
    };
};

/**
 * HTTPS enforcement middleware for production
 */
const enforceHttps = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // Check for forwarded protocol (common with proxies/load balancers)
        const proto = req.headers['x-forwarded-proto'];

        if (proto && proto !== 'https') {
            return res.redirect(301, `https://${req.hostname}${req.url}`);
        }
    }
    next();
};

/**
 * Security headers middleware (additional to helmet)
 */
const securityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    next();
};

module.exports = {
    createAuditLog,
    auditMiddleware,
    enforceHttps,
    securityHeaders,
    AUDIT_LEVELS,
    AUDIT_OPERATIONS
};
