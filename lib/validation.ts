/**
 * Client-Side Validation Utilities
 * Provides real-time validation on blur for better UX
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate a single field value
 * @param value - The field value to validate
 * @param rules - Validation rules to apply
 * @param fieldLabel - Human-readable field name for error messages
 * @returns Validation result with error message if invalid
 */
export const validateField = (
  value: any,
  rules: ValidationRule,
  fieldLabel: string = 'This field'
): ValidationResult => {
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { isValid: false, error: `${fieldLabel} is required` };
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: true, error: null };
  }

  // String validations
  if (typeof value === 'string') {
    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      return { 
        isValid: false, 
        error: `${fieldLabel} must be at least ${rules.minLength} characters` 
      };
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return { 
        isValid: false, 
        error: `${fieldLabel} must be at most ${rules.maxLength} characters` 
      };
    }

    // Pattern matching
    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, error: getPatternErrorMessage(rules.pattern, fieldLabel) };
    }
  }

  // Number validations
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = typeof value === 'number' ? value : Number(value);

    // Min value
    if (rules.min !== undefined && numValue < rules.min) {
      return { 
        isValid: false, 
        error: `${fieldLabel} must be at least ${rules.min}` 
      };
    }

    // Max value
    if (rules.max !== undefined && numValue > rules.max) {
      return { 
        isValid: false, 
        error: `${fieldLabel} must be at most ${rules.max}` 
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return { isValid: false, error: customError };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Get user-friendly error message for pattern validation
 */
const getPatternErrorMessage = (pattern: RegExp, fieldLabel: string): string => {
  const patternStr = pattern.toString();
  
  // Email pattern
  if (patternStr.includes('@') || patternStr.includes('email')) {
    return 'Please enter a valid email address';
  }
  
  // Phone pattern
  if (patternStr.includes('phone') || patternStr.includes('[0-9]')) {
    return 'Please enter a valid phone number';
  }
  
  // URL pattern
  if (patternStr.includes('http') || patternStr.includes('url')) {
    return 'Please enter a valid URL';
  }
  
  // Username pattern
  if (patternStr.includes('username') || patternStr.includes('[a-z0-9]')) {
    return 'Only lowercase letters, numbers, and underscores allowed';
  }
  
  return `${fieldLabel} format is invalid`;
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 30,
  },
  
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      return null;
    }
  },
  
  phone: {
    required: true,
    minLength: 10,
    pattern: /^[0-9+\s()-]+$/,
  },
  
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-z0-9_]+$/,
  },
  
  shopName: {
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  
  productName: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  
  description: {
    required: false,
    minLength: 10,
    maxLength: 500,
  },
  
  price: {
    required: true,
    min: 0,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) return 'Please enter a valid price';
      if (num <= 0) return 'Price must be greater than 0';
      return null;
    }
  },
  
  stock: {
    required: true,
    min: 0,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) return 'Please enter a valid quantity';
      if (!Number.isInteger(num)) return 'Stock must be a whole number';
      if (num < 0) return 'Stock cannot be negative';
      return null;
    }
  },
  
  quantity: {
    required: true,
    min: 1,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) return 'Please enter a valid quantity';
      if (!Number.isInteger(num)) return 'Quantity must be a whole number';
      if (num < 1) return 'Quantity must be at least 1';
      return null;
    }
  },
  
  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  
  city: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
};

/**
 * Validate multiple fields at once
 * @param data - Object with field values
 * @param rules - Object with validation rules for each field
 * @returns Object with errors for each invalid field
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, { rules: ValidationRule; label: string }>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const [field, config] of Object.entries(rules)) {
    const result = validateField(data[field], config.rules, config.label);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  }
  
  return errors;
};

/**
 * Check if form has any errors
 * @param errors - Errors object from validateForm
 * @returns True if form is valid (no errors)
 */
export const isFormValid = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length === 0;
};

/**
 * React hook for field validation on blur
 * @returns Validation utilities
 */
export const useFieldValidation = () => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateOnBlur = (
    fieldName: string,
    value: any,
    rules: ValidationRule,
    fieldLabel?: string
  ) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const result = validateField(value, rules, fieldLabel || fieldName);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (result.error) {
        newErrors[fieldName] = result.error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
    
    return result;
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
    setTouched({});
  };

  const setFieldError = (fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const hasError = (fieldName: string): boolean => {
    return touched[fieldName] && !!errors[fieldName];
  };

  const getError = (fieldName: string): string | null => {
    return touched[fieldName] ? errors[fieldName] || null : null;
  };

  return {
    errors,
    touched,
    validateOnBlur,
    clearError,
    clearAllErrors,
    setFieldError,
    hasError,
    getError,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 * Example usage in components:
 * 
 * import { useFieldValidation, ValidationRules } from '@/lib/validation';
 * 
 * const MyForm = () => {
 *   const [formData, setFormData] = useState({ name: '', email: '' });
 *   const { validateOnBlur, getError, hasError, isValid } = useFieldValidation();
 * 
 *   const handleBlur = (field: string) => {
 *     if (field === 'name') {
 *       validateOnBlur('name', formData.name, ValidationRules.name, 'Name');
 *     } else if (field === 'email') {
 *       validateOnBlur('email', formData.email, ValidationRules.email, 'Email');
 *     }
 *   };
 * 
 *   return (
 *     <form>
 *       <input
 *         value={formData.name}
 *         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 *         onBlur={() => handleBlur('name')}
 *         className={hasError('name') ? 'border-red-500' : ''}
 *       />
 *       {getError('name') && (
 *         <p className="text-red-500 text-sm">{getError('name')}</p>
 *       )}
 *     </form>
 *   );
 * };
 */

import React from 'react';
