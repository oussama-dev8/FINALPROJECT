import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRTM } from '../../contexts/AgoraRTMContext';

interface ChatPanelProps {
  roomId: string;
  onClose: () => void;
}

export function ChatPanel({ roomId, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const { messages, sendMessage } = useRTM();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Chat</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={`${message.userId}-${message.timestamp}-${index}`}
            className={`flex ${message.userId === user?.id.toString() ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              message.userId === user?.id.toString()
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-lg px-3 py-2`}>
              {message.userId !== user?.id.toString() && (
                <div className="text-xs font-medium mb-1 opacity-75">
                  {message.userName}
                </div>
              )}
              <div className="text-sm">{message.text}</div>
              <div className={`text-xs mt-1 ${
                message.userId === user?.id.toString() ? 'text-primary-200' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}