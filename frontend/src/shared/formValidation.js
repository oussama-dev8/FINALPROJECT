// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  needsUppercase: true,
  needsNumber: true,
  needsSpecialChar: true
};

// Validate email format
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return '';
};

// Validate password strength
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_RULES.minLength) {
    return `Password must be at least ${PASSWORD_RULES.minLength} characters long`;
  }
  if (PASSWORD_RULES.needsUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (PASSWORD_RULES.needsNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (PASSWORD_RULES.needsSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

// Check if all fields in an object are non-empty
export const allFieldsFilled = (fields) => {
  return Object.values(fields).every(value => value && value.trim() !== '');
};

// Validate form fields and return error messages
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field] || '';
    const rules = validationRules[field];
    
    if (rules.required && !value.trim()) {
      errors[field] = rules.requiredMessage || `${field} is required`;
    } else if (rules.validate) {
      const error = rules.validate(value);
      if (error) errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
