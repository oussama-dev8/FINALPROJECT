import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: '/api/video-rooms',
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

// Handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.detail || 
                   error.response.data?.message || 
                   `Server error: ${error.response.status}`;
    throw new Error(message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Network error: Unable to connect to server');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

const videoRoomsApi = {
  // Get user's rooms
  getRooms: async () => {
    try {
      const response = await api.get('/rooms/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Create new room
  createRoom: async (roomData) => {
    try {
      const response = await api.post('/rooms/', roomData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get room details
  getRoomDetails: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get room participants
  getRoomParticipants: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}/participants/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Join room
  joinRoom: async (roomId) => {
    try {
      const response = await api.post(`/rooms/${roomId}/join/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Leave room
  leaveRoom: async (roomId) => {
    try {
      const response = await api.post(`/rooms/${roomId}/leave/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update participant status
  updateParticipantStatus: async (roomId, status) => {
    try {
      const response = await api.post(`/rooms/${roomId}/update-status/`, status);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Generate tokens
  generateToken: async (roomId, tokenType = 'rtc') => {
    try {
      const response = await api.post('/token/', { 
        room_id: roomId, 
        token_type: tokenType 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default videoRoomsApi; 