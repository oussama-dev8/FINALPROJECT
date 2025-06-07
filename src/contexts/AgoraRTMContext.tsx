import React, { createContext, useContext, useState, useEffect } from 'react';
import AgoraRTM from 'agora-rtm-sdk';
import { useAuth } from './AuthContext';

interface RTMContextType {
  client: any;
  channel: any;
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  joinChannel: (channelName: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
}

interface Message {
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
}

const RTMContext = createContext<RTMContextType | null>(null);

export function RTMProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [client, setClient] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initialize RTM Client
    const rtmClient = AgoraRTM.createInstance(import.meta.env.VITE_AGORA_APP_ID);
    setClient(rtmClient);

    return () => {
      if (channel) {
        channel.leave();
      }
      if (client) {
        client.logout();
      }
    };
  }, []);

  const joinChannel = async (channelName: string) => {
    if (!client || !user) return;

    try {
      // Login with user ID
      await client.login({ uid: user.id.toString() });

      // Create and join channel
      const rtmChannel = client.createChannel(channelName);
      await rtmChannel.join();

      // Set up message handler
      rtmChannel.on('ChannelMessage', (message: any, memberId: string) => {
        try {
          const messageData = JSON.parse(message.text);
          setMessages(prev => [...prev, {
            text: messageData.message,
            userId: memberId,
            userName: messageData.userName,
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      setChannel(rtmChannel);
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const leaveChannel = async () => {
    if (channel) {
      await channel.leave();
      setChannel(null);
      setMessages([]);
    }
    if (client) {
      await client.logout();
    }
  };

  const sendMessage = async (text: string) => {
    if (!channel || !user) return;

    try {
      const messageData = {
        message: text,
        userName: `${user.firstName} ${user.lastName}`,
      };

      await channel.sendMessage({ text: JSON.stringify(messageData) });

      // Add message to local state
      setMessages(prev => [...prev, {
        text,
        userId: user.id.toString(),
        userName: `${user.firstName} ${user.lastName}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <RTMContext.Provider value={{ client, channel, messages, sendMessage, joinChannel, leaveChannel }}>
      {children}
    </RTMContext.Provider>
  );
}

export function useRTM() {
  const context = useContext(RTMContext);
  if (!context) {
    throw new Error('useRTM must be used within an RTMProvider');
  }
  return context;
} 