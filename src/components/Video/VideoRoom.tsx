import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Phone, 
  Users, 
  MessageSquare,
  Settings,
  MoreVertical,
  Hand,
  Maximize,
  Minimize
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatPanel } from './ChatPanel';

interface VideoRoomProps {
  roomId: string;
  courseTitle: string;
  lessonTitle: string;
}

export function VideoRoom({ roomId, courseTitle, lessonTitle }: VideoRoomProps) {
  const { user } = useAuth();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants] = useState([
    { id: '1', name: 'Sarah Johnson', isHost: true, isVideoOn: true, isAudioOn: true },
    { id: '2', name: 'Ahmed Hassan', isHost: false, isVideoOn: true, isAudioOn: true },
    { id: '3', name: 'Maria Garcia', isHost: false, isVideoOn: false, isAudioOn: true },
    { id: '4', name: 'John Smith', isHost: false, isVideoOn: true, isAudioOn: false },
  ]);

  const isHost = user?.userType === 'teacher';

  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleHandRaise = () => setIsHandRaised(!isHandRaised);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const leaveRoom = () => {
    // Handle leaving the room
    window.history.back();
  };

  return (
    <div className={`flex h-screen bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">{lessonTitle}</h1>
            <p className="text-gray-300 text-sm">{courseTitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Main Speaker (Host) */}
          <div className="col-span-2 lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden relative group">
            <div className="aspect-video bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
              {participants[0].isVideoOn ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                  <span className="ml-2 text-gray-300">Video Feed</span>
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {participants[0].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-1 flex items-center space-x-2">
              <span className="text-white text-sm font-medium">{participants[0].name}</span>
              {participants[0].isHost && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded">Host</span>
              )}
              {!participants[0].isAudioOn && <MicOff className="w-4 h-4 text-red-400" />}
            </div>
            {isScreenSharing && (
              <div className="absolute top-4 left-4 bg-accent-600 text-white text-xs px-2 py-1 rounded">
                Screen Sharing
              </div>
            )}
          </div>

          {/* Participant Videos */}
          {participants.slice(1).map((participant) => (
            <div key={participant.id} className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video">
              {participant.isVideoOn ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1 flex items-center space-x-1">
                <span className="text-white text-xs">{participant.name.split(' ')[0]}</span>
                {!participant.isAudioOn && <MicOff className="w-3 h-3 text-red-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-700 rounded-lg p-1 flex items-center space-x-1">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-lg transition-colors ${
                  isVideoOn 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-lg transition-colors ${
                  isAudioOn 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {isHost && (
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-lg transition-colors ${
                  isScreenSharing 
                    ? 'bg-accent-600 text-white hover:bg-accent-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </button>
            )}

            {!isHost && (
              <button
                onClick={toggleHandRaise}
                className={`p-3 rounded-lg transition-colors ${
                  isHandRaised 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                <Hand className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:block">Chat</span>
            </button>
            <div className="p-3 bg-gray-600 text-white rounded-lg flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{participants.length}</span>
            </div>
            <button
              onClick={leaveRoom}
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <ChatPanel 
          roomId={roomId}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}