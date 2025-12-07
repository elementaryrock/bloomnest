// Custom error classes for the Therapy Booking System

// Base Application Error
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Validation Error (400)
class ValidationError extends AppError {
    constructor(message = 'Invalid input data', details = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

// Authentication Error (401)
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', code = 'AUTHENTICATION_ERROR') {
        super(message, 401, code);
    }
}

// Authorization Error (403)
class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

// Not Found Error (404)
class NotFoundError extends AppError {
    constructor(resource = 'Resource', message = null) {
        super(message || `${resource} not found`, 404, 'NOT_FOUND');
        this.resource = resource;
    }
}

// Conflict Error (409)
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

// Rate Limit Error (429)
class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

// Business Logic Error (422)
class BusinessError extends AppError {
    constructor(message, code = 'BUSINESS_ERROR') {
        super(message, 422, code);
    }
}

// Database Error (500)
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    BusinessError,
    DatabaseError
};
