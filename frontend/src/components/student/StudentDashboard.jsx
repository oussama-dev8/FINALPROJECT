import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseApi from '@/shared/api/courseApi';
import { FiStar, FiChevronRight } from 'react-icons/fi';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

// Sample course data with images from Unsplash
const courses = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    instructor: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1635776062360-af423902aff6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    progress: 75
  },
  {
    id: 2,
    title: 'Python for Data Science',
    instructor: 'Michael Chen',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    progress: 45
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Emma Wilson',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    progress: 90
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    instructor: 'David Kim',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    progress: 30
  },
  {
    id: 5,
    title: 'JavaScript Mastery',
    instructor: 'Alex Turner',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    progress: 60
  },
  {
    id: 6,
    title: 'Mobile App Development',
    instructor: 'Lisa Park',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    progress: 20
  }
];

function StudentDashboard({ user }) {
  const featuredCoursesRef = useRef(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured courses
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      setIsLoading(true);
      try {
        // Fetch all courses
        const coursesData = await courseApi.getCourses();
        
        // Extract courses array from response
        let allCourses = [];
        if (coursesData && coursesData.results && Array.isArray(coursesData.results)) {
          // Paginated response format
          allCourses = coursesData.results;
        } else if (Array.isArray(coursesData)) {
          // Direct array response
          allCourses = coursesData;
        }
        
        // Sort by rating and take top 10
        const topRatedCourses = [...allCourses]
          .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
          .slice(0, 10);
        
        setFeaturedCourses(topRatedCourses);
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedCourses();
  }, []);

  const scroll = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = 300; // Adjust this value to control scroll distance
      if (direction === 'left') {
        ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Helper function to render rating stars
  const renderRatingStars = (rating) => {
    const numericRating = parseFloat(rating) || 0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar 
            key={i} 
            className={`w-3 h-3 ${i < numericRating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-400">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-gray-300">Continue your learning journey</p>
      </div>

      {/* Featured Courses Section */}
      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-white flex items-center">
            <FiStar className="mr-2 text-yellow-400" />
            Featured Courses
          </h2>
          <Link to="/courses" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center">
            View All
            <FiChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="relative group">
          <button 
            onClick={() => scroll('left', featuredCoursesRef)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/90 rounded-full shadow-lg text-white hover:text-primary-400 transition-all duration-200 opacity-0 group-hover:opacity-100 ml-2"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
            <div 
                ref={featuredCoursesRef}
              className="flex pb-6 -mx-2 px-2 overflow-x-auto scrollbar-hide scroll-smooth"
            >
              <div className="flex space-x-6">
                  {featuredCourses.map((course) => (
                    <div key={`featured-${course.id}`} className="flex-shrink-0 w-72 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-primary-500/50 transition-all duration-200 shadow-lg hover:shadow-primary-500/10">
                    <div className="relative h-36 bg-gray-700 overflow-hidden">
                      <img 
                          src={course.thumbnail || DEFAULT_THUMBNAIL} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_THUMBNAIL;
                          }}
                      />
                        <div className="absolute top-2 right-2 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-md">
                          {renderRatingStars(course.rating)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{course.teacher_name}</p>
                      <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-primary-400">${parseFloat(course.price || 0).toFixed(2)}</span>
                          <Link 
                            to={`/courses/${course.id}`}
                            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors flex items-center"
                          >
                            View Course
                            <FiChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          
          <button 
            onClick={() => scroll('right', featuredCoursesRef)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/90 rounded-full shadow-lg text-white hover:text-primary-400 transition-all duration-200 opacity-0 group-hover:opacity-100 mr-2"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <h2 className="text-lg font-medium text-white mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Live Class - {item === 1 ? 'Introduction to React' : 'Advanced JavaScript'}</p>
                <p className="text-sm text-gray-400">Today at {item === 1 ? '2:00 PM' : '4:30 PM'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
