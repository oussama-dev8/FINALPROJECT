import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiEye, FiEyeOff, FiFileText } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

function TeacherCourses() {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  
  // State for courses
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

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

  // Handle course deletion
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(courseId);
    
    try {
      await courseApi.deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course: ' + (err.message || 'An error occurred'));
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle course visibility toggle
  const handleToggleVisibility = async (course) => {
    try {
      const updatedCourse = { 
        ...course, 
        status: course.status === 'published' ? 'draft' : 'published'
      };
      
      await courseApi.updateCourse(course.id, updatedCourse);
      
      // Update the course in the local state
      setCourses(courses.map(c => 
        c.id === course.id ? { ...c, status: updatedCourse.status } : c
      ));
    } catch (err) {
      console.error('Error updating course visibility:', err);
      alert('Failed to update course visibility: ' + (err.message || 'An error occurred'));
    }
  };

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
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">My Teaching</h1>
        <Button 
          onClick={() => navigate('/dashboard/teacher/courses/new')}
          className="flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Create New Course
        </Button>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-10 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-white mb-2">No courses yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You haven't created any courses yet. Start sharing your knowledge by creating your first course.
          </p>
          <Button 
            onClick={() => navigate('/dashboard/teacher/courses/new')}
            className="flex items-center gap-2 mx-auto"
          >
            <FiPlus className="h-4 w-4" />
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-700">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Students</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-16 flex-shrink-0 bg-gray-700 rounded overflow-hidden mr-4">
                        <img 
                          src={course.thumbnail || DEFAULT_THUMBNAIL} 
                          alt={course.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_THUMBNAIL;
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-white">{course.title}</div>
                        <div className="text-sm text-gray-400">{course.category_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-gray-300">
                      <FiUsers className="mr-2 h-4 w-4 text-gray-400" />
                      {course.current_students || 0}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-gray-300">{course.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/dashboard/teacher/courses/${course.id}/view`}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View course details"
                      >
                        <FiFileText className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleToggleVisibility(course)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title={course.status === 'published' ? "Unpublish course" : "Publish course"}
                      >
                        {course.status === 'published' ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                      <Link
                        to={`/dashboard/teacher/courses/${course.id}/edit`}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Edit course"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deleteLoading === course.id}
                        className={`text-gray-400 hover:text-red-500 transition-colors ${
                          deleteLoading === course.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete course"
                      >
                        {deleteLoading === course.id ? (
                          <div className="h-5 w-5 border-2 border-t-transparent border-red-500 rounded-full animate-spin"></div>
                        ) : (
                          <FiTrash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherCourses;