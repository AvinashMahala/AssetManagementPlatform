import { Response } from 'express';
import { ErrorUtils } from '../../utils/error';
import { ResponseUtils } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/http';

// Mock ResponseUtils
jest.mock('../../utils/response');
const mockResponseUtils = ResponseUtils as jest.Mocked<typeof ResponseUtils>;

describe('ErrorUtils', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('handleDatabaseError', () => {
    it('should handle unique constraint violation for username', () => {
      const error = { code: '23505', constraint: 'users_username_key' };

      ErrorUtils.handleDatabaseError(mockRes as Response, error);

      expect(mockResponseUtils.conflict).toHaveBeenCalledWith(mockRes, 'Username already exists');
    });

    it('should handle unique constraint violation for email', () => {
      const error = { code: '23505', constraint: 'users_email_key' };

      ErrorUtils.handleDatabaseError(mockRes as Response, error);

      expect(mockResponseUtils.conflict).toHaveBeenCalledWith(mockRes, 'Email already exists');
    });

    it('should handle connection errors', () => {
      const error = { code: 'ECONNREFUSED' };

      ErrorUtils.handleDatabaseError(mockRes as Response, error);

      expect(mockResponseUtils.error).toHaveBeenCalledWith(
        mockRes,
        'Database connection failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    });

    it('should handle default database errors', () => {
      const error = { code: 'UNKNOWN' };

      ErrorUtils.handleDatabaseError(mockRes as Response, error);

      expect(mockResponseUtils.error).toHaveBeenCalledWith(
        mockRes,
        'Database operation failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    });
  });

  describe('handleValidationError', () => {
    it('should call ResponseUtils.badRequest with the message', () => {
      const message = 'Invalid input';

      ErrorUtils.handleValidationError(mockRes as Response, message);

      expect(mockResponseUtils.badRequest).toHaveBeenCalledWith(mockRes, message);
    });
  });

  describe('handleNotFound', () => {
    it('should call ResponseUtils.notFound with default message', () => {
      ErrorUtils.handleNotFound(mockRes as Response);

      expect(mockResponseUtils.notFound).toHaveBeenCalledWith(mockRes, 'Resource not found');
    });

    it('should call ResponseUtils.notFound with custom resource', () => {
      ErrorUtils.handleNotFound(mockRes as Response, 'User');

      expect(mockResponseUtils.notFound).toHaveBeenCalledWith(mockRes, 'User not found');
    });
  });

  describe('handleGenericError', () => {
    it('should call ResponseUtils.error with default message', () => {
      const error = new Error('Test error');

      ErrorUtils.handleGenericError(mockRes as Response, error);

      expect(mockResponseUtils.error).toHaveBeenCalledWith(
        mockRes,
        'An error occurred',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    });

    it('should call ResponseUtils.error with custom message', () => {
      const error = new Error('Test error');
      const customMessage = 'Custom error message';

      ErrorUtils.handleGenericError(mockRes as Response, error, customMessage);

      expect(mockResponseUtils.error).toHaveBeenCalledWith(
        mockRes,
        customMessage,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    });
  });

  describe('asyncHandler', () => {
    it('should call the function and handle success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const handler = ErrorUtils.asyncHandler(mockFn);

      const mockReq = {};
      const mockNext = jest.fn();

      await handler(mockReq, mockRes as Response, mockNext);

      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should handle errors thrown by the function', async () => {
      const error = new Error('Async error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const handler = ErrorUtils.asyncHandler(mockFn);

      const mockReq = {};
      const mockNext = jest.fn();

      await handler(mockReq, mockRes as Response, mockNext);

      expect(mockResponseUtils.error).toHaveBeenCalledWith(
        mockRes,
        'An error occurred',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    });
  });
});