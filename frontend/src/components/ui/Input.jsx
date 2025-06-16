import React from 'react';

// Inline SVG Icons
const CheckCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 flex-shrink-0"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

function Input({ 
  label, 
  error, 
  success,
  successMessage,
  className = '',
  labelClassName = '',
  ...props 
}) {
  const showError = error && !success;
  const showSuccess = success && !error;

  return (
    <div className="mb-5">
      {label && (
        <label className={`block text-sm font-medium text-gray-300 mb-1.5 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div>
        <div className="relative">
          <input
            className={`
              w-full px-4 py-2.5 pr-10 rounded-lg border 
              focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors
              ${showError 
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                : showSuccess
                  ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
                  : 'border-gray-600 text-white placeholder-gray-400 focus:ring-primary-500/20 focus:border-primary-500'}
              bg-gray-700 hover:bg-gray-600 focus:bg-gray-600
              ${className}
            `}
            {...props}
          />
          
          {/* Status Icons */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {showSuccess && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
            )}
            {showError && (
              <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {showSuccess && (
          <div className="mt-1.5 text-sm text-green-400 flex items-start">
            <ExclamationCircleIcon className="mr-1.5 mt-0.5" />
            {successMessage || 'Looks good!'}
          </div>
        )}
        {showError && (
          <div className="mt-1.5 text-sm text-red-400 flex items-start">
            <ExclamationCircleIcon className="mr-1.5 mt-0.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

Input.defaultProps = {
  type: 'text',
};

export default React.memo(Input);
