import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiEdit, 
  FiPlus, 
  FiUsers, 
  FiBook, 
  FiClock, 
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiSettings,
  FiBarChart,
  FiPaperclip,
  FiTrendingUp,
  FiStar,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiVideo,
  FiFileText
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import videoRoomsApi from '@/shared/api/videoRoomsApi';
import { useAuth } from '@/shared/context/AuthContext';

function TeacherCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    if (!isTeacher) {
      navigate('/dashboard');
      return;
    }
    
    fetchCourseDetails();
  }, [id, isTeacher, navigate]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await courseApi.getCourseById(id);
      setCourse(courseData);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      const updatedCourse = await courseApi.updateCourse(id, {
        status: newStatus
      });
      setCourse(updatedCourse);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course status');
    }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseApi.deleteCourse(id);
        navigate('/dashboard/teacher/courses');
      } catch (err) {
        console.error('Error deleting course:', err);
        setError('Failed to delete course');
      }
    }
  };

  const handleStartLiveSession = async () => {
    try {
      setCreatingRoom(true);
      
      const roomData = {
        course: parseInt(id),
        title: `${course.title} - Live Session`,
        description: `Interactive live session for ${course.title}`,
        max_participants: 50
      };
      
      const newRoom = await videoRoomsApi.createRoom(roomData);
      
      // Navigate to the video room
      navigate(`/dashboard/video-room/${newRoom.id}`);
      
    } catch (err) {
      console.error('Error creating live session:', err);
      setError('Failed to start live session');
    } finally {
      setCreatingRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-800 text-red-200 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          Course not found
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBook },
    { id: 'lessons', label: 'Lessons', icon: FiClock },
    { id: 'students', label: 'Students', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-16">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiBook className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white leading-tight mb-2">{course.title}</h1>
                  <p className="text-gray-400">Manage your course content and track student progress</p>
                </div>
              </div>
              
              <div className="flex items-center flex-wrap gap-4 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm ${
                  course.status === 'published'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  {course.status === 'published' ? <FiEye className="h-4 w-4" /> : <FiEyeOff className="h-4 w-4" />}
                  <span className="font-medium">{course.status === 'published' ? 'Published' : 'Draft'}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                  <FiBook className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-gray-300">{course.lessons?.length || 0} Lessons</span>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                  <FiUsers className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-gray-300">{course.enrolled_students_count || 0} Students</span>
                </div>
                
                {course.category?.name && (
                  <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                    <FiFileText className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-medium text-gray-300">{course.category.name}</span>
                  </div>
                )}
              </div>
              
              {course.description && (
                <p className="text-gray-300 leading-relaxed max-w-3xl">{course.description}</p>
              )}
            </div>
            
            <div className="lg:w-80">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5 text-primary-400" />
                  Quick Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <div className="text-2xl font-bold text-primary-400 mb-1">
                      {course.lessons?.length || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Lessons</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {course.enrolled_students_count || 0}
                    </div>
                    <div className="text-xs text-gray-400">Students</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Price</span>
                    <span className="text-white font-medium flex items-center">
                      <FiDollarSign className="h-4 w-4 mr-1" />
                      {course.price ? `${course.price}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Level</span>
                    <span className="text-white font-medium capitalize">{course.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Duration</span>
                    <span className="text-white font-medium">{course.duration_weeks} weeks</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleStartLiveSession}
                  disabled={creatingRoom}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-200"
                >
                  <FiVideo className="mr-2 h-4 w-4" />
                  {creatingRoom ? 'Starting...' : 'Start Live Session'}
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleTogglePublish}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                >
                  {course.status === 'published' ? <FiEyeOff className="mr-2 h-4 w-4" /> : <FiEye className="mr-2 h-4 w-4" />}
                  {course.status === 'published' ? 'Unpublish Course' : 'Publish Course'}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link to={`/dashboard/teacher/courses/${id}/edit`}>
                    <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200">
                      <FiEdit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  
                  <Link to={`/dashboard/teacher/courses/${id}/lessons/new`}>
                    <Button variant="outline" className="w-full border-primary-500/50 text-primary-400 hover:bg-primary-500/10 transition-all duration-200">
                      <FiPlus className="mr-2 h-4 w-4" /> Lesson
                    </Button>
                  </Link>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleDeleteCourse}
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" /> Delete Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Enhanced Tabs */}
      <div className="mb-8">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/30">
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/30">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                  <FiFileText className="mr-3 h-6 w-6 text-primary-400" />
                  Course Description
                </h2>
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {course.description || 'No description provided for this course yet. Add a compelling description to help students understand what they will learn.'}
                  </p>
                </div>
              </div>
              
              {/* Course Content Overview */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/30">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                  <FiBook className="mr-3 h-6 w-6 text-primary-400" />
                  Content Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-xl p-6 border border-primary-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <FiBook className="h-8 w-8 text-primary-400" />
                      <span className="text-3xl font-bold text-primary-400">{course.lessons?.length || 0}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Total Lessons</h3>
                    <p className="text-gray-400 text-sm">Structured learning content</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <FiUsers className="h-8 w-8 text-green-400" />
                      <span className="text-3xl font-bold text-green-400">{course.enrolled_students_count || 0}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Active Students</h3>
                    <p className="text-gray-400 text-sm">Currently enrolled learners</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <FiStar className="h-8 w-8 text-yellow-400" />
                      <span className="text-3xl font-bold text-yellow-400">{course.rating || '4.5'}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Course Rating</h3>
                    <p className="text-gray-400 text-sm">Student feedback score</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/30">
                <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                  <FiBarChart className="mr-2 h-5 w-5 text-primary-400" />
                  Course Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400 flex items-center">
                      <FiDollarSign className="mr-2 h-4 w-4" />
                      Price
                    </span>
                    <span className="text-white font-medium">
                      {course.price ? `$${course.price}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400 flex items-center">
                      <FiTrendingUp className="mr-2 h-4 w-4" />
                      Level
                    </span>
                    <span className="text-white font-medium capitalize">{course.level}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400 flex items-center">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      Duration
                    </span>
                    <span className="text-white font-medium">{course.duration_weeks} weeks</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400 flex items-center">
                      <FiFileText className="mr-2 h-4 w-4" />
                      Category
                    </span>
                    <span className="text-white font-medium">{course.category?.name || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/30">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center">
                  <FiSettings className="mr-2 h-5 w-5 text-primary-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to={`/dashboard/teacher/courses/${id}/edit`} className="block">
                    <div className="flex items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <FiEdit className="mr-3 h-4 w-4 text-primary-400" />
                      <span className="text-gray-300">Edit Course Details</span>
                    </div>
                  </Link>
                  <Link to={`/dashboard/teacher/courses/${id}/lessons/new`} className="block">
                    <div className="flex items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <FiPlus className="mr-3 h-4 w-4 text-green-400" />
                      <span className="text-gray-300">Add New Lesson</span>
                    </div>
                  </Link>
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <FiBarChart className="mr-3 h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">View Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/30">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FiBook className="mr-3 h-6 w-6 text-primary-400" />
                Course Lessons
                <span className="ml-3 bg-primary-500/20 text-primary-400 text-sm px-3 py-1 rounded-full">
                  {course.lessons?.length || 0}
                </span>
              </h2>
              <Link to={`/dashboard/teacher/courses/${id}/lessons/new`}>
                <Button variant="primary" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg hover:shadow-primary-500/25 transition-all duration-200">
                  <FiPlus className="mr-2 h-4 w-4" /> Add Lesson
                </Button>
              </Link>
            </div>
            
            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-6">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="group p-6 bg-gray-700/30 rounded-2xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                          {lesson.order || index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">{lesson.title}</h3>
                          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center bg-gray-600/50 px-3 py-1 rounded-lg">
                              <FiClock className="mr-1.5 h-3 w-3" />
                              {lesson.duration_minutes || 10} min
                            </span>
                            <span className="flex items-center bg-gray-600/50 px-3 py-1 rounded-lg capitalize">
                              <FiBook className="mr-1.5 h-3 w-3" />
                              {lesson.lesson_type}
                            </span>
                            {lesson.video_url && (
                              <span className="flex items-center bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">
                                <FiVideo className="mr-1.5 h-3 w-3" />
                                Video
                              </span>
                            )}
                            {lesson.materials && lesson.materials.length > 0 && (
                              <span className="flex items-center bg-green-500/20 text-green-400 px-3 py-1 rounded-lg">
                                <FiDownload className="mr-1.5 h-3 w-3" />
                                {lesson.materials.length} Material{lesson.materials.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-gray-300 leading-relaxed">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${
                          lesson.is_published 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        }`}>
                          {lesson.is_published ? 'Published' : 'Draft'}
                        </span>
                        <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200">
                          <FiEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lesson Materials */}
                    {lesson.materials && lesson.materials.length > 0 && (
                      <div className="mt-6 pl-16">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                          <FiDownload className="mr-2 h-4 w-4 text-primary-400" />
                          Attached Materials:
                        </h4>
                        <div className="grid gap-3">
                          {lesson.materials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-600/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-lg flex items-center justify-center border border-primary-500/30">
                                  <FiPaperclip className="h-3 w-3 text-primary-400" />
                                </div>
                                <div>
                                  <span className="text-white font-medium">{material.title}</span>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {material.file_type?.toUpperCase() || 'FILE'} • {(material.file_size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <a 
                                href={material.file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 transition-colors"
                              >
                                <FiDownload className="h-4 w-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiBook className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-3">No lessons yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">Start building your course by adding your first lesson. Create engaging content to help your students learn effectively.</p>
                <Link to={`/dashboard/teacher/courses/${id}/lessons/new`}>
                  <Button variant="primary" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg hover:shadow-primary-500/25 transition-all duration-200">
                    <FiPlus className="mr-2 h-4 w-4" /> Add First Lesson
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/30">
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
              <FiUsers className="mr-3 h-6 w-6 text-primary-400" />
              Enrolled Students
              <span className="ml-3 bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
                {course.enrolled_students?.length || 0}
              </span>
            </h2>
            
            {course.enrolled_students && course.enrolled_students.length > 0 ? (
              <div className="space-y-6">
                {course.enrolled_students.map((student) => (
                  <div
                    key={student.id}
                    className="group p-6 bg-gray-700/30 rounded-2xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {student.first_name?.[0] || 'S'}{student.last_name?.[0] || 'T'}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-primary-300 transition-colors">
                            {student.full_name || `${student.first_name} ${student.last_name}`}
                          </h3>
                          <p className="text-gray-400 mb-2">{student.email}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center bg-gray-600/50 px-3 py-1 rounded-lg">
                              <FiCalendar className="mr-1.5 h-3 w-3" />
                              Enrolled {new Date(student.enrolled_at || Date.now()).toLocaleDateString()}
                            </span>
                            <span className="flex items-center bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">
                              <FiTrendingUp className="mr-1.5 h-3 w-3" />
                              Active Learner
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-3">
                          <p className="text-sm text-gray-400 mb-1">Course Progress</p>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-lg font-bold text-primary-400">{student.progress || 0}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {Math.round(((student.progress || 0) / 100) * (course.lessons?.length || 0))} of {course.lessons?.length || 0} lessons
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiUsers className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-3">No students enrolled yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">Students will appear here once they enroll in your course. Share your course to start building your learning community.</p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" className="border-primary-500/50 text-primary-400 hover:bg-primary-500/10 transition-all duration-200">
                    <FiUsers className="mr-2 h-4 w-4" />
                    Invite Students
                  </Button>
                  <Button variant="primary" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg hover:shadow-primary-500/25 transition-all duration-200">
                    <FiEye className="mr-2 h-4 w-4" />
                    Share Course
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/30">
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
              <FiBarChart className="mr-3 h-6 w-6 text-primary-400" />
              Course Analytics
              <span className="ml-3 bg-blue-500/20 text-blue-400 text-sm px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-xl p-6 border border-primary-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="h-8 w-8 text-primary-400" />
                  <span className="text-2xl font-bold text-primary-400">{course.enrolled_students_count || 0}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Total Enrollments</h3>
                <p className="text-gray-400 text-sm">All-time student count</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FiTrendingUp className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">85%</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Completion Rate</h3>
                <p className="text-gray-400 text-sm">Average student progress</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FiStar className="h-8 w-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">{course.rating || '4.5'}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Average Rating</h3>
                <p className="text-gray-400 text-sm">Student feedback score</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FiClock className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold text-blue-400">2.5h</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Avg. Study Time</h3>
                <p className="text-gray-400 text-sm">Per student per week</p>
              </div>
            </div>
            
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiBarChart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">Detailed Analytics Coming Soon</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Get comprehensive insights into student engagement, lesson performance, and course effectiveness with advanced analytics dashboard.</p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-all duration-200">
                  <FiBarChart className="mr-2 h-4 w-4" />
                  Request Beta Access
                </Button>
                <Button variant="primary" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg hover:shadow-primary-500/25 transition-all duration-200">
                  <FiTrendingUp className="mr-2 h-4 w-4" />
                  View Basic Stats
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default TeacherCourseDetailPage;
