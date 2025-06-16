import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SvgIcon from '@/components/common/SvgIcon';
import { useAuth } from '@/shared/context/AuthContext';
import { validateEmail, validatePassword } from '@/shared/formValidation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Debug: Log errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Current errors:', errors);
    }
  }, [errors]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Validate fields when they change and have been touched
  useEffect(() => {
    const newErrors = {};
    
    if (touched.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }
    
    if (touched.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  const validateForm = () => {
    // Mark all fields as touched to show all possible errors
    const newTouched = {};
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    const newErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Only validate and update errors if the field has been touched
    if (touched[name]) {
      let error = '';
      
      if (name === 'email' && value) {
        error = validateEmail(value);
      } else if (name === 'password' && value) {
        error = validatePassword(value);
      }
      
      // Only update errors if there's a change to prevent unnecessary re-renders
      if (errors[name] !== error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
    setIsLoading(true);
    setErrors({});
    
      // Manually call the API instead of using the context function
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle error response
        let errorMessage = 'Invalid email or password';
        if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'object' && Object.keys(data).length > 0) {
          const key = Object.keys(data)[0];
          errorMessage = `${key}: ${data[key]}`;
        }
        
        setErrors({
          submit: errorMessage
        });
        return;
      }
      
      // Handle successful login
      console.log('Login successful:', data);
      
      // Store tokens
      const { tokens } = data;
      if (formData.rememberMe) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      } else {
        sessionStorage.setItem('access_token', tokens.access);
        sessionStorage.setItem('refresh_token', tokens.refresh);
      }
      
      // Update auth context
      login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      }).then(() => {
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      }).catch(error => {
        console.error('Error updating auth context:', error);
      });
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: 'Network error. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/assets/images/hero/diverse-students.jpg"
          alt="Students learning together"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-primary-800/20 to-transparent"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <Link to="/" className="flex justify-center">
              <img 
                src="/favicon.svg" 
                alt="Darsy Logo" 
                className="h-14 w-auto"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-300">
              Sign in to continue to your account
            </p>
          </div>
            
          {/* Error message display */}
            {errors.submit && (
            <div className="my-4 p-4 bg-red-900/50 border border-red-500 text-red-100 rounded-lg flex items-center space-x-2">
              <svg className="h-5 w-5 flex-shrink-0 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              <span className="font-medium">{errors.submit}</span>
              </div>
            )}
          
          <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${touched.email && errors.email ? 'border-red-500' : ''} ${touched.email && formData.email && !errors.email ? 'border-green-500' : ''}`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${touched.password && errors.password ? 'border-red-500' : ''} ${touched.password && formData.password && !errors.password ? 'border-green-500' : ''}`}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900/70 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Google
                </button>
              </div>

              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.195 20 14.43 20 10.017 20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
