import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import RegistrationForm from '@/components/forms/RegistrationForm';
import Button from '@/components/ui/Button';
import { validateEmail, validatePassword } from '@/shared/formValidation';
import { FiArrowRight, FiUser, FiMail, FiLock, FiCheck, FiBook, FiAward } from 'react-icons/fi'; 
import { FiArrowLeft } from 'react-icons/fi';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    rememberMe: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Validate fields when they change and have been touched
  useEffect(() => {
    const newErrors = {};
    
    if (touched.name && !formData.name) {
      newErrors.name = 'Name is required';
    }

    if (touched.username) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }
    
    if (touched.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }
    
    if (touched.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }
    
    if (touched.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (touched.role && !formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  const validateForm = () => {
    const newTouched = {};
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) newErrors.role = 'Please select a role';
    
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
    
    if (touched[name]) {
      let error = '';
      
      if (name === 'email' && value) {
        error = validateEmail(value);
      } else if (name === 'password' && value) {
        error = validatePassword(value);
      } else if (name === 'confirmPassword' && value) {
        error = value === formData.password ? '' : 'Passwords do not match';
      } else if (name === 'name' && !value) {
        error = 'Name is required';
      } else if (name === 'username') {
        if (!value) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
      }
      
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
  
  const handleRoleSelect = (role) => {
    console.log('Role selected:', role); // Debug log
    setFormData(prev => ({ ...prev, role }));
    setTouched(prev => ({ ...prev, role: true }));
    // Removed automatic step advancement
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }
    
    try {
      setIsLoading(true);
      setErrors({});
      
      console.log('Submitting registration with data:', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        rememberMe: formData.rememberMe
      }); // Debug log
      
      // Call the register function from AuthContext
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        rememberMe: formData.rememberMe
      });
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      // Replace with actual API call
      // await api.resendVerificationEmail({ email: formData.email });
      
      // Show success message (you can replace this with a toast notification)
      setErrors({
        submit: 'Verification email resent successfully!'
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      setErrors({
        submit: 'Failed to resend verification email. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple role selection component that doesn't use Button
  const renderStepOne = () => (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleRoleSelect('student')}
          className={`relative p-6 rounded-xl transition-all duration-200 border-2 ${
            formData.role === 'student'
              ? 'border-primary-500 bg-primary-900/20 backdrop-blur-sm'
              : 'border-gray-700 bg-gray-800/50 hover:border-primary-400/50'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-3 mb-3 rounded-full ${
              formData.role === 'student' 
                ? 'bg-primary-900/30 text-primary-300' 
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              <FiBook className="h-6 w-6" />
            </div>
            <span className="font-medium text-gray-100">Student</span>
            <p className="mt-1 text-xs text-gray-400 text-center">Join as a learner to access courses</p>
            {formData.role === 'student' && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                <FiCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => handleRoleSelect('teacher')}
          className={`relative p-6 rounded-xl transition-all duration-200 border-2 ${
            formData.role === 'teacher'
              ? 'border-primary-500 bg-primary-900/20 backdrop-blur-sm'
              : 'border-gray-700 bg-gray-800/50 hover:border-primary-400/50'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-3 mb-3 rounded-full ${
              formData.role === 'teacher' 
                ? 'bg-primary-900/30 text-primary-300' 
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              <FiAward className="h-6 w-6" />
            </div>
            <span className="font-medium text-gray-100">Teacher</span>
            <p className="mt-1 text-xs text-gray-400 text-center">Create and share your knowledge</p>
            {formData.role === 'teacher' && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                <FiCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        </button>
      </div>
      
      {touched.role && errors.role && (
        <div className="mt-2 p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg flex items-center space-x-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errors.role}</span>
        </div>
      )}
      
      <div className="pt-2">
        <Button
          type="button"
          onClick={() => setStep(2)}
          disabled={!formData.role}
          className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <RegistrationForm 
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      handleChange={handleChange}
      handleBlur={handleBlur}
      handleSubmit={handleSubmit}
      setStep={setStep}
    />
  );

  const renderSuccess = () => (
    <div className="mt-8 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-white">Account created successfully!</h2>
      <p className="mt-3 text-gray-300 max-w-md mx-auto">
        We've sent a verification link to your email. Please verify your email to continue.
      </p>
      <div className="mt-8">
        <Link
          to="/login"
          className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
        >
          <span>Go to login</span>
          <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
      <p className="mt-6 text-sm text-gray-400">
        Didn't receive an email?{' '}
        <button 
          onClick={handleResendVerificationEmail}
          className="font-medium text-primary-400 hover:text-primary-300 focus:outline-none focus:underline transition-colors duration-200"
        >
          Resend verification
        </button>
      </p>
    </div>
  );

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
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-300">
              Join us to get started
            </p>
            
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg flex items-center space-x-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
          
          {isSuccess ? renderSuccess() : (step === 1 ? renderStepOne() : renderStepTwo())}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
