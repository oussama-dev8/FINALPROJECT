import React from 'react';

function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    accent: 'bg-accent-500 text-white hover:bg-accent-600',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
