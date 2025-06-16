import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import courseApi from '../api/courseApi';

// Create the context
const CourseContext = createContext();

// Custom hook to use the course context
export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

// Provider component
export const CourseProvider = ({ children }) => {
  const { isAuthenticated, isStudent } = useAuth();
  
  // State for enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use a ref to track if we've already fetched courses
  const hasFetchedRef = useRef(false);
  // Use a ref to track if a fetch is in progress
  const isFetchingRef = useRef(false);

  // Fetch enrolled courses when authenticated
  useEffect(() => {
    // Only fetch if we have a valid token and the user is a student
    if (!isAuthenticated || !isStudent) {
      setEnrolledCourses([]);
      hasFetchedRef.current = false;
      return;
    }

    const fetchEnrolledCourses = async () => {
      // If already fetching or already fetched, don't fetch again
      if (isFetchingRef.current || hasFetchedRef.current) {
        return;
      }
      
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const courses = await courseApi.getEnrolledCourses();
        console.log('API Response - Enrolled courses:', courses);
        setEnrolledCourses(courses || []);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError(err.message || 'Failed to load enrolled courses');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchEnrolledCourses();
  }, [isAuthenticated, isStudent]);

  // Add a course to enrolled courses
  const addEnrolledCourse = (course) => {
    // Only add if authenticated and student
    if (!isAuthenticated || !isStudent) {
      return;
    }

    // Check if course is already in the list
    if (!enrolledCourses.some(c => c.id === course.id)) {
      // Add progress field if not present
      const courseWithProgress = {
        ...course,
        progress: course.progress || 0
      };
      setEnrolledCourses(prev => [...prev, courseWithProgress]);
    }
  };

  // Remove a course from enrolled courses
  const removeEnrolledCourse = (courseId) => {
    setEnrolledCourses(prev => prev.filter(course => {
      // Now course.id is the actual course ID (not enrollment ID)
      return course.id !== courseId;
    }));
  };

  // Get enrolled courses by status
  const getEnrolledCoursesByStatus = () => {
    console.log('Current enrolledCourses state:', enrolledCourses);
    const inProgress = [];
    const completed = [];

    enrolledCourses.forEach(course => {
      // Course data is now properly structured with course.id being the actual course ID
      const processedCourse = {
        ...course,
        title: course.title || 'Untitled Course',
        teacher_name: course.teacher_name || 'Unknown Teacher',
        progress: course.progress || 0
      };
      
      if (processedCourse.progress === 100) {
        completed.push(processedCourse);
      } else {
        inProgress.push(processedCourse);
      }
    });

    return {
      'in-progress': inProgress,
      'completed': completed,
      'saved': [] // To be implemented with wishlist feature
    };
  };

  // Check if user is enrolled in a specific course
  const isEnrolledInCourse = (courseId) => {
    if (!isAuthenticated || !isStudent) {
      return false;
    }
    return enrolledCourses.some(course => {
      // Now course.id is the actual course ID (not enrollment ID)
      return course.id === parseInt(courseId);
    });
  };

  // Refresh enrolled courses - explicitly called when needed
  const refreshEnrolledCourses = async () => {
    // Only refresh if authenticated and student
    if (!isAuthenticated || !isStudent) {
      return;
    }
    
    // Don't allow concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    try {
      const courses = await courseApi.getEnrolledCourses();
      setEnrolledCourses(courses || []);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Error refreshing enrolled courses:', err);
      // Don't update state on error
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Context value
  const value = {
    enrolledCourses,
    loading,
    error,
    addEnrolledCourse,
    removeEnrolledCourse,
    getEnrolledCoursesByStatus,
    isEnrolledInCourse,
    refreshEnrolledCourses
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseContext; 