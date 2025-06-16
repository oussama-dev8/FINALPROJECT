import React from 'react';
import { FiUsers, FiBookOpen, FiAward, FiClock } from 'react-icons/fi';

function CourseStats({ totalCourses, categories, instructors }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-full mb-4">
          <FiBookOpen className="text-primary-400" size={22} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{totalCourses}</h3>
        <p className="text-gray-400">Total Courses</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
          <FiUsers className="text-blue-400" size={22} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{instructors}</h3>
        <p className="text-gray-400">Expert Instructors</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
          <FiAward className="text-purple-400" size={22} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{categories}</h3>
        <p className="text-gray-400">Categories</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
          <FiClock className="text-green-400" size={22} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">24/7</h3>
        <p className="text-gray-400">Lifetime Access</p>
      </div>
    </div>
  );
}

export default CourseStats; 