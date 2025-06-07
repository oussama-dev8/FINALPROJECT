import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Calendar } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  showActions?: boolean;
  enrolled?: boolean;
}

export function CourseCard({ course, showActions = true, enrolled = false }: CourseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficultyLevel]}`}>
            {course.difficultyLevel}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">{course.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-primary-600 font-medium">{course.category}</span>
          {course.price === 0 ? (
            <span className="text-sm font-bold text-green-600">Free</span>
          ) : (
            <span className="text-sm font-bold text-gray-900">${course.price}</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.durationWeeks} weeks</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.currentStudents}/{course.maxStudents}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">
                {course.teacherName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span className="text-sm text-gray-600">{course.teacherName}</span>
          </div>
        </div>

        {enrolled && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-primary-600 font-medium">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="space-y-2">
            <Link
              to={`/course/${course.id}`}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{enrolled ? 'Continue Learning' : 'View Course'}</span>
            </Link>
            {enrolled && (
              <Link
                to={`/course/${course.id}/live`}
                className="w-full bg-accent-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-accent-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Join Live Session</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}