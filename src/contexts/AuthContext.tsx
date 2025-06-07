import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'teacher@darsy.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    userType: 'teacher',
    profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
    bio: 'Experienced mathematics teacher with 10+ years in education.',
    isVerified: true,
    specialization: 'Mathematics & Statistics',
    experience: '10 years',
    qualifications: 'M.Ed Mathematics, B.Sc Statistics',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    email: 'student@darsy.com',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    userType: 'student',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
    bio: 'Computer science student passionate about learning new technologies.',
    isVerified: true,
    gradeLevel: 'University',
    school: 'Cairo University',
    learningGoals: 'Master web development and data science',
    createdAt: '2024-02-10T10:30:00Z',
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('darsy_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('darsy_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      userType: userData.userType!,
      profilePicture: userData.profilePicture,
      bio: userData.bio,
      phoneNumber: userData.phoneNumber,
      isVerified: true,
      createdAt: new Date().toISOString(),
      ...userData,
    };
    
    setUser(newUser);
    localStorage.setItem('darsy_user', JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('darsy_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}