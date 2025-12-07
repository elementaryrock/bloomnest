const { validationResult } = require('express-validator');
const { ValidationError } = require('./errors');

/**
 * Middleware to validate request using express-validator rules
 * This centralizes validation error handling across all routes
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value
        }));

        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: formattedErrors
            }
        });
    }

    next();
};

/**
 * Middleware wrapper for async route handlers
 * Catches errors and passes them to the global error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    validate,
    asyncHandler
};
