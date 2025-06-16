import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenIcon, UserGroupIcon, ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

const TeachingPage = () => {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  
  // State for courses
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!isTeacher) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const coursesData = await courseApi.getTeacherCourses();
        
        // Handle both paginated and direct array responses
        if (coursesData && coursesData.results && Array.isArray(coursesData.results)) {
          // Paginated response
          setCourses(coursesData.results);
        } else if (Array.isArray(coursesData)) {
          // Direct array response
          setCourses(coursesData);
        } else {
          // Unexpected response format
          console.error('Unexpected response format:', coursesData);
          setCourses([]);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [isTeacher]);

  // Render loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Failed to load courses</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Teaching</h1>
        <p className="text-gray-400">Manage your courses and track student progress</p>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/teacher/courses/new"
            className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-400 mr-3">
              <PlusIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Create New Course</h3>
              <p className="text-xs text-gray-400">Start building your course</p>
            </div>
          </Link>
          <Link
            to="/dashboard/teacher/courses"
            className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 mr-3">
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Manage Courses</h3>
              <p className="text-xs text-gray-400">View and edit your courses</p>
            </div>
          </Link>
          <div className="flex items-center p-4 bg-gray-700 rounded-lg opacity-50 cursor-not-allowed">
            <div className="p-2 rounded-md bg-green-500/10 text-green-400 mr-3">
              <UserGroupIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-400">Invite Co-instructor</h3>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-700 rounded-lg opacity-50 cursor-not-allowed">
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 mr-3">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-400">View Analytics</h3>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 hover:border-indigo-500 transition-colors duration-200">
              <div className="h-32 bg-gray-700 relative">
                <img
                  src={course.thumbnail || DEFAULT_THUMBNAIL}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_THUMBNAIL;
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-2">{course.title}</h3>
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>{course.current_students || 0} students</span>
                  </div>
                  <div className="flex items-center">
                    <span className={course.status === 'published' ? 'text-green-400' : 'text-yellow-400'}>
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/teacher/courses/${course.id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/courses/${course.id}`}
                    className="flex-1 text-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty state when no courses
          <div className="col-span-full border-2 border-dashed border-gray-700 rounded-lg p-10 flex flex-col items-center justify-center text-center">
            <BookOpenIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No courses yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't created any courses yet. Start sharing your knowledge by creating your first course.
            </p>
            <Link
              to="/dashboard/teacher/courses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Your First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachingPage;
