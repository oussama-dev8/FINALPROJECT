import React from 'react';
import { Link } from 'react-router-dom';

function TeacherDashboard({ user }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, Professor {user?.name?.split(' ')[0]}!</h1>
        <p className="mt-2 text-gray-300">Manage your courses and students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <h2 className="text-lg font-medium text-white mb-4">Your Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Active Courses</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">127</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/dashboard/teaching/new" className="w-full flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
              <span className="text-sm font-medium text-gray-200">Create New Course</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
            <button className="w-full flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
              <span className="text-sm font-medium text-gray-200">Schedule Live Session</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
              <span className="text-sm font-medium text-gray-200">View Student Progress</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Recent Activity</h2>
          <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">View All</button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">New assignment submitted by John Doe</p>
                <p className="text-sm text-gray-400">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
