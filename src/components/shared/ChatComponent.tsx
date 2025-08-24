/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  IoChatbox, 
  IoSend, 
  IoClose, 
  IoCheckmarkDone, 
  IoCheckmark,
  IoPersonCircle,
  IoChevronBack
} from 'react-icons/io5';
import { FiUsers, FiMessageSquare, FiWifi, FiWifiOff } from 'react-icons/fi';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  message: string;
  images: string[];
  createdAt: string;
  isRead: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

interface User {
  _id: string;
  email: string;
  isApproved: boolean;
  isCompleteProfile: boolean;
  role: string;
  name?: string;
  image?: string;
  isOnline?: boolean;
}

interface UserWithLastMessage {
  user: { _id: string; name: string; image: string } | null;
  lastMessage: Message | null;
}

// Connection status enum
enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

const ChatComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [messageList, setMessageList] = useState<UserWithLastMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ _id: string; name: string; image: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasFetchedInitialData = useRef(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const connectionReadyRef = useRef(false);
  
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Initialize user ID from token
  const initializeUser = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please log in first');
      return false;
    }
    try {
      const decodedToken = jwtDecode<{ role: string; userId: string }>(token);
      setUserId(decodedToken.userId);
      return true;
    } catch (error) {
      setError('Invalid token. Please log in again.');
      return false;
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } 
  }, []);

  // Fetch initial data after authentication
  const fetchInitialData = useCallback(() => {
    if (!hasFetchedInitialData.current && connectionReadyRef.current) {
      hasFetchedInitialData.current = true;
      sendMessage({ event: 'fetchWithAdminChats' });
      sendMessage({ event: 'onlineUsers' });
      sendMessage({ event: 'messageList' });
    }
  }, [sendMessage]);

  // WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!initializeUser()) {
      return;
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication token not found');
      return;
    }
    
    // If already connecting or connected, don't create a new connection
    if (wsRef.current && (
      wsRef.current.readyState === WebSocket.CONNECTING || 
      wsRef.current.readyState === WebSocket.OPEN
    )) {
      return;
    }
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Reset state when reconnecting
    processedMessageIds.current = new Set();
    setIsAuthenticated(false);
    hasFetchedInitialData.current = false;
    connectionReadyRef.current = false;
    setConnectionStatus(ConnectionStatus.CONNECTING);
    
    const websocket = new WebSocket('wss://api.simpleroomsng.com');
    wsRef.current = websocket;

    websocket.onopen = () => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setReconnectAttempts(0);
      setError(null);
      
      // Authenticate immediately after connection
      const authMessage = {
        event: 'authenticate',
        token,
      };
      // console.log('Sending authentication:', authMessage);
      websocket.send(JSON.stringify(authMessage));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // First message after authentication is considered successful
        if (!isAuthenticated && data.event !== 'error') {
          setIsAuthenticated(true);
          connectionReadyRef.current = true;
          
          // Fetch initial data after authentication
          fetchInitialData();
        }
        
        switch (data.event) {
          case 'message':
          case 'toAdminMessage':
            const newMsg: Message = {
              ...data.data,
              status: 'delivered'
            };
            
            // Skip if we've already processed this message
            if (processedMessageIds.current.has(newMsg._id)) {
              return;
            }
            
            // Mark this message as processed
            processedMessageIds.current.add(newMsg._id);
            
            setMessages(prev => {
              // If it's our own message, replace the temporary message
              if (newMsg.senderId === userId) {
                const tempMsgIndex = prev.findIndex(m => 
                  m.senderId === userId && 
                  m.status === 'sent' && 
                  m.message === newMsg.message
                );
                
                if (tempMsgIndex !== -1) {
                  const updatedMessages = [...prev];
                  updatedMessages[tempMsgIndex] = newMsg;
                  return updatedMessages;
                }
              }
              
              // Otherwise, add as a new message
              return [...prev, newMsg];
            });
            
            // Update unread count
            if (newMsg.senderId !== userId) {
              setUnreadCount(prev => prev + 1);
            }
            break;
            
          case 'fetchAdminChats':
            // Clear processed messages when fetching new chat
            processedMessageIds.current = new Set();
            
            const chatMessages = data.data.map((msg: any) => {
              processedMessageIds.current.add(msg._id);
              return {
                ...msg,
                status: 'delivered'
              };
            });
            setMessages(chatMessages);
            setIsChatLoading(false);
            break;
            
          case 'onlineUsers':
            setOnlineUsers(data.data);
            // Find admin user
            const admin = data.data.find((user: User) => user.role === 'admin');
            if (admin) {
              setAdminId(admin._id);
            }
            break;
            
          case 'unReadMessages':
            setUnreadCount(data.data.count);
            const unreadMessages = data.data.messages.map((msg: any) => {
              processedMessageIds.current.add(msg._id);
              return {
                ...msg,
                status: 'delivered'
              };
            });
            setMessages(prev => [...prev, ...unreadMessages]);
            break;
            
          case 'messageList':
            setMessageList(data.data);
            break;
            
          case 'typing':
            if (data.data.senderId !== userId) {
              setIsTyping(true);
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
              }, 3000);
            }
            break;
            
          case 'userStatus':
            setOnlineUsers(prev =>
              prev.map(user =>
                user._id === data.data.userId
                  ? { ...user, isOnline: data.data.isOnline }
                  : user
              )
            );
            break;
            
          case 'error':
            setError(data.message);
            // If authentication error, reset auth state
            if (data.message.includes('auth') || data.message.includes('token')) {
              setIsAuthenticated(false);
              connectionReadyRef.current = false;
            }
            break;
            
          default:
            console.log('Unknown WebSocket event:', data.event);
        }
      } catch (err) {
        setError('Error processing message');
      }
    };

    websocket.onclose = (event) => {
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setIsAuthenticated(false);
      hasFetchedInitialData.current = false;
      connectionReadyRef.current = false;
      
      // Attempt reconnection if it wasn't a manual close
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && isModalOpen) {
        setConnectionStatus(ConnectionStatus.RECONNECTING);
        setReconnectAttempts(prev => prev + 1);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_DELAY * Math.pow(2, reconnectAttempts));
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus(ConnectionStatus.FAILED);
        setError('Failed to connect to chat server after multiple attempts');
      }
    };

    websocket.onerror = (error) => {
      setConnectionStatus(ConnectionStatus.FAILED);
      setError('WebSocket connection error');
    };

    return websocket;
  }, [userId, reconnectAttempts, isModalOpen, initializeUser, fetchInitialData]);

  // WebSocket setup effect
  useEffect(() => {
    if (!isModalOpen) {
      // Clean up when chat closes
      if (wsRef.current) {
        wsRef.current.close(1000, 'Chat closed');
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setReconnectAttempts(0);
      setIsAuthenticated(false);
      hasFetchedInitialData.current = false;
      connectionReadyRef.current = false;
      processedMessageIds.current = new Set();
      return;
    }
    
    const websocket = connectWebSocket();
    return () => {
      if (websocket) {
        websocket.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isModalOpen]);

  const handleChatClick = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please log in first');
      setError('Please log in first');
      return;
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setSelectedUser(null);
    setMessages([]);
    setError(null);
    setUnreadCount(0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isAuthenticated) {
      return;
    }
    
    const messageText = inputMessage.trim();
    
    try {
      // Add temporary message to UI immediately
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const tempMessage: Message = {
        _id: tempId,
        senderId: userId!,
        receiverId: adminId || 'admin',
        roomId: '',
        message: messageText,
        images: [],
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'sending'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      const messageData = {
        event: 'toAdminMessage',
        message: messageText,
        images: [],
      };
      
      // Update message status to sent
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'sent' as const } : msg
      ));
      
      sendMessage(messageData);
      
    } catch (error) {
      setError('Failed to send message');
      
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.senderId === userId && msg.status === 'sent' ? { ...msg, status: 'failed' as const } : msg
      ));
    } finally {
      setInputMessage('');
    }
  };

  const fetchChats = (receiverId: string) => {
    setSelectedUserId(receiverId);
    setIsChatLoading(true);
    // Clear processed messages when switching chats
    processedMessageIds.current = new Set();
    sendMessage({
      event: 'fetchWithAdminChats',
    });
  };

  const fetchUnreadMessages = (receiverId: string) => {
    sendMessage({
      event: 'unReadMessages',
      receiverId,
    });
  };

  const handleAdminChatSelect = () => {
    setSelectedUserId(null);
    setSelectedUser({ _id: '687e2321357cef2d9b48e27e', name: 'Admin Support', image: '/support.png' });
    
    // Use adminId if available, otherwise start fresh
    if (adminId) {
      fetchChats(adminId);
      fetchUnreadMessages(adminId);
    } else {
      // If no adminId yet, start fresh admin chat
      setMessages([]);
      processedMessageIds.current = new Set();
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return isAuthenticated ? 'text-green-600' : 'text-yellow-600';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'text-yellow-600';
      case ConnectionStatus.FAILED:
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return isAuthenticated ? <FiWifi className="h-4 w-4" /> : <Loader2Icon className="h-4 w-4 animate-spin" />;
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return <Loader2Icon className="h-4 w-4 animate-spin" />;
      default:
        return <FiWifiOff className="h-4 w-4" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return isAuthenticated ? 'Connected' : 'Authenticating...';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'Connecting...';
      case ConnectionStatus.FAILED:
        return 'Connection failed';
      default:
        return 'Disconnected';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const renderMessageStatus = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2Icon className="h-3 w-3 animate-spin opacity-50" />;
      case 'sent':
        return <IoCheckmark className="h-3 w-3 opacity-50" />;
      case 'delivered':
        return <IoCheckmarkDone className="h-3 w-3 opacity-50" />;
      case 'failed':
        return <span className="text-red-500 text-xs">Failed</span>;
      default:
        return null;
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some(user => user._id === userId && user.isOnline);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <button
        className="flex items-center bg-gradient-to-r from-[#B07E50] to-[#8B6332] p-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
        onClick={handleChatClick}
      >
        <div className="relative">
          <Image
            src="/support.png"
            alt="Ask Admin"
            className="w-12 h-12 rounded-full mr-3 border-2 border-white/20"
            width={48}
            height={48}
          />
          {connectionStatus === ConnectionStatus.CONNECTED && isAuthenticated && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="text-left">
          <div className="text-white text-sm font-semibold">
            Got Questions? ASK ADMIN
          </div>
          <div className="text-white/80 text-xs">
            Support 24/7
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </button>

      {/* Chat Modal */}
      {isModalOpen && (
        <div className="fixed bottom-20 md:right-5 right-2 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B07E50] to-[#8B6332] p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiMessageSquare className="h-8 w-8 text-white" />
                <div>
                  <h2 className="text-white font-semibold text-lg">Admin Support</h2>
                  <div className={`flex items-center space-x-1 text-xs ${getConnectionStatusColor()}`}>
                    {getConnectionStatusIcon()}
                    <span className="text-white/80">
                      {getConnectionStatusText()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <IoClose className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages View */}
            <>
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30"
                style={{ scrollBehavior: 'smooth' }}
              >
                {isChatLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2Icon className="h-8 w-8 text-[#B07E50] animate-spin" />
                      <p className="text-sm text-gray-500">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-[#B07E50]/10 rounded-full flex items-center justify-center mx-auto">
                        <FiMessageSquare className="h-8 w-8 text-[#B07E50]" />
                      </div>
                      <p className="text-gray-500">Start a conversation</p>
                      <p className="text-sm text-gray-400">Send a message to begin chatting</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isCurrentUser = msg.senderId === userId;
                      const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
                      const isConsecutive = index > 0 && messages[index - 1].senderId === msg.senderId;
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                        >
                          <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                              {showAvatar ? (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  isCurrentUser 
                                    ? 'bg-[#B07E50] text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {isCurrentUser ? 'Y' : 'A'}
                                </div>
                              ) : (
                                <div className="w-8 h-8"></div>
                              )}
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`rounded-2xl px-4 py-2 shadow-sm ${
                                  isCurrentUser
                                    ? 'bg-[#B07E50] text-white rounded-br-md'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                                } ${isConsecutive ? 'rounded-2xl' : ''}`}
                              >
                                <p className="text-sm leading-relaxed break-words">
                                  {msg.message}
                                </p>
                              </div>
                              
                              {/* Message Info */}
                              <div className={`flex items-center space-x-1 mt-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <span className="text-xs text-gray-400">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                                {isCurrentUser && renderMessageStatus(msg.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              A
                            </span>
                          </div>
                          <div className="bg-gray-100 rounded-2xl px-4 py-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t bg-white rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full p-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B07E50]/20 focus:border-[#B07E50] resize-none text-sm max-h-20 min-h-[44px]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      disabled={!isAuthenticated}
                      rows={1}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="p-3 bg-[#B07E50] hover:bg-[#B07E50]/90 text-white rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-50"
                    disabled={
                      !inputMessage.trim() || 
                      !isAuthenticated
                    }
                  >
                    <IoSend className="h-5 w-5" />
                  </button>
                </form>
                
                {/* Connection Status */}
                {connectionStatus !== ConnectionStatus.CONNECTED && (
                  <div className="mt-2 text-center">
                    <span className={`text-xs ${getConnectionStatusColor()}`}>
                      {connectionStatus === ConnectionStatus.RECONNECTING && 
                        `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
                      }
                      {connectionStatus === ConnectionStatus.CONNECTING && 'Connecting to chat...'}
                      {connectionStatus === ConnectionStatus.FAILED && 'Connection failed. Please try again.'}
                      {connectionStatus === ConnectionStatus.DISCONNECTED && 'Disconnected'}
                    </span>
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;