import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';
import { useCourses } from '@/shared/context/CourseContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

// Custom styles for the component
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Add styles to the document head
const addStyles = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
};

function MyCourses() {
  const navigate = useNavigate();
  const { isStudent } = useAuth();
  const { 
    enrolledCourses, 
    loading, 
    error, 
    getEnrolledCoursesByStatus, 
    removeEnrolledCourse, 
    refreshEnrolledCourses 
  } = useCourses();
  
  const [activeTab, setActiveTab] = useState('in-progress');
  const [courses, setCourses] = useState({
    'in-progress': [],
    'completed': [],
    'saved': []
  });
  
  // Track if we've initialized the component
  const initializedRef = useRef(false);
  
  // Add styles on component mount
  useEffect(() => {
    addStyles();
  }, []);
  
  // Initialize courses once when component mounts
  useEffect(() => {
    if (!isStudent || initializedRef.current) {
      return;
    }
    
    initializedRef.current = true;
    
    // Update courses from context
    const coursesByStatus = getEnrolledCoursesByStatus();
    setCourses(coursesByStatus);
    
    // Only refresh if we don't have any courses yet
    if (enrolledCourses.length === 0) {
      refreshEnrolledCourses();
    }
  }, [isStudent, enrolledCourses.length, getEnrolledCoursesByStatus, refreshEnrolledCourses]);
  
  // Update local state when enrolled courses change
  useEffect(() => {
    if (isStudent) {
      const coursesByStatus = getEnrolledCoursesByStatus();
      console.log('Courses by status:', coursesByStatus);
      setCourses(coursesByStatus);
    }
  }, [isStudent, enrolledCourses, getEnrolledCoursesByStatus]);

  const tabs = [
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'saved', label: 'Saved' }
  ];

  // Check if current tab has no courses
  const hasNoCourses = courses[activeTab].length === 0;

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle remove from saved
  const handleRemoveSaved = async (e, courseId) => {
    e.stopPropagation();
    
    try {
      // This would be implemented when we have a wishlist API
      // await courseApi.removeFromWishlist(courseId);
      
      // For now, just remove it from the local state
      setCourses(prev => ({
        ...prev,
          saved: prev.saved.filter(course => course.id !== courseId)
      }));
    } catch (err) {
      console.error('Error removing course from saved:', err);
    }
  };

  // Handle unenroll
  const handleUnenroll = async (e, courseId) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    
    try {
      await courseApi.unenrollFromCourse(courseId);
      
      // Remove the course from context
      removeEnrolledCourse(courseId);
      
      // Remove the course from local state
      setCourses(prev => ({
        ...prev,
        'in-progress': prev['in-progress'].filter(course => course.id !== courseId),
        'completed': prev['completed'].filter(course => course.id !== courseId)
      }));
    } catch (err) {
      console.error('Error unenrolling from course:', err);
    }
  };

  // Render course card based on tab type
  const renderCourseCard = (course) => {
    console.log('Rendering course card:', course);
    
    // Course data is now properly structured
    const courseId = course.id;
    const courseTitle = course.title || 'Untitled Course';
    const teacherName = course.teacher_name || 'Unknown Teacher';
    const courseProgress = course.progress || 0;
    const courseThumbnail = course.thumbnail;
    
    return (
    <div key={courseId} className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300">
      <div className="relative">
        <img
          src={courseThumbnail || DEFAULT_THUMBNAIL}
          alt={courseTitle}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_THUMBNAIL;
          }}
        />
        {activeTab === 'completed' && (
          <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Completed
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-1.5 line-clamp-2">
          {courseTitle}
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          By {teacherName}
        </p>
        {renderCourseCardContent({...course, id: courseId, title: courseTitle, teacher_name: teacherName, progress: courseProgress})}
      </div>
    </div>
  )};

  // Render specific content based on tab type
  const renderCourseCardContent = (course) => {
    // Course ID is now properly structured
    const courseId = course.id;
    
    switch (activeTab) {
      case 'in-progress':
        return (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium text-primary-400">{course.progress || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/dashboard/my-courses/${courseId}`} className="flex-1">
              <Button className="w-full group">
                <span className="relative">
                  <span className="opacity-100 group-hover:opacity-0 transition-opacity">
                    Continue Learning
                  </span>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    Resume Now →
                  </span>
                </span>
              </Button>
            </Link>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                onClick={(e) => handleUnenroll(e, courseId)}
              >
                Unenroll
              </Button>
            </div>
          </>
        );
      
      case 'completed':
        return (
          <>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </div>
            <div className="flex space-x-3">
              <Link to={`/dashboard/my-courses/${courseId}`} className="flex-1">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500">
                  View Course
                </Button>
              </Link>
              <Button variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500">
                View Certificate
              </Button>
            </div>
          </>
        );
      
      case 'saved':
        return (
          <>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <svg className="w-4 h-4 mr-1.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Saved for later
            </div>
            <div className="flex space-x-3">
              <Link to={`/courses/${courseId}`} className="flex-1">
                <Button className="w-full">View Course</Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                onClick={(e) => handleRemoveSaved(e, courseId)}
              >
                Remove
              </Button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
        <span className="text-red-500 text-2xl">!</span>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">Failed to load courses</h3>
      <p className="text-gray-400 max-w-md mx-auto">{error}</p>
      <button 
        onClick={() => refreshEnrolledCourses()}
        className="mt-4 inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
      >
        Try again
        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );

  const renderEmptyState = () => {
    let message = '';
    let action = null;

    switch (activeTab) {
      case 'in-progress':
        message = "You haven't enrolled in any courses yet.";
        action = (
          <Link to="/courses">
            <Button className="mt-4">Browse Courses</Button>
          </Link>
        );
        break;
      case 'completed':
        message = "You haven't completed any courses yet.";
        break;
      case 'saved':
        message = "You haven't saved any courses yet.";
        break;
      default:
        message = "No courses found.";
    }

    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
          <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
        <p className="text-gray-400 max-w-md mx-auto">{message}</p>
        {action}
      </div>
    );
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">My Courses</h1>
        <Link to="/courses">
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : hasNoCourses ? (
          renderEmptyState()
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses[activeTab].map(renderCourseCard)}
        </div>
        )}
    </div>
  );
}

export default MyCourses;
