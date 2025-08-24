/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { IoChatbox } from 'react-icons/io5';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  message: string;
  images: string[];
  createdAt: string;
  isRead: boolean;
}

interface User {
  _id: string;
  email: string;
  isApproved: boolean;
  isCompleteProfile: boolean;
  role: string;
}

interface UserWithLastMessage {
  user: { _id: string; name: string; image: string } | null;
  lastMessage: Message | null;
}

const ChatComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [messageList, setMessageList] = useState<UserWithLastMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isModalOpen) return;

    const token = localStorage.getItem('accessToken');
    const decodedToken = jwtDecode<{ role: string, userId: string }>(token || '');
    setUserId(decodedToken.userId);
    if (!token) {
      setError('Please log in first');
      return;
    }

    const websocket = new WebSocket('wss://api.simpleroomsng.com');
    setWs(websocket);

    websocket.onopen = () => {
      setIsConnected(true);
      setError(null);
      websocket.send(
        JSON.stringify({
          event: 'authenticate',
          token,
        })
      );
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.event) {
          case 'message':
          case 'toAdminMessage':
            setMessages((prev) => [...prev, data.data]);
            break;
          case 'fetchChats':
            setMessages(data.data);
            break;
          case 'onlineUsers':
            setOnlineUsers(data.data);
            break;
          case 'unReadMessages':
            setUnreadCount(data.data.count);
            setMessages((prev) => [...prev, ...data.data.messages]);
            break;
          case 'messageList':
            setMessageList(data.data);
            break;
          case 'error':
            setError(data.message);
            break;
          case 'userStatus':
            setOnlineUsers((prev) =>
              prev.map((user) =>
                user._id === data.data.userId
                  ? { ...user, isOnline: data.data.isOnline }
                  : user
              )
            );
            break;
        }
      } catch (err) {
        setError('Error processing message');
      }
    };

    websocket.onclose = () => {
      setIsConnected(false);
      setError('WebSocket connection closed');
      setWs(null);
    };

    websocket.onerror = () => {
      setIsConnected(false);
      setError('WebSocket connection error');
    };

    return () => {
      websocket.close();
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && ws && isConnected) {
      fetchOnlineUsers();
      fetchMessageList();
    }
  }, [isModalOpen, ws, isConnected]);

  const sendMessage = (message: object) => {
    if (ws && isConnected && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      setError('WebSocket is not connected');
    }
  };

  const handleChatClick = () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError('Please log in first');
      return;
    }
    // setSelectedUserId(null);
    // console.log(messageList[0]?.user,'aljd')

    // if (messageList[0]?.user?._id) {
    //     fetchChats(messageList[0]?.user?._id);
    //     fetchUnreadMessages(messageList[0]?.user?._id);
    // }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws || !isConnected || !inputMessage.trim()) return;

    if (!selectedUserId) {
      sendMessage({
        event: 'toAdminMessage',
        message: inputMessage,
        images: [],
      });
    } else {
      sendMessage({
        event: 'message',
        receiverId: selectedUserId,
        message: inputMessage,
        images: [],
      });
    }
    setInputMessage('');
  };

  const fetchChats = (receiverId: string) => {
    setSelectedUserId(receiverId);
    sendMessage({
      event: 'fetchChats',
      receiverId,
    });
  };

  const fetchOnlineUsers = () => {
    sendMessage({
      event: 'onlineUsers',
    });
  };

  const fetchUnreadMessages = (receiverId: string) => {
    sendMessage({
      event: 'unReadMessages',
      receiverId,
    });
  };

  const fetchMessageList = () => {
    sendMessage({
      event: 'messageList',
    });
  };

//   const currentUserId = localStorage.getItem('userId');

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        className="flex items-center bg-[#B07E50]/60 p-3 rounded-lg shadow-lg hover:bg-[#B07E50] transition duration-300"
        onClick={handleChatClick}
      >
        <Image
          src="/support.png"
          alt="Ask Amy"
          className="w-10 h-10 rounded-full mr-3"
          width={40}
          height={40}
        />
        <span className="text-white text-sm font-medium">
          Got Questions? ASK ADMIN<br />Support 24/7
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
              {unreadCount}
            </span>
          )}
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed bottom-20 md:right-5 right-0 max-w-96 w-full bg-white rounded-xl shadow-2xl p-5 z-50 border border-[#B07E50]/50 max-h-[80vh] flex flex-col">
          <div className="relative flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Chat with Admin</h2>
            <span
              className="text-xl cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </span>
          </div>

          {/* {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )} */}

          <div className="mt-4 flex flex-col max-h-96">
            <div className="flex-1 overflow-y-auto rounded-lg p-3 bg-gray-50">
              {selectedUserId ? (
                <>
                  {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === userId;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        } mb-3`}
                      >
                        <div
                          className={`max-w-[70%] px-3 py-1 rounded-xl shadow-sm ${
                            isCurrentUser
                              ? 'bg-[#B07E50] text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <span className="block text-[10px] mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    className="w-full p-2 bg-[#B07E50]/50 text-white rounded-lg hover:bg-[#B07E50] transition duration-200 flex items-center gap-1 justify-center"
                    onClick={() => {
                        setSelectedUserId(null)
                          if (messageList[0]?.user?._id) {
                          fetchChats(messageList[0]?.user?._id);
                          fetchUnreadMessages(messageList[0]?.user?._id);
                        }
                    }}
                  >
                    < IoChatbox /> Chat Now with Admin
                  </button>
                  {messageList.map((item) => (
                    <div
                      key={item.user?._id}
                      className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        if (item.user?._id) {
                          fetchChats(item.user._id);
                          fetchUnreadMessages(item.user._id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.user?.name || 'Unknown'}</span>
                        {(onlineUsers as any).find((user:any) => user._id === item.user?._id)?.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {item.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedUserId !== null && (
              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-[#B07E50]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B07E50]"
                />
                <button
                  type="submit"
                  className="bg-[#B07E50] text-white p-2 rounded-lg hover:bg-[#B07E50]/80 transition duration-200"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;