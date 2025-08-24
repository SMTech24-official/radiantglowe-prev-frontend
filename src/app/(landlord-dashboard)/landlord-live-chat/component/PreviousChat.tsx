/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { formatDistanceToNow } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Types
interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
}

interface Message {
    id: string;
    text: string;
    image?: string;
    sender: 'admin' | 'user';
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
    user: User;
    lastMessage: {
        _id: string;
        message: string;
        createdAt: string;
        senderId: string;
    } | null;
    unreadCount: number;
}

const LandlordLiveChatPage: React.FC = () => {
    // State management
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageQueueRef = useRef<any[]>([]);
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000;

    // Get admin token from localStorage
    const getAdminToken = () => localStorage.getItem('accessToken');

    // Initialize WebSocket connection
    const connectWebSocket = useCallback(() => {
        const token = getAdminToken();
        if (!token) {
            toast.error('Authentication token not found');
            return;
        }

        // Decode token to get admin ID
        try {
            const decoded = jwtDecode(token) as any;
            if (decoded && decoded.userId) {
                setAdminId(decoded.userId);
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }

        setConnectionStatus('connecting');
        const websocket = new WebSocket("wss://api.simpleroomsng.com");
        setWs(websocket);

        websocket.onopen = () => {
            setConnectionStatus('connected');
            reconnectAttempts.current = 0;

            // Authenticate as admin
            websocket.send(JSON.stringify({
                event: "authenticate",
                token,
            }));

            // Fetch conversation list
            websocket.send(JSON.stringify({
                event: "messageList",
            }));

            // Process queued messages
            messageQueueRef.current.forEach(message => {
                websocket.send(JSON.stringify(message));
            });
            messageQueueRef.current = [];
        };

        websocket.onmessage = (event) => {
            try {
                const { event: eventType, data } = JSON.parse(event.data);
                switch (eventType) {
                    case "messageList":
                        // Process conversation list
                        const conversationList = data?.map((item: any) => ({
                            user: item.user,
                            lastMessage: item.lastMessage,
                            unreadCount: 0 // Will be calculated separately
                        }));
                        setConversations(conversationList);
                        break;

                    case "message":
                        // New message from user or admin (our own message)
                        const newMsg: Message = {
                            id: data?._id,
                            text: data?.message,
                            image: data?.images?.[0] || null,
                            sender: data?.senderId === adminId ? 'admin' : 'user',
                            timestamp: data?.createdAt,
                            status: 'delivered'
                        };

                        // Determine which user this message belongs to
                        const messageUserId = data?.senderId === adminId ? data?.receiverId : data?.senderId;

                        // Update messages if this conversation is active
                        if (activeConversation === messageUserId) {
                            setMessages(prev => [...prev, newMsg]);
                        }

                        // Update conversation list
                        setConversations(prev => {
                            const updated = [...prev];
                            const convIndex = updated.findIndex(c => c?.user?._id === messageUserId);

                            if (convIndex !== -1) {
                                updated[convIndex] = {
                                    ...updated[convIndex],
                                    lastMessage: {
                                        _id: data?._id,
                                        message: data?.message,
                                        createdAt: data?.createdAt,
                                        senderId: data?.senderId
                                    },
                                    unreadCount: activeConversation === messageUserId ? 0 :
                                        (data?.senderId === adminId ? 0 : (updated[convIndex].unreadCount + 1))
                                };
                            } else {
                                // New conversation
                                updated.unshift({
                                    user: data?.senderId === adminId ? data?.receiver : data?.sender,
                                    lastMessage: {
                                        _id: data?._id,
                                        message: data?.message,
                                        createdAt: data?.createdAt,
                                        senderId: data?.senderId
                                    },
                                    unreadCount: data?.senderId === adminId ? 0 : 1
                                });
                            }

                            return updated.sort((a, b) =>
                                new Date(b.lastMessage?.createdAt || 0).getTime() -
                                new Date(a.lastMessage?.createdAt || 0).getTime()
                            );
                        });
                        break;

                    case "fetchChats":
                        // Chat history with a user
                        const chatHistory = data.map((chat: any) => ({
                            id: chat?._id,
                            text: chat?.message,
                            image: chat?.images?.[0] || null,
                            sender: chat?.senderId === adminId ? 'admin' : 'user',
                            timestamp: chat?.createdAt,
                            status: 'delivered'
                        }));
                        setMessages(chatHistory);
                        setIsLoading(false);
                        break;

                    case "error":
                        toast.error(data.message || "An error occurred");
                        break;

                    default:
                        console.log("Unknown WebSocket event:", eventType);
                }
            } catch (error) {
                toast.error("Failed to process message");
            }
        };

        websocket.onclose = (event) => {
            console.log("WebSocket disconnected", event.code, event.reason);
            setConnectionStatus('disconnected');
            setWs(null);

            // Attempt reconnection
            if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                setConnectionStatus('connecting');
                reconnectAttempts.current++;
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectWebSocket();
                }, RECONNECT_DELAY);
            } else {
                setConnectionStatus('failed');
                toast.error("Failed to connect to chat server after multiple attempts");
            }
        };

        websocket.onerror = (error) => {
            setConnectionStatus('failed');
        };

        return websocket;
    }, [activeConversation, adminId]);

    // Initialize connection on mount
    useEffect(() => {
        connectWebSocket();
        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connectWebSocket]);

    // Scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle conversation selection
    const handleSelectConversation = (userId: string) => {
        setActiveConversation(userId);
        setIsLoading(true);

        // Reset unread count for this conversation
        setConversations(prev =>
            prev.map(conv =>
                conv?.user?._id === userId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            )
        );

        // Fetch chat history using fetchChats event
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                event: "fetchChats",
                receiverId: userId
            }));
        } else {
            // Queue the request if not connected
            messageQueueRef.current.push({
                event: "fetchChats",
                receiverId: userId
            });
        }
    };

    // Send message
    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeConversation || isSending || !adminId) return;

        const tempId = uuidv4();
        const newMessage: Message = {
            id: tempId,
            text: messageInput,
            sender: 'admin',
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // Add to UI immediately
        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        setIsSending(true);

        // Send via WebSocket using message event
        const messagePayload = {
            event: "message",
            receiverId: activeConversation,
            message: messageInput,
            images: []
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(messagePayload));
        } else {
            // Queue the message if not connected
            messageQueueRef.current.push(messagePayload);
        }

        // Update conversation list
        setConversations(prev => {
            const updated = [...prev];
            const convIndex = updated.findIndex(c => c?.user?._id === activeConversation);

            if (convIndex !== -1) {
                updated[convIndex] = {
                    ...updated[convIndex],
                    lastMessage: {
                        _id: tempId,
                        message: messageInput,
                        createdAt: new Date().toISOString(),
                        senderId: adminId
                    },
                    unreadCount: 0
                };
            }

            return updated.sort((a, b) =>
                new Date(b.lastMessage?.createdAt || 0).getTime() -
                new Date(a.lastMessage?.createdAt || 0).getTime()
            );
        });

        setIsSending(false);
    };

    // Handle key press in message input
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format timestamp
    const formatTime = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (error) {
            return timestamp;
        }
    };

    // Get active user details
    const activeUser = conversations.find(c => c?.user?._id === activeConversation)?.user;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md p-4">
                <h1 className="text-xl font-bold text-gray-800">Admin Live Chat</h1>
                <div className="flex items-center mt-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' :
                        connectionStatus === 'connecting' ? 'bg-yellow-500' :
                            connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                    <span className="text-sm text-gray-600">
                        {connectionStatus === 'connected' ? 'Connected' :
                            connectionStatus === 'connecting' ? 'Connecting...' :
                                connectionStatus === 'failed' ? 'Connection Failed' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Conversation List */}
                <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-700">Conversations</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map(conversation => (
                                <div
                                    key={conversation?.user?._id}
                                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeConversation === conversation?.user?._id ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleSelectConversation(conversation?.user?._id)}
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                                                {conversation?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            {conversation?.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {conversation?.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {conversation?.user?.name || 'Unknown User'}
                                                </h3>
                                                {conversation?.lastMessage && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(conversation?.lastMessage?.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conversation?.lastMessage
                                                        ? (conversation.lastMessage.senderId === adminId ? 'You: ' : '') +
                                                        conversation.lastMessage.message
                                                        : 'No messages yet'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white p-4 border-b border-gray-200 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                                    {activeUser?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="ml-3">
                                    <h2 className="font-semibold text-gray-900">
                                        {activeUser?.name || 'Unknown User'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {activeUser?.email || 'No email available'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="text-gray-500">Loading messages...</div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="text-gray-500">No messages yet. Start a conversation!</div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map(message => (
                                            <div
                                                key={message?.id}
                                                className={`flex ${message?.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'admin'
                                                        ? 'bg-blue-500 text-white rounded-br-none'
                                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                                        }`}
                                                >
                                                    {message.image && (
                                                        <div className="mb-2">
                                                            <Image
                                                                src={message.image}
                                                                alt="Attachment"
                                                                className="max-w-full rounded-md"
                                                                width={200}
                                                                height={200}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="whitespace-pre-wrap">{message.text}</div>
                                                    <div className={`text-xs mt-1 ${message?.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                                                        }`}>
                                                        {formatTime(message.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="bg-white p-4 border-t border-gray-200">
                                <div className="flex items-center">
                                    <textarea
                                        className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Type your message..."
                                        rows={2}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        disabled={connectionStatus !== 'connected'}
                                    />
                                    <button
                                        className="ml-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || connectionStatus !== 'connected' || isSending}
                                    >
                                        {isSending ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center text-gray-500">
                                <div className="text-2xl mb-2">💬</div>
                                <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
                                <p>Choose a user from the list to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandlordLiveChatPage;