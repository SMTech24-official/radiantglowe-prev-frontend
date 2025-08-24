'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDecodedToken } from '@/hooks/useDecodedToken';
import { useGetMessageConversationsQuery } from '@/redux/api/chatApi';
import { X } from 'lucide-react'; // Using lucide-react for the close icon
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const NotificationBubble = () => {
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();
    const decodedToken = useDecodedToken(localStorage.getItem('accessToken'));
    const role = decodedToken?.role;

    const { data, isLoading } = useGetMessageConversationsQuery(undefined, {
        pollingInterval: 20000,
    });

    const conversations = data?.data?.conversations || [];
    const unreadCount = conversations.reduce(
        (total: any, conversation: any) => total + conversation.unreadCount,
        0
    );

    const uniqueUsers = Array.from(
        new Map(
            conversations.map((conv: any) => [conv.otherUser._id, conv.otherUser])
        ).values()
    );

    const handleBubbleClick = () => {
        if (role === 'landlord') {
            router.push('/landlord-live-chat');
        } else if (role === 'tenant') {
            router.push('/tenants/messages');
        }
    };

    const handleClose = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event from bubbling to parent div
        setIsVisible(false);
    };

    if (!isVisible || unreadCount === 0) return null;

    return (
        <div className="fixed top-28 right-6 z-50">
            <div
                className="relative bg-white rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={handleBubbleClick}
            >
                {/* Stacked Avatars */}
                <div className="flex flex-col items-center">
                    {uniqueUsers?.slice(0, 3).map((user: any, index) => (
                        <Image
                            key={user?._id}
                            src={user?.image || '/placeholder.svg'}
                            alt={user?.name}
                            className={`w-12 h-12 rounded-full bg-gray-300 border-2 border-white object-cover ${index > 0 ? '-mt-4' : ''}`}
                            style={{ zIndex: uniqueUsers.length - index }}
                            width={48}
                            height={48}
                        />
                    ))}
                </div>
                {/* Unread Count */}
                <div className="absolute -top-2 -left-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-[100]">
                    {unreadCount}
                </div>
                {/* Close Button */}
                <button
                    className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover pistols-red-600 transition-colors"
                    onClick={handleClose}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default NotificationBubble;