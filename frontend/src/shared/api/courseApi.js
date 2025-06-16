import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Courses API service
const courseApi = {
  // Course listing and filtering
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/courses/courses/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/courses/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new course (teachers only)
  createCourse: async (courseData) => {
    try {
      // Check if courseData contains a file (thumbnail)
      const isFormData = courseData instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      const response = await api.post('/courses/courses/', courseData, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update course (course owner only)
  updateCourse: async (courseId, courseData) => {
    try {
      // Check if courseData contains a file (thumbnail)
      const isFormData = courseData instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      const response = await api.put(`/courses/courses/${courseId}/`, courseData, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete course (course owner only)
  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/courses/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/courses/categories/');
      // Handle paginated response format
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      // Handle direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.error('Categories API returned unexpected format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array on error
      return [];
    }
  },

  // Teacher: Get my courses
  getTeacherCourses: async () => {
    try {
      const response = await api.get('/courses/my-courses/');
      
      // Handle different response formats
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Paginated response format
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        return response.data;
      } else {
        console.error('Unexpected response format from my-courses endpoint:', response.data);
        return [];
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Student: Get enrolled courses
  getEnrolledCourses: async () => {
    try {
      const response = await api.get('/courses/enrolled-courses/');
      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
      
      // Handle different response formats
      let courses = [];
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Paginated response format
        courses = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        courses = response.data;
      } else {
        console.error('Unexpected response format from enrolled-courses endpoint:', response.data);
        return [];
      }
      
      // Process courses to ensure they have all required fields
      return courses.map(enrollment => {
        // Extract course data from enrollment structure
        const courseData = enrollment.course;
        
        if (!courseData) {
          console.error('No course data found in enrollment:', enrollment);
          return null;
        }
        
        // Extract teacher data from course
        const teacherData = courseData.teacher;
        console.log('Course teacher data:', teacherData);
        
        const processedCourse = {
          // Use the actual course ID, not the enrollment ID
          id: courseData.id,
          title: courseData.title || courseData.name || 'Untitled Course',
          teacher_name: courseData.teacher_name || 
                       (teacherData ? teacherData.name || teacherData.full_name || teacherData.username : null) ||
                       'Unknown Teacher',
          progress: enrollment.progress_percentage || 0,
          thumbnail: courseData.thumbnail || null,
          // Include other course fields
          description: courseData.description,
          category: courseData.category,
          category_name: courseData.category_name,
          difficulty_level: courseData.difficulty_level,
          duration_weeks: courseData.duration_weeks,
          price: courseData.price,
          rating: courseData.rating,
          lessons: courseData.lessons,
          // Include enrollment specific data
          enrollment_id: enrollment.id,
          enrolled_at: enrollment.enrolled_at,
          enrollment_status: enrollment.status,
          completed_at: enrollment.completed_at
        };
        
        console.log('Processed course:', processedCourse);
        return processedCourse;
      }).filter(course => course !== null);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Student: Enroll in course
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post(`/courses/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Student: Unenroll from course
  unenrollFromCourse: async (courseId) => {
    try {
      const response = await api.post(`/courses/courses/${courseId}/unenroll/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course lessons
  getCourseLessons: async (courseId) => {
    try {
      const response = await api.get(`/courses/courses/${courseId}/lessons/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create lesson
  createLesson: async (courseId, lessonData) => {
    try {
      const isFormData = lessonData instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      const response = await api.post(`/courses/courses/${courseId}/lessons/`, lessonData, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get lesson by ID
  getLessonById: async (lessonId) => {
    try {
      const response = await api.get(`/courses/lessons/${lessonId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update lesson
  updateLesson: async (lessonId, lessonData) => {
    try {
      const isFormData = lessonData instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      const response = await api.put(`/courses/lessons/${lessonId}/`, lessonData, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete lesson
  deleteLesson: async (lessonId) => {
    try {
      const response = await api.delete(`/courses/lessons/${lessonId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Mark lesson as complete
  markLessonComplete: async (lessonId) => {
    try {
      const response = await api.post(`/courses/lessons/${lessonId}/complete/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/courses/courses/${courseId}/progress/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get student course progress (alias for getCourseProgress)
  getStudentCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/courses/courses/${courseId}/progress/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Save student notes (placeholder - to be implemented)
  saveStudentNotes: async (courseId, lessonId, notes) => {
    try {
      // This would be implemented when we have a notes API
      console.log('Saving notes for course:', courseId, 'lesson:', lessonId, 'notes:', notes);
      return { message: 'Notes saved successfully' };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course reviews
  getCourseReviews: async (courseId) => {
    try {
      const response = await api.get(`/courses/courses/${courseId}/reviews/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add course review
  addCourseReview: async (courseId, reviewData) => {
    try {
      const response = await api.post(`/courses/courses/${courseId}/reviews/`, reviewData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Helper function to handle API errors
function handleApiError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    console.log('API Error Status:', status);
    console.log('API Error Data:', data);
    
    // Format error message
    let errorMessage = 'An error occurred';
    
    if (data.detail) {
      errorMessage = data.detail;
    } else if (typeof data === 'object' && data !== null) {
      // Handle validation errors
      const firstErrorKey = Object.keys(data)[0];
      if (firstErrorKey && Array.isArray(data[firstErrorKey])) {
        errorMessage = `${firstErrorKey}: ${data[firstErrorKey][0]}`;
      } else if (firstErrorKey && typeof data[firstErrorKey] === 'string') {
        errorMessage = `${firstErrorKey}: ${data[firstErrorKey]}`;
      }
    }
    
    return new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    console.log('No response received:', error.request);
    return new Error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Request setup error:', error.message);
    return new Error('Request failed. Please try again.');
  }
}

export default courseApi; 