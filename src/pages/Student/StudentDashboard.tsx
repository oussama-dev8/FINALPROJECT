import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  Calendar, 
  Clock, 
  Trophy,
  TrendingUp,
  Target,
  Award,
  Star,
  Users,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockCourses, mockEnrollments, mockLessons } from '../../data/mockData';
import { CourseCard } from '../../components/Course/CourseCard';

export function StudentDashboard() {
  const { user } = useAuth();

  const enrolledCourses = mockCourses.filter(course => 
    mockEnrollments.some(enrollment => 
      enrollment.courseId === course.id && enrollment.studentId === user?.id
    )
  );

  const upcomingLessons = mockLessons.filter(lesson => 
    lesson.lessonType === 'live' && lesson.scheduledAt
  ).slice(0, 2);

  const totalProgress = mockEnrollments.reduce((sum, enrollment) => 
    sum + enrollment.progressPercentage, 0
  ) / mockEnrollments.length || 0;

  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: BookOpen,
      color: 'bg-primary-50 text-primary-600'
    },
    {
      title: 'Completed Lessons',
      value: '24',
      icon: Trophy,
      color: 'bg-accent-50 text-accent-600'
    },
    {
      title: 'Hours Learned',
      value: '48',
      icon: Clock,
      color: 'bg-secondary-50 text-secondary-600'
    },
    {
      title: 'Average Progress',
      value: `${Math.round(totalProgress)}%`,
      icon: Target,
      color: 'bg-yellow-50 text-yellow-600'
    }
  ];

  const achievements = [
    { title: 'First Course Completed', icon: Award, earned: true },
    { title: 'Perfect Attendance', icon: Calendar, earned: true },
    { title: 'Fast Learner', icon: TrendingUp, earned: false },
    { title: 'Course Collector', icon: BookOpen, earned: false }
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
            Continue your learning journey. You're doing great!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                <Link
                  to="/student/my-courses"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {enrolledCourses.slice(0, 2).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrolled={true}
                    showActions={true}
                  />
                ))}
              </div>
            </div>

            {/* Upcoming Live Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Live Sessions</h2>
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{lesson.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Today</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>2:00 PM</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>32 joining</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/video-room/${lesson.id}`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Join</span>
                    </Link>
                  </div>
                ))}
                {upcomingLessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming sessions</p>
                    <Link
                      to="/student/courses"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Browse more courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Streak */}
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Learning Streak</h3>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">7 Days</div>
              <p className="text-primary-100 text-sm">
                Keep it up! You're on a roll.
              </p>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <achievement.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm ${
                      achievement.earned ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/student/courses"
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium">Browse Courses</span>
                </Link>
                <Link
                  to="/student/profile"
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <Target className="w-5 h-5 text-accent-600" />
                  <span className="text-sm font-medium">Set Learning Goals</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}