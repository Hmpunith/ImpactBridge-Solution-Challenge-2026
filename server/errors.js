/**
 * @fileoverview Custom Error classes for ImpactBridge.
 * Enterprise-grade error hierarchy with typed status codes and error codes.
 *
 * @module errors
 * @version 1.0.0
 */

/**
 * Base application error with HTTP status code and error code.
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [code='INTERNAL_ERROR'] - Machine-readable error code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

/** @extends AppError */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/** @extends AppError */
export class AIServiceError extends AppError {
  constructor(message) {
    super(message, 502, 'AI_SERVICE_ERROR');
  }
}

/** @extends AppError */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}
