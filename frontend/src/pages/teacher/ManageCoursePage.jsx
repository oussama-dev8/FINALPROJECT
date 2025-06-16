import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  PencilIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ManageCoursePage = () => {
  console.log('ManageCoursePage rendered');
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Mock course data
  const course = {
    id: id,
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React including components, state, props, and hooks.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    students: 42,
    progress: 78,
    lastUpdated: '2 days ago',
    status: 'Published',
    price: 49.99,
    category: 'Web Development',
    level: 'Beginner',
    duration: '8 hours',
    lessons: 12,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Manage Course: {course.title}</h1>
        </div>
        <p className="mt-1 text-gray-400">Course ID: {course.id}</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <h2 className="text-lg font-medium text-white mb-4">Course Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Title</p>
            <p className="text-white">{course.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Description</p>
            <p className="text-gray-300">{course.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Students Enrolled</p>
              <p className="text-white">{course.students}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                {course.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-md font-medium text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
              <div className="flex items-center">
                <PencilIcon className="h-5 w-5 text-indigo-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-white">Edit Course Details</p>
                  <p className="text-xs text-gray-400">Update title, description, and settings</p>
                </div>
              </div>
            </button>
            <Link 
              to="/dashboard/teaching/1/content"
              className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="flex items-center">
                <PencilIcon className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-white">Manage Content</p>
                  <p className="text-xs text-gray-400">Add or edit course modules and lessons</p>
                </div>
              </div>
            </Link>
            <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-purple-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-white">Begin a Live Session</p>
                  <p className="text-xs text-gray-400">Start an interactive class with students</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCoursePage;
