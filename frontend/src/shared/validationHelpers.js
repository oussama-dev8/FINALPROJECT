/**
 * Validates registration form data
 * @param {Object} formData - The form data to validate
 * @returns {Object} Object containing validation errors (if any)
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  if (!formData.name) {
    errors.name = 'Name is required';
  }
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

/**
 * Clears a specific error when the user starts typing in a field
 * @param {Object} errors - Current errors object
 * @param {string} fieldName - Name of the field to clear errors for
 * @returns {Object} New errors object with the specified field's error cleared
 */
export const clearFieldError = (errors, fieldName) => {
  if (errors[fieldName]) {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
  }
  return errors;
};
