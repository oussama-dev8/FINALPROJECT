import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiBook, FiAward, FiCheck, FiStar, FiLoader } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';
import { useCourses } from '@/shared/context/CourseContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent, isTeacher, user } = useAuth();
  const { addEnrolledCourse, isEnrolledInCourse } = useCourses();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const courseData = await courseApi.getCourseById(id);
        
        // If the user is the teacher of this course, redirect to teacher view
        if (isTeacher && courseData.teacher?.id === user?.id) {
          navigate(`/dashboard/teacher/courses/${id}/view`);
          return;
        }
        
        setCourse({
          ...courseData,
          is_enrolled: isEnrolledInCourse(id)
        });
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isEnrolledInCourse, isTeacher, user, navigate]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    if (!isStudent) {
      setEnrollmentError('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    setEnrollmentError(null);
    setEnrollmentSuccess(false);

    try {
      await courseApi.enrollInCourse(id);
      
      // Update the course state to reflect enrollment
      setCourse({
        ...course,
        is_enrolled: true
      });
      
      // Add the course to the enrolled courses context
      addEnrolledCourse(course);
      
      // Show success message
      setEnrollmentSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setEnrollmentSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Enrollment error:', err);
      setEnrollmentError(err.message || 'Failed to enroll in this course');
    } finally {
      setEnrolling(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FiStar 
        key={i} 
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
      />
    ));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load course</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/courses')}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  // If course not found
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <p className="text-gray-400 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary-500/20 text-primary-300 rounded-full">
                  {course.difficulty_level}
                </span>
                <span className="flex items-center text-sm text-gray-400">
                  <FiClock className="mr-1" /> {course.duration_weeks} weeks
                </span>
                <span className="flex items-center text-sm text-gray-400">
                  <FiBook className="mr-1" /> {course.lessons?.length || 0} Lessons
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <div className="flex">
                    {renderStars(course.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-400">
                    {course.rating} ({course.reviews?.length || 0} reviews)
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <div className="text-sm text-gray-400">
                  {course.current_students} students enrolled
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {course.is_enrolled ? (
                  <Button 
                    variant="primary" 
                    className="px-8 py-3 text-lg"
                    onClick={() => navigate('/dashboard/my-courses')}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="px-8 py-3 text-lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      `Enroll Now • $${course.price}`
                    )}
                </Button>
                )}
                <Button variant="outline" className="px-8 py-3 text-lg border-gray-700 hover:bg-gray-800">
                  Add to Wishlist
                </Button>
              </div>
              
              {enrollmentError && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{enrollmentError}</span>
                </div>
              )}
              
              {enrollmentSuccess && (
                <div className="mt-4 p-4 bg-green-900/30 border border-green-700/50 text-green-100 rounded-lg flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>You have successfully enrolled in this course! You can access it anytime from your My Courses page.</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={course.thumbnail || DEFAULT_THUMBNAIL} 
                  alt={course.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_THUMBNAIL;
                  }}
                />
                {course.lessons && course.lessons.length > 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Preview this course</span>
                  </button>
                </div>
                )}
              </div>
              
              <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-4">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.lessons?.length || 0} video lessons
                  </li>
                  <li className="flex items-center text-gray-300">
                    <FiBook className="w-5 h-5 text-primary-400 mr-3" />
                    {course.duration_weeks} weeks of content
                  </li>
                  <li className="flex items-center text-gray-300">
                    <FiAward className="w-5 h-5 text-primary-400 mr-3" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center text-gray-300">
                    <FiClock className="w-5 h-5 text-primary-400 mr-3" />
                    Full lifetime access
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <section className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.description.split('. ').filter(Boolean).map((point, index) => (
                  <div key={index} className="flex items-start">
                    <FiCheck className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{point}.</span>
                  </div>
                ))}
              </div>
            </section>

            {course.lessons && course.lessons.length > 0 && (
              <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Course Content
                </h2>
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-primary-400 font-medium">{index + 1}.</span>
                          <h3 className="font-medium text-white">{lesson.title}</h3>
                        </div>
                        <span className="text-sm text-gray-400">{lesson.duration_minutes} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                About the Instructor
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-white">
                  {course.teacher_name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{course.teacher_name}</h3>
                  <p className="text-sm text-gray-400">Course Instructor</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Course Features</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration_weeks} weeks of content
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {course.lessons?.length || 0} lessons
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Certificate of completion
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Full lifetime access
                </li>
              </ul>
              
              {!course.is_enrolled && (
                <Button 
                  variant="primary" 
                  className="w-full mt-6"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
