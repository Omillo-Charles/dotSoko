/**
 * Error Handler Utilities
 * Provides user-friendly error messages and validation error formatting
 */

interface ValidationError {
  field: string;
  message: string;
}

interface ApiErrorData {
  message?: string;
  errors?: ValidationError[];
  requestId?: string;
}

interface ApiError {
  friendlyMessage?: string;
  backendErrors?: ValidationError[];
  statusCode?: number;
  response?: {
    data?: ApiErrorData;
    status?: number;
  };
  message?: string;
}

/**
 * Get a user-friendly error message from an API error
 * @param error - The error object from API call
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  const apiError = error as ApiError;
  
  // Priority 1: Use friendlyMessage if available (set by interceptor)
  if (apiError.friendlyMessage) {
    return apiError.friendlyMessage;
  }
  
  // Priority 2: Use backend message
  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }
  
  // Priority 3: Use status code to generate message
  const statusCode = apiError.statusCode || apiError.response?.status;
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return 'Invalid details provided. Please check your input.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Item not found.';
      case 409:
        return 'This item already exists.';
      case 413:
        return 'File is too large.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Something went wrong. Please try again.';
      case 503:
        return 'Service temporarily unavailable.';
    }
  }
  
  // Priority 4: Use error message
  if (apiError.message) {
    return apiError.message;
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Get validation errors from an API error
 * @param error - The error object from API call
 * @returns Array of validation errors or null
 */
export const getValidationErrors = (error: any): ValidationError[] | null => {
  const apiError = error as ApiError;
  
  // Check backendErrors (set by interceptor)
  if (apiError.backendErrors && Array.isArray(apiError.backendErrors)) {
    return apiError.backendErrors;
  }
  
  // Check response data errors
  if (apiError.response?.data?.errors && Array.isArray(apiError.response.data.errors)) {
    return apiError.response.data.errors;
  }
  
  return null;
};

/**
 * Format validation errors for display
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (!errors || errors.length === 0) {
    return 'Invalid details provided.';
  }
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  // Multiple errors - format as list
  return errors.map(e => e.message).join('. ');
};

/**
 * Get error message for a specific field
 * @param error - The error object from API call
 * @param fieldName - The field name to get error for
 * @returns Error message for the field or null
 */
export const getFieldError = (error: any, fieldName: string): string | null => {
  const validationErrors = getValidationErrors(error);
  if (!validationErrors) return null;
  
  const fieldError = validationErrors.find(e => 
    e.field === fieldName || 
    e.field.endsWith(`.${fieldName}`) ||
    e.field.startsWith(`${fieldName}.`)
  );
  
  return fieldError ? fieldError.message : null;
};

/**
 * Check if error is a validation error
 * @param error - The error object from API call
 * @returns True if validation error
 */
export const isValidationError = (error: any): boolean => {
  const apiError = error as ApiError;
  const statusCode = apiError.statusCode || apiError.response?.status;
  return statusCode === 400 && (
    !!apiError.backendErrors || 
    !!apiError.response?.data?.errors
  );
};

/**
 * Check if error is an authentication error
 * @param error - The error object from API call
 * @returns True if auth error
 */
export const isAuthError = (error: any): boolean => {
  const apiError = error as ApiError;
  const statusCode = apiError.statusCode || apiError.response?.status;
  return statusCode === 401 || statusCode === 403;
};

/**
 * Check if error is a network error
 * @param error - The error object from API call
 * @returns True if network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
};

/**
 * Get request ID from error for support
 * @param error - The error object from API call
 * @returns Request ID or null
 */
export const getRequestId = (error: any): string | null => {
  const apiError = error as ApiError;
  return apiError.response?.data?.requestId || null;
};

/**
 * Format error for toast notification
 * @param error - The error object from API call
 * @returns Object with title and description for toast
 */
export const formatErrorForToast = (error: any): { title: string; description?: string } => {
  const message = getErrorMessage(error);
  const validationErrors = getValidationErrors(error);
  const requestId = getRequestId(error);
  
  if (validationErrors && validationErrors.length > 1) {
    return {
      title: message,
      description: validationErrors.map(e => `• ${e.message}`).join('\n')
    };
  }
  
  if (requestId) {
    return {
      title: message,
      description: `Request ID: ${requestId}`
    };
  }
  
  return { title: message };
};

/**
 * Example usage in components:
 * 
 * import { getErrorMessage, formatValidationErrors, getValidationErrors } from '@/lib/errorHandler';
 * 
 * try {
 *   await api.post('/orders', data);
 * } catch (error) {
 *   // Simple usage
 *   toast.error(getErrorMessage(error));
 *   
 *   // With validation errors
 *   const validationErrors = getValidationErrors(error);
 *   if (validationErrors) {
 *     toast.error(formatValidationErrors(validationErrors));
 *   } else {
 *     toast.error(getErrorMessage(error));
 *   }
 *   
 *   // With toast formatting
 *   const { title, description } = formatErrorForToast(error);
 *   toast.error(title, { description });
 * }
 */
