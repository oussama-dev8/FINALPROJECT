import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: '/api/auth',
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

// Authentication API service
const authApi = {
  // Register a new user
  register: async (userData) => {
    try {
      console.log('Registering with data:', userData); // Debug log
      
      const response = await api.post('/register/', {
        email: userData.email,
        username: userData.username, // Use the provided username
        password: userData.password,
        confirm_password: userData.confirmPassword,
        first_name: userData.name.split(' ')[0],
        last_name: userData.name.split(' ').slice(1).join(' ') || '',
        user_type: userData.role, // This should be either 'teacher' or 'student'
        bio: '',
        phone_number: '',
        // Add role-specific fields based on user type
        ...(userData.role === 'teacher' ? {
          specialization: '',
          experience: '',
          qualifications: ''
        } : {
          grade_level: '',
          school: '',
          learning_goals: ''
        })
      });
      
      console.log('Registration response:', response.data); // Debug log
      
      // Store tokens
      const { tokens } = response.data;
      if (userData.rememberMe) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      } else {
        sessionStorage.setItem('access_token', tokens.access);
        sessionStorage.setItem('refresh_token', tokens.refresh);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error); // Debug log
      throw handleApiError(error);
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      console.log('Login attempt with credentials:', { 
        email: credentials.email,
        password: credentials.password ? '********' : undefined,
        rememberMe: credentials.rememberMe
      });
      
      const response = await api.post('/login/', {
        email: credentials.email, // Backend expects 'email' field
        password: credentials.password
      });
      
      console.log('Login successful, response:', response.data);
      
      // Store tokens
      const { tokens } = response.data;
      if (credentials.rememberMe) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      } else {
        sessionStorage.setItem('access_token', tokens.access);
        sessionStorage.setItem('refresh_token', tokens.refresh);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error response:', error.response?.data);
      
      // Handle specific authentication errors
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid email or password');
        }
        
        if (error.response.data && error.response.data.detail) {
          throw new Error(error.response.data.detail);
        }
        
        if (error.response.data && typeof error.response.data === 'object') {
          const firstKey = Object.keys(error.response.data)[0];
          if (firstKey && error.response.data[firstKey]) {
            throw new Error(`${firstKey}: ${error.response.data[firstKey]}`);
          }
        }
      }
      
      throw handleApiError(error);
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken });
      }
      
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      return true;
    }
  },
  
  // Verify token validity
  verifyToken: async () => {
    try {
      const response = await api.get('/verify-token/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/profile/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      // Check if profileData is FormData
      const isFormData = profileData instanceof FormData;
      
      // Create config with appropriate headers for FormData
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};
      
      console.log('Sending profile update request with:', isFormData ? 'FormData' : 'JSON data');
      
      const response = await api.put('/profile/', profileData, config);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error);
      throw handleApiError(error);
    }
  },
  
  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/change-password/', {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/password-reset/', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Delete user account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/account/', {
        data: { password }
      });
      
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      
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

export default authApi; 