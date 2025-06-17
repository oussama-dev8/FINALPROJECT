import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMic, 
  FiMicOff, 
  FiVideo, 
  FiVideoOff, 
  FiMonitor, 
  FiPhone, 
  FiSettings, 
  FiUsers,
  FiMessageCircle
} from 'react-icons/fi';
import videoRoomsApi from '@/shared/api/videoRoomsApi';
import { useAuth } from '@/shared/context/AuthContext';
import Button from '@/components/ui/Button';
import useAgoraRTC from '@/hooks/useAgoraRTC';

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Room state
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // UI state
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Agora state
  const [agoraToken, setAgoraToken] = useState(null);
  const [agoraAppId, setAgoraAppId] = useState('c0d5169e3b6a4ee3be78171e717d577f');

  // Refs to store interval and cleanup functions
  const participantsIntervalRef = useRef(null);
  const cleanupFunctionsRef = useRef([]);
  const initializingRef = useRef(false);

  // Agora RTC hook
  const {
    isJoined,
    isLoading: agoraLoading,
    error: agoraError,
    localTracks,
    remoteUsers,
    deviceStatus,
    localVideoRef,
    remoteVideoRefs,
    joinChannel,
    leaveChannel,
    toggleAudio: agoraToggleAudio,
    toggleVideo: agoraToggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useAgoraRTC();

  useEffect(() => {
    if (!initializingRef.current && !isJoined && !loading) {
      initializeRoom();
    }
  }, [roomId]);

  const cleanupAll = () => {
    console.log('🧹 Cleaning up VideoRoom component...');
    
    // Clear participant refresh interval
    if (participantsIntervalRef.current) {
      clearInterval(participantsIntervalRef.current);
      participantsIntervalRef.current = null;
    }
    
    // Run all cleanup functions
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    cleanupFunctionsRef.current = [];
    
    // Force Agora cleanup if still joined
    if (isJoined) {
      console.log('🚨 Force cleaning up Agora connection...');
      leaveChannel().catch(error => {
        console.error('Error during force cleanup:', error);
      });
    }
  };

  const initializeRoom = async () => {
    // Prevent multiple initialization attempts
    if (initializingRef.current || isJoined || loading) {
      console.log('Already initializing/joined/loading room, skipping...', {
        initializing: initializingRef.current,
        isJoined,
        loading
      });
      return;
    }
    
    try {
      initializingRef.current = true;
      setLoading(true);
      
      // Validate roomId
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      
      console.log('Initializing room with ID:', roomId);
      
      // Get room details
      const roomResponse = await videoRoomsApi.getRoomDetails(roomId);
      setRoomData(roomResponse);

      // Join room in backend
      await videoRoomsApi.joinRoom(roomId);

      // Generate Agora token
      const tokenResponse = await videoRoomsApi.generateToken(roomId, 'rtc');
      setAgoraToken(tokenResponse.token);
      
      // Join Agora channel - use the exact channel name and UID from token response
      const channelName = tokenResponse.channel_name;
      const uid = tokenResponse.uid;
      
      console.log('Joining Agora channel:', {
        appId: agoraAppId,
        channelName,
        uid,
        hasToken: !!tokenResponse.token
      });
      
      await joinChannel(agoraAppId, tokenResponse.token, channelName, uid);
      console.log('Joined Agora channel successfully');
      
      // Debug: Log current state after joining
      console.log('Post-join state:', {
        isJoined,
        localTracks,
        remoteUsers: remoteUsers.length,
        deviceStatus
      });

      // Get updated room details with participants
      const updatedRoomResponse = await videoRoomsApi.getRoomDetails(roomId);
      
      // Set real participants from backend
      const realParticipants = updatedRoomResponse.participants?.map(participant => ({
        id: participant.user.id,
        name: participant.user.full_name || participant.user.username,
        isHost: participant.role === 'host',
        isAudioOn: participant.is_audio_on,
        isVideoOn: participant.is_video_on,
        isScreenSharing: participant.is_screen_sharing,
        isMe: participant.user.id === user?.id,
        role: participant.role,
        joinedAt: participant.joined_at
      })) || [];
      
      setParticipants(realParticipants);

      // Mock chat messages
      setChatMessages([
        {
          id: 1,
          user: 'System',
          message: 'Welcome to the live session!',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
    } catch (error) {
      console.error('Failed to initialize room:', error);
      setError(error.message || 'Failed to join video room');
    } finally {
      setLoading(false);
      initializingRef.current = false;
    }
  };

  // Function to refresh participants
  const refreshParticipants = async () => {
    // Don't refresh if we're leaving
    if (isLeaving) return;
    
    try {
      const participantsResponse = await videoRoomsApi.getRoomParticipants(roomId);
      const realParticipants = participantsResponse?.map(participant => ({
        id: participant.user.id,
        name: participant.user.full_name || participant.user.username,
        isHost: participant.role === 'host',
        isAudioOn: participant.is_audio_on,
        isVideoOn: participant.is_video_on,
        isScreenSharing: participant.is_screen_sharing,
        isMe: participant.user.id === user?.id,
        role: participant.role,
        joinedAt: participant.joined_at
      })) || [];
      
      setParticipants(realParticipants);
    } catch (error) {
      console.error('Failed to refresh participants:', error);
    }
  };

  // Add useEffect to refresh participants periodically
  useEffect(() => {
    if (roomId && !loading && !isLeaving) {
      participantsIntervalRef.current = setInterval(refreshParticipants, 5000);
      
      return () => {
        if (participantsIntervalRef.current) {
          clearInterval(participantsIntervalRef.current);
          participantsIntervalRef.current = null;
        }
      };
    }
  }, [roomId, loading, user?.id, isLeaving]);

  // Handle browser navigation (back button, refresh, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isLeaving) return; // Don't prevent if we're already leaving
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave this video room?';
      return 'Are you sure you want to leave this video room?';
    };

    const handlePopState = (e) => {
      if (isLeaving) return; // Don't prevent if we're already leaving
      e.preventDefault();
      setShowLeaveConfirm(true);
      // Push the current state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push initial state to handle back button
    window.history.pushState(null, '', window.location.pathname);

    // Store cleanup functions
    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
    cleanupFunctionsRef.current.push(cleanup);

    return cleanup;
  }, [isLeaving]);

  // Handle keyboard shortcuts (ESC to show leave dialog)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showLeaveConfirm && !isLeaving) {
        setShowLeaveConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    const cleanup = () => window.removeEventListener('keydown', handleKeyDown);
    cleanupFunctionsRef.current.push(cleanup);
    
    return cleanup;
  }, [showLeaveConfirm, isLeaving]);

  const toggleAudio = async () => {
    if (isLeaving) return;
    try {
      const newAudioState = await agoraToggleAudio();
      setIsAudioOn(newAudioState);
      
      if (roomId) {
        await videoRoomsApi.updateParticipantStatus(roomId, {
          is_audio_on: newAudioState
        });
        // Refresh participants to show updated status
        await refreshParticipants();
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  const toggleVideo = async () => {
    if (isLeaving) return;
    try {
      const newVideoState = await agoraToggleVideo();
      setIsVideoOn(newVideoState);
      
      if (roomId) {
        await videoRoomsApi.updateParticipantStatus(roomId, {
          is_video_on: newVideoState
        });
        // Refresh participants to show updated status
        await refreshParticipants();
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (isLeaving) return;
    try {
      let newScreenShareState;
      if (isScreenSharing) {
        await stopScreenShare();
        newScreenShareState = false;
      } else {
        const success = await startScreenShare();
        newScreenShareState = success;
      }
      
      setIsScreenSharing(newScreenShareState);
      
      if (roomId) {
        await videoRoomsApi.updateParticipantStatus(roomId, {
          is_screen_sharing: newScreenShareState
        });
        // Refresh participants to show updated status
        await refreshParticipants();
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  const sendMessage = () => {
    if (isLeaving || !newMessage.trim()) return;
    const message = {
      id: Date.now(),
      user: user?.first_name || user?.username || 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const leaveRoom = async () => {
    if (isLeaving) return; // Prevent multiple leave attempts
    setShowLeaveConfirm(true);
  };

  const confirmLeaveRoom = async () => {
    if (isLeaving) return; // Prevent multiple leave attempts
    
    try {
      setIsLeaving(true);
      setShowLeaveConfirm(false);
      
      // Clean up all intervals and event listeners first
      cleanupAll();
      
      // Leave Agora channel
      if (isJoined) {
        await leaveChannel();
      }
      
      // Leave the room in backend
      if (roomId) {
        await videoRoomsApi.leaveRoom(roomId);
      }
      
      // Navigate to course details page based on user role and course info
      if (roomData?.course?.id) {
        const courseId = roomData.course.id;
        if (user?.user_type === 'teacher') {
          navigate(`/dashboard/teacher/courses/${courseId}/view`, { replace: true });
        } else {
          navigate(`/dashboard/my-courses/${courseId}`, { replace: true });
        }
      } else {
        // Fallback to dashboard if no course info
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      // Still navigate to course page even if API call fails
      if (roomData?.course?.id) {
        const courseId = roomData.course.id;
        if (user?.user_type === 'teacher') {
          navigate(`/dashboard/teacher/courses/${courseId}/view`, { replace: true });
        } else {
          navigate(`/dashboard/my-courses/${courseId}`, { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const cancelLeaveRoom = () => {
    if (isLeaving) return;
    setShowLeaveConfirm(false);
  };

  if (loading || agoraLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-400">
            {loading ? 'Joining video room...' : 'Connecting to video call...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || agoraError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Failed to join room</h2>
          <p className="text-gray-400 mb-6">{error || agoraError}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex z-50">
      {/* Full Screen Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Main Video Feed - Full Screen */}
        <div className="absolute inset-0">
          <div className="w-full h-full relative bg-gray-800">
            {/* Remote Video Streams */}
            {remoteUsers.length > 0 ? (
              <div className="absolute inset-0">
                {remoteUsers.map((user, index) => (
                  <div
                    key={user.uid}
                    className="w-full h-full"
                    style={{
                      display: index === 0 ? 'block' : 'none'
                    }}
                  >
                    <div
                      ref={(el) => {
                        if (el) {
                          remoteVideoRefs.current[user.uid] = el;
                          // Play the remote video track as soon as element and track are available
                          if (user.videoTrack) {
                            console.log('Playing remote video in UI for user:', user.uid);
                            user.videoTrack.play(el);
                          }
                        }
                      }}
                      className="w-full h-full object-cover bg-gray-800"
                    />
                  </div>
                ))}
                
                {/* Multiple Users Indicator */}
                {remoteUsers.length > 1 && (
                  <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                    <span className="text-white text-sm font-medium">
                      +{remoteUsers.length - 1} more
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Fallback when no remote users
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl font-bold text-white">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <p className="text-2xl font-medium text-white mb-2">
                    Waiting for others to join...
                  </p>
                  <p className="text-lg text-gray-400">
                    {roomData?.host?.id === user?.id ? 'Host' : 'Participant'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Video Status Overlay */}
            <div className="absolute bottom-6 left-6 flex space-x-2">
              <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                {isAudioOn ? (
                  <FiMic className="w-5 h-5 text-green-400" />
                ) : (
                  <FiMicOff className="w-5 h-5 text-red-400" />
                )}
                {isVideoOn ? (
                  <FiVideo className="w-5 h-5 text-green-400" />
                ) : (
                  <FiVideoOff className="w-5 h-5 text-red-400" />
                )}
                {isScreenSharing && (
                  <div className="flex items-center space-x-1">
                    <FiMonitor className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-blue-400">Sharing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Title and Room Info */}
        <div className="absolute top-6 left-6 z-10">
          <h1 className="text-xl font-semibold text-white mb-1 drop-shadow-lg">{roomData?.title}</h1>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm text-gray-300 drop-shadow-lg">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
            {/* Connection Status */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">
                {isJoined ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mb-2 text-xs text-gray-400 bg-black/60 rounded px-2 py-1">
            Local: {localTracks.videoTrack ? '📹' : '❌'} | Remote: {remoteUsers.length} users
          </div>
          
          {/* Local Video Stream */}
          <div className="relative">
            <div className="w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
              {localTracks.videoTrack && isVideoOn ? (
                <div
                  ref={(el) => {
                    if (el) {
                      // Store the element in the ref
                      localVideoRef.current = el;
                      // Play local video track immediately
                      if (localTracks.videoTrack) {
                        console.log('Playing local video in UI for self');
                        localTracks.videoTrack.play(el);
                      }
                    }
                  }}
                  className="w-full h-full object-cover bg-gray-800"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-white">
                        {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">(You)</p>
                  </div>
                </div>
              )}
              
              {/* Local Video Status Overlay */}
              <div className="absolute bottom-2 right-2 flex space-x-1">
                {!isAudioOn && (
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <FiMicOff className="w-3 h-3 text-white" />
                  </div>
                )}
                {!isVideoOn && (
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <FiVideoOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* "You" Label */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs text-white font-medium">You</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sidebar Toggle Buttons */}
        <div className="absolute top-6 right-6 z-10">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-3 rounded-lg backdrop-blur-sm transition-all ${
                showParticipants 
                  ? 'bg-primary-600/90 text-white shadow-lg' 
                  : 'bg-black/60 text-gray-300 hover:bg-black/80'
              }`}
              title="Toggle Participants"
            >
              <FiUsers className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-lg backdrop-blur-sm transition-all ${
                showChat 
                  ? 'bg-primary-600/90 text-white shadow-lg' 
                  : 'bg-black/60 text-gray-300 hover:bg-black/80'
              }`}
              title="Toggle Chat"
            >
              <FiMessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Bottom Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg ${
              isAudioOn 
                ? 'bg-gray-700/80 hover:bg-gray-600/80 text-white' 
                : 'bg-red-600/90 hover:bg-red-700/90 text-white'
            }`}
            title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioOn ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg ${
              isVideoOn 
                ? 'bg-gray-700/80 hover:bg-gray-600/80 text-white' 
                : 'bg-red-600/90 hover:bg-red-700/90 text-white'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg ${
              isScreenSharing 
                ? 'bg-primary-600/90 hover:bg-primary-700/90 text-white' 
                : 'bg-gray-700/80 hover:bg-gray-600/80 text-white'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          >
            <FiMonitor className="w-6 h-6" />
          </button>

          <button
            className="p-4 rounded-full backdrop-blur-sm bg-gray-700/80 hover:bg-gray-600/80 text-white transition-all shadow-lg"
            title="Settings"
          >
            <FiSettings className="w-6 h-6" />
          </button>

          <button
            onClick={leaveRoom}
            className="p-4 rounded-full backdrop-blur-sm bg-red-600/90 hover:bg-red-700/90 text-white transition-all shadow-lg"
            title="Leave room"
          >
            <FiPhone className="w-6 h-6 transform rotate-[135deg]" />
          </button>
        </div>
      </div>

      {/* Microphone Not Available Notification */}
      {isJoined && deviceStatus && !deviceStatus.hasMicrophone && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-yellow-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border border-yellow-500/50 max-w-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FiMicOff className="w-5 h-5 text-yellow-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Microphone not available</p>
                <p className="text-xs text-yellow-200 mt-1">
                  {deviceStatus.microphoneError || 'No microphone detected. You can still participate with video only.'}
                </p>
              </div>
              <button
                onClick={() => {
                  // You could add a dismiss functionality here if needed
                }}
                className="flex-shrink-0 text-yellow-200 hover:text-white transition-colors"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Slides in from right */}
      {(showParticipants || showChat) && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 z-20"
            onClick={() => {setShowParticipants(false); setShowChat(false);}}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800/95 backdrop-blur-sm border-l border-gray-700/50 flex flex-col z-30 shadow-2xl">
            {/* Sidebar Header */}
            <div className="border-b border-gray-700/50 p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {showParticipants ? 'Participants' : 'Chat'}
                </h3>
                <button
                  onClick={() => {setShowParticipants(false); setShowChat(false);}}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {setShowParticipants(true); setShowChat(false);}}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    showParticipants ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Participants
                </button>
                <button
                  onClick={() => {setShowChat(true); setShowParticipants(false);}}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    showChat ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Chat
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {showParticipants && (
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {participants.length} Active
                  </h4>
                  
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {participant.name?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {participant.name}
                            {participant.isMe && ' (You)'}
                          </p>
                          {participant.isHost && (
                            <p className="text-xs text-primary-400">Host</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {participant.isAudioOn ? (
                          <FiMic className="w-4 h-4 text-green-400" />
                        ) : (
                          <FiMicOff className="w-4 h-4 text-red-400" />
                        )}
                        {participant.isVideoOn ? (
                          <FiVideo className="w-4 h-4 text-green-400" />
                        ) : (
                          <FiVideoOff className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showChat && (
                <div className="flex flex-col h-full">
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{msg.user}</span>
                          <span className="text-xs text-gray-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-300">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700/50 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-600/50"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-3 py-2 text-sm transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Leave Room Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {isLeaving ? (
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                ) : (
                  <FiPhone className="w-8 h-8 text-red-600 transform rotate-[135deg]" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isLeaving ? 'Leaving Room...' : 'Leave Video Room?'}
              </h3>
              <p className="text-gray-400 mb-6">
                {isLeaving 
                  ? 'Please wait while we disconnect you from the call.'
                  : 'Are you sure you want to leave this video room? You will be disconnected from the call.'
                }
              </p>
              {!isLeaving && (
                <div className="flex space-x-3">
                  <button
                    onClick={cancelLeaveRoom}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLeaveRoom}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Leave Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;
