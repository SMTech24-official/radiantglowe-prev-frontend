/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import WarningModal from '@/components/shared/WarningModal';
import {
    useCreateMessageMutation,
    useGetMessageConversationsQuery,
    useGetMessagesQuery,
} from '@/redux/api/chatApi';
import { useUploadFileMutation } from '@/redux/api/uploaderApi';
import { containsRestrictedContent } from '@/utils/containsRestrictedContent';
import { formatDistanceToNow } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiPaperclip, FiSend, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

// Types
interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
}

interface Message {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        email: string;
        image?: string;
    };
    receiverId: {
        _id: string;
        name: string;
        email: string;
    };
    propertyId: string;
    message: string;
    imageUrl?: string;
    isRead: boolean;
    createdAt: string;
}

interface Conversation {
    _id: {
        propertyId: string;
        otherId: string;
    };
    lastMessage: string;
    lastImageUrl?: string;
    lastMessageTime: string;
    unreadCount: number;
    otherUser: User;
    property: {
        _id: string;
        headlineYourProperty: string;
    };
}

const LandlordLiveChatPage: React.FC = () => {
    // State management
    const [activeConversation, setActiveConversation] = useState<{
        userId: string;
        propertyId: string;
    } | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(true);
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const router = useRouter();
    // RTK Query hooks
    const { data: conversationsData, refetch: refetchConversations } =
        useGetMessageConversationsQuery();
    const { data: messagesData, refetch: refetchMessages, isLoading: isChatLoading } =
        useGetMessagesQuery(
            activeConversation
                ? { otherUserId: activeConversation.userId, propertyId: activeConversation.propertyId }
                : { skip: true }
        );
    const [createMessage, { isLoading: isSending }] = useCreateMessageMutation();

    // Polling for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            refetchConversations();
            if (activeConversation) {
                refetchMessages();
            }
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [refetchConversations, refetchMessages, activeConversation]);

    // Get admin ID from token
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token) as any;
                if (decoded?.userId) {
                    setAdminId(decoded.userId);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                toast.error('Authentication failed');
            }
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesData]);

    // Handle conversation selection
    const handleSelectConversation = useCallback(
        (userId: string, propertyId: string) => {
            setActiveConversation({ userId, propertyId });
            refetchMessages();
            // Optionally, trigger a backend call to mark messages as read if needed
        },
        []
    );

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setImageUploading(true);
        try {
            const formData = new FormData();
            formData.append('images', file);
            const uploadResponse = await uploadFile(formData).unwrap();
            const imageUrl = uploadResponse.data?.[0];
            if (imageUrl) {
                setImageFile(file);
                setImageUrl(imageUrl);
            }
        } catch (error) {
            toast.error('Failed to upload image');
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setImageUploading(false);
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!messageInput.trim() && !imageFile) return;
        if (!activeConversation || !adminId) return;

        // if (containsRestrictedContent(messageInput.trim())) {
        //     toast.error("Sharing contact info is not allowed.");
        //     return;
        // }
        let imageLink = null;
        if (imageUrl) {
            imageLink = imageUrl;
        }

        const payload = {
            receiverId: activeConversation.userId,
            propertyId: activeConversation.propertyId,
            message: messageInput.trim(),
            imageUrl: imageLink ?? undefined,
        };

        try {
            await createMessage(payload).unwrap();
            setMessageInput('');
            setImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            refetchMessages();
            refetchConversations();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    // Handle key press
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

    // Group messages by sender
    const groupMessages = (messages: Message[]) => {
        const grouped: { senderId: string; messages: Message[]; timestamp: string }[] = [];
        let currentGroup: Message[] = [];
        let currentSenderId: string | null = null;

        messages.forEach((msg, index) => {
            if (currentSenderId !== msg.senderId._id) {
                if (currentGroup.length > 0) {
                    grouped.push({
                        senderId: currentSenderId!,
                        messages: currentGroup,
                        timestamp: currentGroup[0].createdAt,
                    });
                }
                currentGroup = [msg];
                currentSenderId = msg.senderId._id;
            } else {
                currentGroup.push(msg);
            }

            if (index === messages.length - 1 && currentGroup.length > 0) {
                grouped.push({
                    senderId: currentSenderId!,
                    messages: currentGroup,
                    timestamp: currentGroup[0].createdAt,
                });
            }
        });

        return grouped;
    };

    const activeUser = conversationsData?.data?.conversations?.find(
        (c: Conversation) => c._id.otherId === activeConversation?.userId &&
            c._id.propertyId === activeConversation?.propertyId
    )?.otherUser;

    return (
        <div className="p-4">
            <div className="max-w-full mx-auto flex flex-col lg:flex-row gap-4 max-h-[calc(100vh-8rem)] h-full">
                {/* Conversation List */}
                <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-800">Conversations</h1>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversationsData?.data?.conversations?.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No conversations yet</div>
                        ) : (
                            conversationsData?.data?.conversations?.map((conversation: Conversation) => (
                                <div
                                    key={`${conversation._id.propertyId}-${conversation._id.otherId}`}
                                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeConversation?.userId === conversation._id.otherId &&
                                        activeConversation?.propertyId === conversation._id.propertyId
                                        ? 'bg-gray-100'
                                        : ''
                                        }`}
                                    onClick={() =>
                                        handleSelectConversation(conversation._id.otherId, conversation._id.propertyId)
                                    }
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                                                {conversation.otherUser.name.charAt(0).toUpperCase()}
                                            </div>
                                            {conversation.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {conversation.otherUser.name}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(conversation.lastMessageTime)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {conversation.lastMessage || 'No messages yet'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {conversation.property.headlineYourProperty}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md flex flex-col">
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                                    {activeUser?.name.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="ml-3">
                                    <h2 className="font-semibold text-gray-900">
                                        Chat with {activeUser?.name || 'Unknown User'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {activeUser?.email || 'No email available'}
                                    </p>
                                    <p
                                        onClick={() => router.push(`/all-tenants/${activeUser?._id}`)}
                                        className="text-sm text-blue-600 underline cursor-pointer">
                                        View Profile
                                    </p>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div
                                ref={chatContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-6 bg-white"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {isChatLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
                                    </div>
                                ) : messagesData?.data?.messages?.length === 0 ? (
                                    <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                                        No messages yet. Start a conversation!
                                    </div>
                                ) : (
                                    <>
                                        {groupMessages(messagesData?.data?.messages || []).map((group, groupIndex) => {
                                            const firstMsg = group.messages[0];
                                            const senderType = firstMsg.senderId._id === adminId ? 'user' : 'landlord';
                                            const senderName = senderType === 'user' ? 'You' : firstMsg.senderId.name;
                                            const avatarSrc = firstMsg.senderId.image;

                                            return (
                                                <div key={groupIndex} className="flex items-start space-x-2">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                                                            {avatarSrc ? (
                                                                <Image
                                                                    src={typeof avatarSrc === 'string' && avatarSrc.length > 0 ? avatarSrc : '/placeholder.svg'}
                                                                    alt={`${senderName} avatar`}
                                                                    width={32}
                                                                    height={32}
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium text-sm">
                                                                    {senderName.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs text-gray-500">
                                                            {senderName} sent a message {formatTime(firstMsg.createdAt)}
                                                        </div>
                                                        <div className="border-l-2 border-gray-300 pl-2 mt-1">
                                                            {group.messages.map((msg) => (
                                                                <div key={msg._id} className="text-sm text-gray-800 break-words py-1">
                                                                    {msg.message}
                                                                    {msg.imageUrl && (
                                                                        <div className="mt-2">
                                                                            <Image
                                                                                src={msg.imageUrl}
                                                                                alt="Attached image"
                                                                                width={200}
                                                                                height={200}
                                                                                className="rounded-md"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                                {imageFile && (
                                    <div className="mb-2 relative inline-block">
                                        <Image
                                            src={URL.createObjectURL(imageFile)}
                                            alt="Preview"
                                            width={80}
                                            height={80}
                                            className="rounded-md border border-gray-300"
                                        />
                                        <button
                                            onClick={() => {
                                                setImageFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                        >
                                            <FiX className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex space-x-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                        disabled={imageUploading || isSending}
                                    >
                                        <FiPaperclip className="h-5 w-5 text-gray-600" />
                                    </button>
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type your message here"
                                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none min-h-[40px] max-h-24"
                                        onKeyPress={handleKeyPress}
                                        disabled={isSending || imageUploading}
                                        rows={1}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                        disabled={(!messageInput.trim() && !imageFile) || isUploading || isSending}
                                    >
                                        {isUploading || isSending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <FiSend className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-2xl mb-2">💬</div>
                                <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
                                <p>Choose a user from the list to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='relative'>
                <WarningModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </div>
    );
};

export default LandlordLiveChatPage;