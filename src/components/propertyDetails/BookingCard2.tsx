/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useCreateMessageMutation, useGetMessagesQuery } from "@/redux/api/chatApi";
import { useCreatePermissionMutation, useGetTenantpermissionQuery } from "@/redux/api/permissionApi";
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { containsRestrictedContent } from "@/utils/containsRestrictedContent";
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend, FiX } from "react-icons/fi";
import { toast } from "sonner";

// Define the Message interface
interface Message {
    _id: string;
    senderId: {
        _id: string;
        email: string;
        name: string;
        avatar?: string;
    };
    receiverId: {
        _id: string;
        email: string;
        name: string;
        avatar?: string;
    };
    propertyId: string;
    message: string;
    imageUrl?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    attachments?: string[];
}

export default function BookingCard2() {
    const searchParams = useSearchParams();
    const isMessaging = searchParams.get('isMessaging');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const user = useDecodedToken(localStorage.getItem("accessToken"));

    const { id } = useParams();
    const { data: property } = usePropertyDetailsWithReviewQuery(id);
    const { data: permissionData } = useGetTenantpermissionQuery({
        tenantId: user?.userId,
        propertyId: id,
    });
    const [permissionMutate, { isLoading: isPermissionLoading }] = useCreatePermissionMutation();
    const router = useRouter();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [createMessage] = useCreateMessageMutation();

    const { data: messagesData, isLoading: messagesLoading, refetch } = useGetMessagesQuery(
        { otherUserId: property?.data?.landlordId?._id, propertyId: id as string },
        { skip: !isChatOpen || !property?.data?.landlordId?._id, pollingInterval: 3000 }
    );

    const messages: Message[] = messagesData?.data?.messages || [];

    // Smooth scroll to bottom
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current && chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, []);

    useEffect(() => {
        if (isChatOpen) {
            scrollToBottom();
        }
    }, [isChatOpen, messages, scrollToBottom]);

    useEffect(() => {
        if (isMessaging) {
            setIsChatOpen(true);
        }
    }, [isMessaging]);

    useEffect(() => {
        if (messagesLoading && isChatOpen) {
            setIsChatLoading(true);
        } else {
            setIsChatLoading(false);
        }
    }, [messagesLoading, isChatOpen]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
                return;
            }
            setSelectedImage(file);
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedImage) || !property?.data?.landlordId) {
            return;
        }
        const messageText = newMessage.trim() || "Image";
        // if (containsRestrictedContent(messageText)) {
        //     toast.error("Sharing contact info is not allowed.");
        //     return;
        // }
        setIsSending(true);

        try {
            let imageUrl: string | undefined = undefined;
            if (selectedImage) {
                const uploadFormData = new FormData();
                uploadFormData.append("images", selectedImage);
                const uploadResponse = await uploadFile(uploadFormData).unwrap();
                imageUrl = uploadResponse.data?.[0];
            }
            await createMessage({
                receiverId: property.data.landlordId._id,
                propertyId: property.data._id,
                message: messageText,
                imageUrl,
            }).unwrap();
            refetch();
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
            setNewMessage("");
            setSelectedImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // const handleBookNowBtn = () => {
    //     if (!user) {
    //         toast.error("Please log in to book this property.");
    //         return;
    //     }
    //     if (property?.data?.status === "pending") {
    //         if (permissionData?.data?.status === "granted") {
    //             router.push(`/properties/${id}/payment`);
    //             return;
    //         }
    //         if (permissionData?.data?.status !== "granted") {
    //             toast.error("Permission not granted. Please contact the landlord.");
    //             return;
    //         }
    //     }
    //     if (property?.data?.status === "rented") {
    //         toast.error("Property is already Booked");
    //         return;
    //     }
    //     if (!permissionData || !permissionData?.data) {
    //         permissionMutate({
    //             landlordId: property?.data?.landlordId._id,
    //             propertyId: property?.data?._id,
    //             tenantId: user?.userId,
    //         })
    //             .unwrap()
    //             .then(() => {
    //                 toast.success("Request sent successfully. Please Contact Landlord to Granted");
    //             })
    //             .catch((error) => {
    //                 toast.error(error?.data?.message || "Failed to send permission request");
    //             });
    //     } else if (permissionData?.data?.status !== "granted") {
    //         toast.error("Permission not granted. Please Contact Landlord");
    //     } else {
    //         router.push(`/properties/${id}/payment`);
    //     }
    // };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return format(date, "MMM d, yyyy, h:mm a");
    };

    const handleContactLandlord = () => {
        if (!user) {
            toast.error("Please log in to contact the landlord.");
            return;
        }
        if (user?.role === "tenant") {
            if (!permissionData || !permissionData?.data) {
                permissionMutate({
                    landlordId: property?.data?.landlordId._id,
                    propertyId: property?.data?._id,
                    tenantId: user?.userId,
                })
                    .unwrap()
                    .then(() => {
                        toast.success("Permission Request sent successfully");
                        setIsChatOpen(true);
                    })
                    .catch((error) => {
                        toast.error(error?.data?.message || "Failed to send permission request");
                    });
            } else {
                setIsChatOpen(true);
            }
        } else {
            toast.error("Only tenants can chat with landlords");
        }
    };

    return (
        <div className="ml-auto w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-2 space-y-2">
                <p className="text-3xl font-bold text-primary">
                    ₦{property?.data?.rentPerYear} <span className="text-sm">/Year</span>
                </p>
                {property?.data?.rentPerMonth > 0 && (
                    <p className="text-3xl font-bold text-primary">
                        ₦{property?.data?.rentPerMonth} <span className="text-sm">/Month</span>
                    </p>
                )}
                {property?.data?.rentPerDay > 0 && (
                    <p className="text-3xl font-bold text-primary">
                        ₦{property?.data?.rentPerDay} <span className="text-sm">/Day</span>
                    </p>
                )}
            </div>
            <h3 className="text-lg font-medium text-primary mb-6">Viewing request</h3>

            {user?.role !== "landlord" && (
                <>
                    <Button
                        onClick={handleContactLandlord}
                        className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mb-4 transition-all duration-200"
                    >
                        {isPermissionLoading ? (
                            <p className="flex gap-1 justify-center items-center">
                                <Loader2Icon className="h-4 w-4 animate-spin" /> <span>Contact Landlord</span>
                            </p>
                        ) : (
                            "Contact Landlord"
                        )}
                    </Button>

                    {/* <Button
                        onClick={handleBookNowBtn}
                        variant="outline"
                        className="cursor-pointer w-full h-12 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 bg-transparent transition-all duration-200"
                    >
                        Book Now
                    </Button> */}
                </>
            )}

            {/* Chat Modal */}
            {isChatOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg h-[85vh] max-h-[600px] flex flex-col shadow-lg">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Send Message To {property?.data?.landlordId?.name || "Landlord"}
                                </h3>
                                <h3 className="text-sm font-semibold text-gray-400">
                                    You will receive a reply within 24 hours
                                </h3>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <FiX className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>

                        {/* Messages Container */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-6 bg-white"
                            style={{ scrollBehavior: "smooth" }}
                        >
                            {isChatLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2Icon className="h-8 w-8 text-gray-500 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                                    No messages yet. Start a conversation!
                                </div>
                            ) : (
                                <>
                                    {messages.reduce((groups: Message[][], msg, index) => {
                                        const previousMsg = messages[index - 1];
                                        if (previousMsg && previousMsg.senderId._id === msg.senderId._id) {
                                            groups[groups.length - 1].push(msg);
                                        } else {
                                            groups.push([msg]);
                                        }
                                        return groups;
                                    }, []).map((group, groupIndex) => {
                                        const firstMsg = group[0];
                                        const senderType = firstMsg.senderId._id === user?.userId ? "user" : "landlord";
                                        const senderName = senderType === "user" ? "You" : firstMsg.senderId.name;
                                        const avatarSrc = senderType === "user" ? user?.avatar : firstMsg.senderId.avatar;

                                        return (
                                            <div key={groupIndex} className="flex items-start space-x-2">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                                                        {avatarSrc ? (
                                                            <Image
                                                                src={typeof avatarSrc === "string" && avatarSrc.length > 0 ? avatarSrc : "/placeholder.svg"}
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
                                                        {senderName} sent a message {formatMessageTime(firstMsg.createdAt)}
                                                    </div>
                                                    <div className="border-l-2 border-gray-300 pl-2 mt-1">
                                                        {group.map((msg) => (
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
                            {selectedImage && (
                                <div className="mb-2 relative inline-block">
                                    <Image
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Preview"
                                        width={80}
                                        height={80}
                                        className="rounded-md border border-gray-300"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedImage(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
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
                                <Button
                                    variant="ghost"
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isSending}
                                >
                                    <FiPaperclip className="h-5 w-5 text-gray-600" />
                                </Button>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here"
                                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none min-h-[40px] max-h-24"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={isSending || isUploading}
                                    rows={1}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                    disabled={(!newMessage.trim() && !selectedImage) || isUploading || isSending}
                                >
                                    {isUploading || isSending ? (
                                        <Loader2Icon className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <FiSend className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}