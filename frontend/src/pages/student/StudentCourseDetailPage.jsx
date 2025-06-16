import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiBook, FiAward, FiVideo, FiDownload, FiPlay, FiCheckCircle, FiStar, FiCalendar, FiMessageCircle, FiTrendingUp, FiList, FiEye, FiEyeOff, FiSave, FiRefreshCw } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import videoRoomsApi from '@/shared/api/videoRoomsApi';
import { useAuth } from '@/shared/context/AuthContext';
import { useCourses } from '@/shared/context/CourseContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

function StudentCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStudent } = useAuth();
  const { isEnrolledInCourse } = useCourses();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [refreshingRooms, setRefreshingRooms] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!isStudent) {
        navigate('/dashboard');
        return;
      }
      
      setLoading(true);
      try {
        const courseData = await courseApi.getCourseById(id);
        
        // Check if student is enrolled
        if (!isEnrolledInCourse(id)) {
          navigate(`/courses/${id}`);
          return;
        }
        
        setCourse(courseData);
        
        // Set active lesson to the first incomplete lesson or first lesson
        if (courseData.lessons && courseData.lessons.length > 0) {
          // Fetch student progress for this course
          const progressData = await courseApi.getStudentCourseProgress(id);
          setProgress(progressData.progress || 0);
          setCompletedLessons(progressData.completed_lesson_ids || []);
          
          // Find first incomplete lesson
          const firstIncompleteLesson = courseData.lessons.find(
            lesson => !progressData.completed_lesson_ids?.includes(lesson.id)
          );
          
          setActiveLesson(firstIncompleteLesson || courseData.lessons[0]);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isStudent, isEnrolledInCourse, navigate]);

  // Fetch available rooms periodically
  useEffect(() => {
    if (course) {
      fetchAvailableRooms();
      // Remove continuous polling - only fetch once when component mounts
    }
  }, [course, id]);

  // Mark lesson as complete
  const handleMarkComplete = async (lessonId) => {
    try {
      await courseApi.markLessonComplete(lessonId);
      
      // Update local state
      setCompletedLessons(prev => [...prev, lessonId]);
      
      // Recalculate progress
      if (course?.lessons) {
        const newProgress = Math.round(
          ((completedLessons.length + 1) / course.lessons.length) * 100
        );
        setProgress(newProgress);
      }
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      alert('Failed to mark lesson as complete: ' + (err.message || 'An error occurred'));
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    try {
      await courseApi.saveStudentNotes(id, activeLesson.id, notes);
      alert('Notes saved successfully!');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes: ' + (err.message || 'An error occurred'));
    }
  };

  // Fetch available live sessions
  const fetchAvailableRooms = async () => {
    try {
      setRefreshingRooms(true);
      const roomsResponse = await videoRoomsApi.getRooms();
      // Filter rooms for this course that are active
      const courseRooms = roomsResponse.results?.filter(room => 
        room.course?.id === parseInt(id) && room.is_active
      ) || [];
      setAvailableRooms(courseRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setRefreshingRooms(false);
    }
  };

  // Manual refresh function
  const handleRefreshLiveSessions = () => {
    fetchAvailableRooms();
  };

  // Join live session
  const handleJoinLiveSession = async (roomId) => {
    try {
      setJoiningRoom(true);
      await videoRoomsApi.joinRoom(roomId);
      navigate(`/dashboard/video-room/${roomId}`);
    } catch (err) {
      console.error('Error joining live session:', err);
      alert('Failed to join live session: ' + (err.message || 'An error occurred'));
    } finally {
      setJoiningRoom(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-400">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load course</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard/my-courses')}
          >
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  // If course not found
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <p className="text-gray-400 mb-6">The course you're looking for doesn't exist or you're not enrolled.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard/my-courses')}
          >
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-16">
      {/* Course Header */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <FiBook className="h-6 w-6 text-white" />
                </div>
            <div>
                  <h1 className="text-4xl font-bold text-white leading-tight">{course.title}</h1>
                  <p className="text-gray-400 mt-1">Continue your learning journey</p>
                </div>
              </div>
              
              <div className="flex items-center flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                  <FiBook className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-gray-300">{course.lessons?.length || 0} Lessons</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                  <FiClock className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-gray-300">{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                  <FiStar className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-300">{course.rating || 0} Rating</span>
                </div>
              </div>
              
              {course.description && (
                <p className="text-gray-300 leading-relaxed max-w-2xl">{course.description}</p>
              )}
            </div>
            
            <div className="lg:w-80">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Progress</h3>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                    {progress}%
                  </span>
                </div>
                
                <div className="relative mb-6">
                  <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{completedLessons.length}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-300">{(course.lessons?.length || 0) - completedLessons.length}</div>
                    <div className="text-xs text-gray-400">Remaining</div>
                  </div>
                </div>
                
                {/* Live Session Section */}
                <div className="mb-4">
                  {/* Live Session Alert */}
                  {availableRooms.length > 0 ? (
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-400 font-medium text-sm">Live Session Available</span>
                        </div>
                        <button
                          onClick={handleRefreshLiveSessions}
                          disabled={refreshingRooms}
                          className="text-green-400 hover:text-green-300 transition-colors p-1 rounded"
                          title="Refresh live sessions"
                        >
                          <FiRefreshCw className={`h-4 w-4 ${refreshingRooms ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">Your instructor is hosting a live session right now!</p>
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => handleJoinLiveSession(availableRooms[0].id)}
                        disabled={joiningRoom}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-200"
                      >
                        <FiVideo className="mr-2 h-4 w-4" />
                        {joiningRoom ? 'Joining...' : 'Join Live Session'}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span className="text-gray-400 font-medium text-sm">No Live Sessions</span>
                        </div>
                        <button
                          onClick={handleRefreshLiveSessions}
                          disabled={refreshingRooms}
                          className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded"
                          title="Check for live sessions"
                        >
                          <FiRefreshCw className={`h-4 w-4 ${refreshingRooms ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <p className="text-gray-500 text-sm">No live sessions are currently active. Click refresh to check for new sessions.</p>
                    </div>
                  )}
                </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                    className="flex-1 text-sm border-gray-600 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200"
                  onClick={() => window.open('/dashboard/messages', '_blank')}
                >
                    <FiMessageCircle className="mr-2 h-4 w-4" />
                  Ask Instructor
                </Button>
                <Button 
                  variant="primary"
                    className="flex-1 text-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                  onClick={() => {
                    if (activeLesson) {
                      const element = document.getElementById(`lesson-${activeLesson.id}`);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                    <FiPlay className="mr-2 h-4 w-4" />
                  Resume Learning
                </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Active Lesson */}
            {activeLesson && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700/30 mb-8">
                {/* Video Section - Only show if video exists */}
                {activeLesson.video_url && (
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-900 to-gray-800 relative">
                    <iframe 
                      src={activeLesson.video_url} 
                      title={activeLesson.title}
                      className="w-full h-full rounded-t-2xl"
                      allowFullScreen
                    ></iframe>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-white text-sm font-medium flex items-center">
                        <FiVideo className="mr-1.5 h-3 w-3" />
                        Video Lesson
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Lesson Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {course.lessons?.findIndex(l => l.id === activeLesson.id) + 1 || 1}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white leading-tight">{activeLesson.title}</h2>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center">
                              <FiClock className="mr-1.5 h-3 w-3" />
                              {activeLesson.duration_minutes || 10} min
                            </span>
                            <span className="capitalize flex items-center">
                              <FiBook className="mr-1.5 h-3 w-3" />
                              {activeLesson.lesson_type}
                            </span>
                          </div>
                        </div>
                      </div>
                </div>
                
                    {/* Completion Status */}
                    <div className="flex items-center gap-3">
                    {completedLessons.includes(activeLesson.id) ? (
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center backdrop-blur-sm">
                          <FiCheckCircle className="mr-2 h-4 w-4" /> 
                          Completed
                        </div>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleMarkComplete(activeLesson.id)}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                      >
                          <FiCheckCircle className="mr-2 h-4 w-4" />
                          Mark Complete
                      </Button>
                    )}
                    </div>
                  </div>
                  
                  {/* Lesson Description */}
                  {activeLesson.description && (
                    <div className="bg-gray-700/30 rounded-xl p-6 mb-6 border border-gray-600/30">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <FiBook className="mr-2 h-5 w-5 text-primary-400" />
                        Lesson Overview
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{activeLesson.description}</p>
                    </div>
                  )}
                  
                  {/* Lesson Materials */}
                  {activeLesson.materials && activeLesson.materials.length > 0 && (
                    <div className="bg-gray-700/30 rounded-xl p-6 mb-6 border border-gray-600/30">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FiDownload className="mr-2 h-5 w-5 text-primary-400" />
                        Lesson Materials
                        <span className="ml-2 bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full">
                          {activeLesson.materials.length}
                        </span>
                      </h3>
                      <div className="grid gap-3">
                        {activeLesson.materials.map((material) => (
                          <a 
                            key={material.id} 
                            href={material.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-200 group border border-gray-600/20 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-lg flex items-center justify-center border border-primary-500/30">
                                <FiDownload className="text-primary-400 h-4 w-4" />
                              </div>
                              <div>
                                <span className="text-white font-medium group-hover:text-primary-300 transition-colors">
                                  {material.title}
                                </span>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                  <span className="bg-gray-600/50 px-2 py-0.5 rounded text-xs">
                                    {material.file_type?.toUpperCase() || 'FILE'}
                                  </span>
                                  <span>{(material.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-primary-400 group-hover:text-primary-300 transition-colors">
                              <FiDownload className="h-5 w-5" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Lesson Content */}
                  {activeLesson.content && (
                    <div className="bg-gray-700/30 rounded-xl p-6 mb-6 border border-gray-600/30">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FiBook className="mr-2 h-5 w-5 text-primary-400" />
                        Lesson Content
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {activeLesson.content}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes Section */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <FiMessageCircle className="mr-2 h-5 w-5 text-primary-400" />
                        My Notes
                      </h3>
                      <button 
                        className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg transition-all duration-200"
                        onClick={() => setShowNotes(!showNotes)}
                      >
                        {showNotes ? (
                          <>
                            <FiEyeOff className="h-4 w-4" />
                            Hide Notes
                          </>
                        ) : (
                          <>
                            <FiEye className="h-4 w-4" />
                            Show Notes
                          </>
                        )}
                      </button>
                    </div>
                    
                    {showNotes && (
                      <div className="space-y-4">
                        <div className="relative">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                            placeholder="Take notes about this lesson..."
                            className="w-full h-32 bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all duration-200"
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                            {notes.length} characters
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={handleSaveNotes}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                          >
                            <FiSave className="mr-2 h-4 w-4" />
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Discussion Section (placeholder) */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/30">
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <FiMessageCircle className="mr-3 text-primary-400 h-6 w-6" /> 
                Discussion
                <span className="ml-2 bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">Join the conversation with your instructor and fellow students. Share insights, ask questions, and collaborate with your learning community.</p>
              <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                <div className="relative">
                <textarea
                  placeholder="Write your comment or question..."
                    className="w-full h-24 bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all duration-200"
                    disabled
                ></textarea>
                  <div className="absolute inset-0 bg-gray-800/20 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Discussion feature coming soon</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="primary" 
                    disabled
                    className="bg-gradient-to-r from-primary-500/50 to-primary-600/50 border-0 px-6 py-2 rounded-xl font-medium cursor-not-allowed"
                  >
                    <FiMessageCircle className="mr-2 h-4 w-4" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Course Progress */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/30 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5 text-primary-400" />
                  Progress
                </h2>
                <div className="text-right">
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                    {progress}%
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Complete</p>
                </div>
              </div>
              
              <div className="relative mb-6">
                <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute -top-8 right-0 text-xs text-primary-400 font-medium">
                  {progress}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {completedLessons.length}
                  </div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="text-2xl font-bold text-gray-300 mb-1">
                    {(course.lessons?.length || 0) - completedLessons.length}
                  </div>
                  <div className="text-xs text-gray-400">Remaining</div>
                </div>
              </div>
            </div>
            
            {/* Course Curriculum */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/30">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                <FiList className="mr-2 h-5 w-5 text-primary-400" />
                Curriculum
                <span className="ml-2 bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full">
                  {course.lessons?.length || 0}
                </span>
              </h2>
              
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      id={`lesson-${lesson.id}`}
                      className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        activeLesson?.id === lesson.id 
                          ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-primary-500/50 shadow-lg shadow-primary-500/10' 
                          : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 hover:border-gray-500/50'
                      }`}
                      onClick={() => setActiveLesson(lesson)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                            completedLessons.includes(lesson.id) 
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                              : activeLesson?.id === lesson.id
                                ? 'bg-primary-500/30 border border-primary-500/50 text-primary-300'
                                : 'bg-gray-600/50 border border-gray-500/50 text-gray-300'
                          }`}>
                            {completedLessons.includes(lesson.id) ? (
                              <FiCheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-medium text-sm transition-colors ${
                              activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                            }`}>
                              {lesson.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-400 flex items-center">
                                <FiClock className="mr-1 h-3 w-3" />
                                {lesson.duration_minutes || 10} min
                              </p>
                              {lesson.video_url && (
                                <span className="text-xs text-primary-400 flex items-center">
                                  <FiVideo className="mr-1 h-3 w-3" />
                                  Video
                                </span>
                              )}
                              {lesson.materials && lesson.materials.length > 0 && (
                                <span className="text-xs text-gray-400 flex items-center">
                                  <FiDownload className="mr-1 h-3 w-3" />
                                  {lesson.materials.length}
                          </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`transition-colors ${
                          activeLesson?.id === lesson.id ? 'text-primary-400' : 'text-gray-400 group-hover:text-primary-400'
                        }`}>
                          <FiPlay className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiBook className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No lessons available in this course.</p>
                </div>
              )}
            </div>
            
            {/* Upcoming Live Sessions */}
            {course.live_sessions && course.live_sessions.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/50 mt-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Live Sessions</h2>
                <div className="space-y-3">
                  {course.live_sessions.map((session) => (
                    <div 
                      key={session.id}
                      className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                    >
                      <h3 className="font-medium text-white mb-1">{session.title}</h3>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <FiCalendar className="mr-1.5" />
                        {new Date(session.scheduledFor).toLocaleDateString()}
                        <span className="mx-1.5">•</span>
                        <FiClock className="mr-1.5" />
                        {new Date(session.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full mt-2"
                        disabled={new Date(session.scheduledFor) > new Date()}
                      >
                        {new Date(session.scheduledFor) > new Date() ? 'Remind Me' : 'Join Session'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCourseDetailPage; 