import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const useAgoraRTC = () => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState({ audioTrack: null, videoTrack: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track join-in-progress via ref to avoid stale closures
  const joiningRef = useRef(false);
  
  // Device availability status
  const [deviceStatus, setDeviceStatus] = useState({
    hasCamera: false,
    hasMicrophone: false,
    cameraError: null,
    microphoneError: null
  });
  
  // Refs for DOM elements
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  // Initialize client event listeners
  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      try {
        console.log('🔔 User published:', {
          uid: user.uid,
          mediaType,
          hasVideoTrack: !!user.videoTrack,
          hasAudioTrack: !!user.audioTrack
        });
        
        await client.subscribe(user, mediaType);
        console.log('✅ Subscribed to user:', user.uid, 'mediaType:', mediaType);
        
        setRemoteUsers(prevUsers => {
          const existingUserIndex = prevUsers.findIndex(u => u.uid === user.uid);
          if (existingUserIndex >= 0) {
            const updatedUsers = [...prevUsers];
            updatedUsers[existingUserIndex] = user;
            console.log('📝 Updated existing user:', user.uid);
            return updatedUsers;
          } else {
            console.log('➕ Added new user:', user.uid);
            return [...prevUsers, user];
          }
        });
      } catch (error) {
        console.error('❌ Failed to subscribe to user:', error);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      console.log('User unpublished:', user.uid, 'mediaType:', mediaType);
      setRemoteUsers(prevUsers => 
        prevUsers.map(u => u.uid === user.uid ? user : u)
      );
    };

    const handleUserLeft = (user) => {
      console.log('User left:', user.uid);
      setRemoteUsers(prevUsers => 
        prevUsers.filter(u => u.uid !== user.uid)
      );
      // Clean up video element reference
      delete remoteVideoRefs.current[user.uid];
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);

  // Play remote video streams
  useEffect(() => {
    remoteUsers.forEach(user => {
      if (user.videoTrack && remoteVideoRefs.current[user.uid]) {
        console.log('Playing remote video track for user:', user.uid);
        user.videoTrack.play(remoteVideoRefs.current[user.uid]);
      }
    });
  }, [remoteUsers]);

  // Play local video stream
  useEffect(() => {
    if (localTracks.videoTrack && localVideoRef.current) {
      console.log('🎬 Playing local video track to DOM element');
      try {
        localTracks.videoTrack.play(localVideoRef.current);
        console.log('✅ Local video track playing successfully');
      } catch (error) {
        console.error('❌ Failed to play local video track:', error);
      }
    } else {
      console.log('🔍 Local video not ready:', {
        hasVideoTrack: !!localTracks.videoTrack,
        hasVideoRef: !!localVideoRef.current,
        videoTrackId: localTracks.videoTrack?.getTrackId?.(),
        videoRefElement: localVideoRef.current?.tagName
      });
    }
  }, [localTracks.videoTrack]);

  const joinChannel = useCallback(async (appId, token, channelName, uid) => {
    try {
      setIsLoading(true);
      // Mark join as in-progress
      joiningRef.current = true;
      setError(null);

      console.log('Joining Agora channel with params:', { 
        appId, 
        channelName, 
        uid, 
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 10) + '...',
        currentConnectionState: client.connectionState,
        isAlreadyJoined: isJoined,
        joiningInProgress: joiningRef.current
      });
      
      // Check if already connected or connecting
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        console.log('Client already connected/connecting, skipping join');
        if (client.connectionState === 'CONNECTED') {
          setIsJoined(true);
        }
        setIsLoading(false);
        joiningRef.current = false;
        return;
      }
      
      // If already joined according to our state, clean up first
      if (isJoined) {
        console.log('Already joined according to state, cleaning up first...');
        try {
          // Stop and close local tracks
          if (localTracks.audioTrack) {
            localTracks.audioTrack.stop();
            localTracks.audioTrack.close();
          }
          if (localTracks.videoTrack) {
            localTracks.videoTrack.stop();
            localTracks.videoTrack.close();
          }
          
          // Leave the channel
          await client.leave();
          console.log('Cleaned up previous connection');
          
          setIsJoined(false);
          setRemoteUsers([]);
          remoteVideoRefs.current = {};
          setLocalTracks({ audioTrack: null, videoTrack: null });
        } catch (cleanupError) {
          console.warn('Error during cleanup:', cleanupError);
          // Continue with join attempt
        }
      }
      
      // Validate parameters
      if (!appId || !token || !channelName) {
        throw new Error('Missing required parameters: appId, token, or channelName');
      }
      
      if (typeof uid !== 'number' || uid <= 0) {
        throw new Error(`Invalid UID: ${uid}. Must be a positive number.`);
      }

      // Join the channel first
      await client.join(appId, channelName, token, uid);
      console.log('Joined channel successfully');
      
      // Subscribe to already published remote users
      client.remoteUsers.forEach(async (remoteUser) => {
        try {
          if (remoteUser.videoTrack) {
            await client.subscribe(remoteUser, 'video');
          }
          if (remoteUser.audioTrack) {
            await client.subscribe(remoteUser, 'audio');
          }
          setRemoteUsers(prevUsers => {
            const idx = prevUsers.findIndex(u => u.uid === remoteUser.uid);
            if (idx >= 0) {
              const updated = [...prevUsers];
              updated[idx] = remoteUser;
              return updated;
            }
            return [...prevUsers, remoteUser];
          });
        } catch (err) {
          console.error('Failed to subscribe to existing user stream:', remoteUser.uid, err);
        }
      });
      
      // Check available devices
      const devices = await AgoraRTC.getDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');
      
      console.log('Available devices:', { 
        hasCamera, 
        hasMicrophone, 
        totalDevices: devices.length,
        devices: devices.map(d => ({ kind: d.kind, label: d.label }))
      });
      
      let audioTrack = null;
      let videoTrack = null;
      let cameraError = null;
      let microphoneError = null;
      const tracksToPublish = [];
      
      // Try to create video track (camera is required)
      if (hasCamera) {
        try {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
          tracksToPublish.push(videoTrack);
          console.log('✅ Created video track');
        } catch (error) {
          console.error('❌ Failed to create video track:', error);
          cameraError = error.message;
          throw new Error(`Camera access failed: ${error.message}`);
        }
      } else {
        cameraError = 'No camera found';
        throw new Error('Camera is required but not found');
      }
      
      // Try to create audio track (microphone is optional)
      if (hasMicrophone) {
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          tracksToPublish.push(audioTrack);
          console.log('✅ Created audio track');
        } catch (error) {
          console.warn('⚠️ Failed to create audio track:', error);
          microphoneError = error.message;
          // Don't throw error - microphone is optional
        }
      } else {
        console.warn('⚠️ No microphone found');
        microphoneError = 'No microphone found';
      }
      
      // Update device status
      setDeviceStatus({
        hasCamera: !!videoTrack,
        hasMicrophone: !!audioTrack,
        cameraError,
        microphoneError
      });
      
      setLocalTracks({ audioTrack, videoTrack });
      
      // Publish available tracks
      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
        console.log(`✅ Published ${tracksToPublish.length} local tracks:`, 
          tracksToPublish.map(track => track.trackMediaType));
      } else {
        console.warn('⚠️ No tracks to publish');
      }
      
      setIsJoined(true);
      console.log('🎉 Join process completed successfully!');
      
    } catch (error) {
      console.error('Failed to join channel:', error);
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to join video call';
      
      if (error.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
        errorMessage = 'Invalid Agora credentials. Please check App ID and Certificate.';
      } else if (error.code === 'DEVICE_NOT_FOUND') {
        errorMessage = 'Camera not found. Camera is required to join the video call.';
      } else if (error.code === 'INVALID_PARAMS') {
        errorMessage = 'Invalid parameters provided to Agora SDK.';
      } else if (error.code === 'INVALID_OPERATION') {
        errorMessage = 'Connection already in progress. Please wait or refresh the page.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      joiningRef.current = false;
    }
  }, [client, isJoined, localTracks]);

  const leaveChannel = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Leaving channel and cleaning up tracks...');
      
      // First, unpublish all local tracks if we're still connected
      if (client.connectionState === 'CONNECTED') {
        try {
          const tracksToUnpublish = [];
          if (localTracks.audioTrack) tracksToUnpublish.push(localTracks.audioTrack);
          if (localTracks.videoTrack) tracksToUnpublish.push(localTracks.videoTrack);
          
          if (tracksToUnpublish.length > 0) {
            await client.unpublish(tracksToUnpublish);
            console.log('📤 Unpublished local tracks');
          }
        } catch (unpublishError) {
          console.warn('⚠️ Error unpublishing tracks:', unpublishError);
        }
      }
      
      // Stop and close local tracks
      if (localTracks.audioTrack) {
        try {
          localTracks.audioTrack.stop();
          localTracks.audioTrack.close();
          console.log('🎤 Closed audio track');
        } catch (audioError) {
          console.warn('⚠️ Error closing audio track:', audioError);
        }
      }
      
      if (localTracks.videoTrack) {
        try {
          localTracks.videoTrack.stop();
          localTracks.videoTrack.close();
          console.log('📹 Closed video track');
        } catch (videoError) {
          console.warn('⚠️ Error closing video track:', videoError);
        }
      }
      
      // Clear local tracks state
      setLocalTracks({ audioTrack: null, videoTrack: null });
      setDeviceStatus({
        hasCamera: false,
        hasMicrophone: false,
        cameraError: null,
        microphoneError: null
      });
      
      // Leave the channel
      if (client.connectionState === 'CONNECTED') {
        await client.leave();
        console.log('✅ Left channel successfully');
      } else {
        console.log('ℹ️ Client not connected, skipping channel leave');
      }
      
      setIsJoined(false);
      setRemoteUsers([]);
      remoteVideoRefs.current = {};
      setError(null);
      
    } catch (error) {
      console.error('❌ Failed to leave channel:', error);
      // Don't set error state during cleanup - just log it
    } finally {
      setIsLoading(false);
    }
  }, [client, localTracks]);

  const toggleAudio = useCallback(async () => {
    if (localTracks.audioTrack) {
      const enabled = localTracks.audioTrack.enabled;
      await localTracks.audioTrack.setEnabled(!enabled);
      return !enabled;
    }
    return false;
  }, [localTracks.audioTrack]);

  const toggleVideo = useCallback(async () => {
    if (localTracks.videoTrack) {
      const enabled = localTracks.videoTrack.enabled;
      await localTracks.videoTrack.setEnabled(!enabled);
      return !enabled;
    }
    return false;
  }, [localTracks.videoTrack]);

  const startScreenShare = useCallback(async () => {
    try {
      // Create screen share track
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      
      // Unpublish camera track and publish screen track
      if (localTracks.videoTrack) {
        await client.unpublish(localTracks.videoTrack);
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }
      
      await client.publish(screenTrack);
      
      setLocalTracks(prev => ({ ...prev, videoTrack: screenTrack }));
      
      // Handle screen share end
      screenTrack.on('track-ended', async () => {
        await stopScreenShare();
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      return false;
    }
  }, [client, localTracks]);

  const stopScreenShare = useCallback(async () => {
    try {
      // Stop screen share track
      if (localTracks.videoTrack) {
        await client.unpublish(localTracks.videoTrack);
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }
      
      // Create new camera track
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      await client.publish(videoTrack);
      
      setLocalTracks(prev => ({ ...prev, videoTrack }));
      
      return true;
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      return false;
    }
  }, [client, localTracks]);

  // Cleanup on unmount - using joiningRef instead of isJoining
  useEffect(() => {
    return () => {
      console.log('🧹 useAgoraRTC cleanup triggered');
      // Don't cleanup if we're in the middle of joining
      if (joiningRef.current) {
        console.log('⚠️ Skipping cleanup - join in progress');
        return;
      }
      
      if (isJoined || client.connectionState === 'CONNECTED') {
        console.log('🚨 Force cleanup - leaving channel and stopping tracks');
        leaveChannel().catch(error => {
          console.error('Error during useAgoraRTC cleanup:', error);
        });
      }
    };
  }, []); // Only run on mount/unmount

  // Additional cleanup for browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isJoined || client.connectionState === 'CONNECTED') {
        console.log('🚨 Browser closing - force cleanup tracks');
        // Synchronous cleanup for browser close
        try {
          if (localTracks.audioTrack) {
            localTracks.audioTrack.stop();
            localTracks.audioTrack.close();
          }
          if (localTracks.videoTrack) {
            localTracks.videoTrack.stop();
            localTracks.videoTrack.close();
          }
        } catch (error) {
          console.error('Error during browser close cleanup:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isJoined, client, localTracks]);

  return {
    // State
    isJoined,
    isLoading,
    error,
    localTracks,
    remoteUsers,
    deviceStatus,
    
    // Refs
    localVideoRef,
    remoteVideoRefs,
    
    // Methods
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
};

export default useAgoraRTC; 