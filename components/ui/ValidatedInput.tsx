"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateField, ValidationRule } from '@/lib/validation';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRule;
  fieldLabel?: string;
  icon?: React.ReactNode;
  showSuccessIcon?: boolean;
  helperText?: string;
  containerClassName?: string;
}

/**
 * ValidatedInput Component
 * Input field with automatic validation on blur (Google-style UX)
 * 
 * Features:
 * - Validates when user leaves the field (onBlur)
 * - Shows error message below input
 * - Visual feedback (red border for errors, green for valid)
 * - Optional success checkmark
 * - Supports all standard input props
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  validationRules,
  fieldLabel,
  icon,
  showSuccessIcon = false,
  helperText,
  containerClassName = '',
  className = '',
  ...inputProps
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    
    if (!validationRules) return;
    
    const result = validateField(value, validationRules, fieldLabel || label || 'This field');
    setError(result.error);
    setIsValid(result.isValid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    
    // Clear error when user starts typing (if field was touched)
    if (touched && error) {
      setError(null);
    }
  };

  // Validate on mount if value exists
  useEffect(() => {
    if (value && validationRules && !touched) {
      const result = validateField(value, validationRules, fieldLabel || label || 'This field');
      setIsValid(result.isValid);
    }
  }, []);

  const hasError = touched && error;
  const showSuccess = touched && isValid && showSuccessIcon && value;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {validationRules?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            hasError ? 'text-red-500' : 
            showSuccess ? 'text-green-500' : 
            'text-muted-foreground group-focus-within:text-primary'
          }`}>
            {icon}
          </div>
        )}
        
        <input
          {...inputProps}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${showSuccess ? 'pr-10' : 'pr-4'} py-3 bg-muted border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-foreground placeholder:text-muted-foreground/50 ${
            hasError 
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
              : showSuccess
              ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
              : 'border-border focus:ring-primary/20 focus:border-primary'
          } ${className}`}
        />
        
        {showSuccess && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
      
      {hasError && (
        <div className="flex items-start gap-1.5 mt-1.5 text-red-500">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
      
      {!hasError && helperText && (
        <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>
      )}
    </div>
  );
};

interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onBlur'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRule;
  fieldLabel?: string;
  helperText?: string;
  containerClassName?: string;
}

/**
 * ValidatedTextarea Component
 * Textarea field with automatic validation on blur
 */
export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  label,
  value,
  onChange,
  validationRules,
  fieldLabel,
  helperText,
  containerClassName = '',
  className = '',
  ...textareaProps
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    
    if (!validationRules) return;
    
    const result = validateField(value, validationRules, fieldLabel || label || 'This field');
    setError(result.error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Clear error when user starts typing
    if (touched && error) {
      setError(null);
    }
  };

  const hasError = touched && error;
  const charCount = value.length;
  const maxLength = validationRules?.maxLength;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {validationRules?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          {...textareaProps}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-muted border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-foreground placeholder:text-muted-foreground/50 resize-none ${
            hasError 
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
              : 'border-border focus:ring-primary/20 focus:border-primary'
          } ${className}`}
        />
        
        {maxLength && (
          <div className={`absolute bottom-2 right-2 text-xs font-medium ${
            charCount > maxLength ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      
      {hasError && (
        <div className="flex items-start gap-1.5 mt-1.5 text-red-500">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
      
      {!hasError && helperText && (
        <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Example Usage:
 * 
 * import { ValidatedInput } from '@/components/ui/ValidatedInput';
 * import { ValidationRules } from '@/lib/validation';
 * import { Mail, User } from 'lucide-react';
 * 
 * const MyForm = () => {
 *   const [formData, setFormData] = useState({ name: '', email: '' });
 * 
 *   return (
 *     <form>
 *       <ValidatedInput
 *         label="Full Name"
 *         value={formData.name}
 *         onChange={(value) => setFormData({ ...formData, name: value })}
 *         validationRules={ValidationRules.name}
 *         fieldLabel="Name"
 *         icon={<User className="w-5 h-5" />}
 *         showSuccessIcon
 *         helperText="Enter your full name as it appears on your ID"
 *       />
 *       
 *       <ValidatedInput
 *         label="Email Address"
 *         type="email"
 *         value={formData.email}
 *         onChange={(value) => setFormData({ ...formData, email: value })}
 *         validationRules={ValidationRules.email}
 *         fieldLabel="Email"
 *         icon={<Mail className="w-5 h-5" />}
 *         showSuccessIcon
 *       />
 *     </form>
 *   );
 * };
 */
