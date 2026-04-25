import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

export type User = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastActive: number;
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  targetUserId: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  currentUser: User | null;
  users: User[];
  messages: Message[];
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  currentUser: null,
  users: [],
  messages: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('users-list', (usersList: User[]) => {
      setUsers(usersList);
      const me = usersList.find(u => u.id === newSocket.id);
      if (me) setCurrentUser(me);
    });

    newSocket.on('chat-history', (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on('receive-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      // Acknowledge delivery automatically when we receive it
      newSocket.emit('mark-delivered', msg.id);
    });

    newSocket.on('message-sent', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('message-status-update', ({ id, status }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, currentUser, users, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
