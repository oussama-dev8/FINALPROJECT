export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'teacher' | 'student';
  profilePicture?: string;
  bio?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: string;
  // Teacher-specific
  specialization?: string;
  experience?: string;
  qualifications?: string;
  // Student-specific
  gradeLevel?: string;
  school?: string;
  learningGoals?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  categoryId: string;
  category: string;
  thumbnail: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  maxStudents: number;
  currentStudents: number;
  status: 'draft' | 'published' | 'archived';
  rating: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  lessonType: 'video' | 'live' | 'reading' | 'quiz';
  order: number;
  durationMinutes: number;
  content?: string;
  videoUrl?: string;
  scheduledAt?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
  progressPercentage: number;
  completedAt?: string;
}

export interface VideoRoom {
  id: string;
  courseId: string;
  lessonId: string;
  roomId: string;
  hostId: string;
  title: string;
  isActive: boolean;
  participants: User[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}