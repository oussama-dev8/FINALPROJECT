import { Course, Lesson, Enrollment, VideoRoom, ChatMessage } from '../types';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Mathematics for Engineers',
    description: 'Comprehensive course covering calculus, linear algebra, and differential equations for engineering applications.',
    teacherId: '1',
    teacherName: 'Sarah Johnson',
    categoryId: '1',
    category: 'Mathematics',
    thumbnail: 'https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
    difficultyLevel: 'advanced',
    durationWeeks: 12,
    maxStudents: 50,
    currentStudents: 32,
    status: 'published',
    rating: 4.8,
    price: 0,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-01T12:00:00Z',
  },
  {
    id: '2',
    title: 'Introduction to Data Science',
    description: 'Learn the fundamentals of data science including Python, statistics, and machine learning basics.',
    teacherId: '1',
    teacherName: 'Sarah Johnson',
    categoryId: '2',
    category: 'Computer Science',
    thumbnail: 'https://images.pexels.com/photos/7947689/pexels-photo-7947689.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
    difficultyLevel: 'beginner',
    durationWeeks: 8,
    maxStudents: 30,
    currentStudents: 18,
    status: 'published',
    rating: 4.6,
    price: 0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-05T14:30:00Z',
  },
  {
    id: '3',
    title: 'Web Development Fundamentals',
    description: 'Master HTML, CSS, JavaScript, and React to build modern web applications from scratch.',
    teacherId: '1',
    teacherName: 'Sarah Johnson',
    categoryId: '2',
    category: 'Computer Science',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
    difficultyLevel: 'intermediate',
    durationWeeks: 10,
    maxStudents: 40,
    currentStudents: 25,
    status: 'published',
    rating: 4.9,
    price: 0,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-08T11:15:00Z',
  },
  {
    id: '4',
    title: 'Physics for Future Scientists',
    description: 'Explore classical mechanics, thermodynamics, and quantum physics with hands-on experiments.',
    teacherId: '1',
    teacherName: 'Sarah Johnson',
    categoryId: '3',
    category: 'Physics',
    thumbnail: 'https://images.pexels.com/photos/8926547/pexels-photo-8926547.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
    difficultyLevel: 'intermediate',
    durationWeeks: 14,
    maxStudents: 25,
    currentStudents: 15,
    status: 'published',
    rating: 4.7,
    price: 0,
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-02-28T16:45:00Z',
  }
];

export const mockLessons: Lesson[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Introduction to Calculus',
    description: 'Understanding limits, derivatives and their applications.',
    lessonType: 'live',
    order: 1,
    durationMinutes: 90,
    scheduledAt: '2024-12-20T14:00:00Z',
    isPublished: true,
    createdAt: '2024-01-15T08:30:00Z',
  },
  {
    id: '2',
    courseId: '1',
    title: 'Linear Algebra Basics',
    description: 'Vectors, matrices, and linear transformations.',
    lessonType: 'video',
    order: 2,
    durationMinutes: 75,
    videoUrl: 'https://example.com/video1',
    isPublished: true,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '3',
    courseId: '2',
    title: 'Python Programming Basics',
    description: 'Getting started with Python for data science.',
    lessonType: 'live',
    order: 1,
    durationMinutes: 120,
    scheduledAt: '2024-12-21T10:00:00Z',
    isPublished: true,
    createdAt: '2024-02-01T10:30:00Z',
  }
];

export const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    studentId: '2',
    courseId: '1',
    enrolledAt: '2024-02-15T12:00:00Z',
    status: 'active',
    progressPercentage: 65,
  },
  {
    id: '2',
    studentId: '2',
    courseId: '2',
    enrolledAt: '2024-02-20T14:30:00Z',
    status: 'active',
    progressPercentage: 30,
  }
];

export const mockVideoRooms: VideoRoom[] = [
  {
    id: '1',
    courseId: '1',
    lessonId: '1',
    roomId: 'darsy_room_1',
    hostId: '1',
    title: 'Introduction to Calculus - Live Session',
    isActive: true,
    participants: [],
    createdAt: '2024-12-20T13:45:00Z',
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    roomId: 'darsy_room_1',
    userId: '2',
    userName: 'Ahmed Hassan',
    message: 'Hello everyone! Excited for today\'s lesson.',
    timestamp: '2024-12-20T14:05:00Z',
    type: 'text',
  },
  {
    id: '2',
    roomId: 'darsy_room_1',
    userId: '1',
    userName: 'Sarah Johnson',
    message: 'Welcome Ahmed! Let\'s start with the basics of calculus.',
    timestamp: '2024-12-20T14:06:00Z',
    type: 'text',
  }
];

export const categories = [
  { id: '1', name: 'Mathematics', count: 1 },
  { id: '2', name: 'Computer Science', count: 2 },
  { id: '3', name: 'Physics', count: 1 },
  { id: '4', name: 'Chemistry', count: 0 },
  { id: '5', name: 'Biology', count: 0 },
];

export const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', count: 1 },
  { value: 'intermediate', label: 'Intermediate', count: 2 },
  { value: 'advanced', label: 'Advanced', count: 1 },
];