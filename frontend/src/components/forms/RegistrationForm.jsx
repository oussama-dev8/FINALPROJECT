import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FiArrowLeft, FiUser } from 'react-icons/fi';

const RegistrationForm = memo(({ formData, errors, isLoading, handleChange, handleSubmit, setStep }) => {
  if (!formData.role) {
    return (
      <div className="w-full rounded-xl p-6 space-y-6 bg-gray-800/50 border border-gray-700/50">
        <div className="text-center">
          <p className="text-gray-300">Please select a role first</p>
          <button
            onClick={() => setStep(1)}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Role Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-primary-900/30 border border-primary-700/50 rounded-full flex items-center justify-center mb-4">
          <FiUser className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Join as a {formData.role === 'teacher' ? 'Teacher' : 'Student'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <button
        type="button"
        onClick={() => setStep(1)}
        className="inline-flex items-center text-sm font-medium text-primary-400 hover:text-primary-300"
      >
        <FiArrowLeft className="h-4 w-4 mr-1" />
        Back to role selection
      </button>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name"
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              labelClassName="text-gray-300"
              required
            />
          </div>
          <div>
            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              value={formData.username || ''}
              onChange={handleChange}
              error={errors.username}
              placeholder="Choose a username"
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              labelClassName="text-gray-300"
              required
            />
          </div>
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              labelClassName="text-gray-300"
              required
            />
          </div>
          <div>
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              labelClassName="text-gray-300"
              required
            />
          </div>
          <div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              labelClassName="text-gray-300"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg flex items-center space-x-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errors.submit}</span>
          </div>
        )}

        <div>
          <Button
            type="submit"
            className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
});

export default RegistrationForm;
