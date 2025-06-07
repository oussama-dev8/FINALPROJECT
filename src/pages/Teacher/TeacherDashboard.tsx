import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Play,
  Eye,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockCourses, mockLessons } from '../../data/mockData';

export function TeacherDashboard() {
  const { user } = useAuth();

  const teacherCourses = mockCourses.filter(course => course.teacherId === user?.id);
  const upcomingLessons = mockLessons.filter(lesson => 
    lesson.lessonType === 'live' && lesson.scheduledAt
  ).slice(0, 3);

  const stats = [
    {
      title: 'Total Courses',
      value: teacherCourses.length,
      icon: BookOpen,
      color: 'bg-primary-50 text-primary-600',
      trend: '+2 this month'
    },
    {
      title: 'Total Students',
      value: teacherCourses.reduce((sum, course) => sum + course.currentStudents, 0),
      icon: Users,
      color: 'bg-accent-50 text-accent-600',
      trend: '+12 this week'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      icon: Star,
      color: 'bg-yellow-50 text-yellow-600',
      trend: '+0.2 this month'
    },
    {
      title: 'Live Sessions',
      value: upcomingLessons.length,
      icon: Play,
      color: 'bg-secondary-50 text-secondary-600',
      trend: '3 upcoming'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/teacher/courses/new"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Course</span>
            </Link>
            <Link
              to="/teacher/live"
              className="bg-accent-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-700 transition-colors flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Live Session</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
              <div className="text-xs text-green-600 font-medium">{stat.trend}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                <Link
                  to="/teacher/courses"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {teacherCourses.slice(0, 4).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{course.currentStudents} students</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/teacher/courses/${course.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/teacher/courses/${course.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 border border-gray-100 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{lesson.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Today</span>
                      <Clock className="w-4 h-4" />
                      <span>2:00 PM</span>
                    </div>
                    <Link
                      to={`/video-room/${lesson.id}`}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Session</span>
                    </Link>
                  </div>
                ))}
                {upcomingLessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Live Sessions</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Students</span>
                  <span className="font-medium text-green-600">+12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Views</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Rating</span>
                  <span className="font-medium">4.8 ⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}