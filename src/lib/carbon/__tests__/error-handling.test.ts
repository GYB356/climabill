import { createServiceError, ErrorType, safeServiceOperation, logServiceError } from '../error-handling';

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleLog = console.log;

describe('Error Handling System', () => {
  beforeEach(() => {
    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
    console.log = originalConsoleLog;
  });

  describe('createServiceError', () => {
    it('should return the error if it is already a ServiceError', () => {
      const serviceError = { 
        type: ErrorType.API_ERROR, 
        message: 'API error occurred' 
      };
      
      const result = createServiceError(serviceError);
      expect(result).toEqual(serviceError);
    });

    it('should convert Error instances to appropriate error types', () => {
      // Network error
      const networkError = new Error('Network connection failed');
      networkError.name = 'NetworkError';
      
      const result1 = createServiceError(networkError);
      expect(result1.type).toBe(ErrorType.NETWORK_ERROR);
      
      // Timeout error
      const timeoutError = new Error('Request timed out');
      timeoutError.name = 'TimeoutError';
      
      const result2 = createServiceError(timeoutError);
      expect(result2.type).toBe(ErrorType.TIMEOUT);
      
      // Generic error
      const genericError = new Error('Something went wrong');
      
      const result3 = createServiceError(genericError);
      expect(result3.type).toBe(ErrorType.UNEXPECTED);
      expect(result3.message).toBe('Something went wrong');
    });

    it('should handle HTTP response errors with appropriate types', () => {
      const httpErrors = [
        { status: 400, expected: ErrorType.VALIDATION_ERROR },
        { status: 401, expected: ErrorType.UNAUTHORIZED },
        { status: 403, expected: ErrorType.FORBIDDEN },
        { status: 404, expected: ErrorType.NOT_FOUND },
        { status: 409, expected: ErrorType.CONFLICT },
        { status: 429, expected: ErrorType.RATE_LIMIT },
        { status: 500, expected: ErrorType.API_UNAVAILABLE },
        { status: 503, expected: ErrorType.API_UNAVAILABLE },
        { status: 418, expected: ErrorType.API_ERROR } // Other status code
      ];
      
      httpErrors.forEach(({ status, expected }) => {
        const httpError = { status, message: `HTTP ${status} error` };
        const result = createServiceError(httpError);
        
        expect(result.type).toBe(expected);
        expect(result.statusCode).toBe(status);
      });
    });

    it('should use the provided default type if error format is unknown', () => {
      const unknownError = { foo: 'bar' };
      
      const result = createServiceError(unknownError, ErrorType.VALIDATION_ERROR);
      expect(result.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.details).toBe(unknownError);
    });
  });

  describe('logServiceError', () => {
    it('should log critical errors with console.error', () => {
      const criticalErrors = [
        { type: ErrorType.UNEXPECTED, message: 'Unexpected error' },
        { type: ErrorType.API_ERROR, message: 'API error' },
        { type: ErrorType.API_UNAVAILABLE, message: 'API unavailable' }
      ];
      
      criticalErrors.forEach(error => {
        logServiceError(error);
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should log warnings with console.warn', () => {
      const warningErrors = [
        { type: ErrorType.NETWORK_ERROR, message: 'Network error' },
        { type: ErrorType.TIMEOUT, message: 'Timeout error' },
        { type: ErrorType.UNAUTHORIZED, message: 'Unauthorized error' },
        { type: ErrorType.FORBIDDEN, message: 'Forbidden error' }
      ];
      
      warningErrors.forEach(error => {
        logServiceError(error);
        expect(console.warn).toHaveBeenCalled();
      });
    });

    it('should log info level errors with console.info', () => {
      const infoErrors = [
        { type: ErrorType.NOT_FOUND, message: 'Not found error' },
        { type: ErrorType.VALIDATION_ERROR, message: 'Validation error' },
        { type: ErrorType.CONFLICT, message: 'Conflict error' },
        { type: ErrorType.RATE_LIMIT, message: 'Rate limit error' }
      ];
      
      infoErrors.forEach(error => {
        logServiceError(error);
        expect(console.info).toHaveBeenCalled();
      });
    });

    it('should include context prefix when provided', () => {
      const error = { type: ErrorType.API_ERROR, message: 'API error' };
      
      logServiceError(error, 'AchievementService');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[AchievementService]'),
        expect.anything()
      );
    });
  });

  describe('safeServiceOperation', () => {
    it('should return operation result if successful', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const errorHandler = jest.fn();
      
      const result = await safeServiceOperation(operation, errorHandler);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
      expect(errorHandler).not.toHaveBeenCalled();
    });

    it('should handle errors and call error handler', async () => {
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);
      const errorHandler = jest.fn();
      
      await expect(safeServiceOperation(operation, errorHandler)).rejects.toThrow();
      
      expect(operation).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return fallback value on error if provided', async () => {
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);
      const errorHandler = jest.fn();
      const fallback = 'fallback value';
      
      const result = await safeServiceOperation(operation, errorHandler, fallback);
      
      expect(result).toBe(fallback);
      expect(operation).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
