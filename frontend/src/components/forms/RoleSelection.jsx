import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, UserGroupIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { FiArrowRight, FiBook, FiAward, FiCheck } from 'react-icons/fi';

const RoleSelection = ({ onSelectRole, selectedRole, error, onContinue }) => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelectRole('student')}
        className={`relative p-6 rounded-xl transition-all duration-200 border-2 ${
          selectedRole === 'student'
            ? 'border-primary-500 bg-primary-900/20 backdrop-blur-sm'
            : 'border-gray-700 bg-gray-800/50 hover:border-primary-400/50'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className={`p-3 mb-3 rounded-full ${
            selectedRole === 'student' 
              ? 'bg-primary-900/30 text-primary-300' 
              : 'bg-gray-700/50 text-gray-400'
          }`}>
            <FiBook className="h-6 w-6" />
          </div>
          <span className="font-medium text-gray-100">Student</span>
          <p className="mt-1 text-xs text-gray-400 text-center">Join as a learner to access courses</p>
          {selectedRole === 'student' && (
            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
              <FiCheck className="h-3.5 w-3.5 text-white" />
        </div>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectRole('teacher')}
        className={`relative p-6 rounded-xl transition-all duration-200 border-2 ${
          selectedRole === 'teacher'
            ? 'border-primary-500 bg-primary-900/20 backdrop-blur-sm'
            : 'border-gray-700 bg-gray-800/50 hover:border-primary-400/50'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className={`p-3 mb-3 rounded-full ${
            selectedRole === 'teacher' 
              ? 'bg-primary-900/30 text-primary-300' 
              : 'bg-gray-700/50 text-gray-400'
          }`}>
            <FiAward className="h-6 w-6" />
          </div>
          <span className="font-medium text-gray-100">Teacher</span>
          <p className="mt-1 text-xs text-gray-400 text-center">Create and share your knowledge</p>
          {selectedRole === 'teacher' && (
            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
              <FiCheck className="h-3.5 w-3.5 text-white" />
        </div>
          )}
        </div>
      </button>
    </div>

    {error && (
      <div className="mt-2 p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg flex items-center space-x-2">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{error}</span>
      </div>
    )}

    {onContinue && (
      <div className="pt-2">
        <Button
          type="button"
          onClick={onContinue}
          disabled={!selectedRole}
          className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    )}
  </div>
);

export default React.memo(RoleSelection);
