/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CustomCalendar from "./CustomCalendar";
import { FiCalendar, FiSend, FiX, FiImage, FiPaperclip, FiSmile } from "react-icons/fi";
import { format } from "date-fns";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { jwtDecode } from "jwt-decode";
import { Loader2Icon, CheckIcon, Check } from "lucide-react";
import Image from "next/image";
import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useCreatePermissionMutation, useGetTenantpermissionQuery } from "@/redux/api/permissionApi";

// Define the Message interface
interface Message {
  id: string;
  text: string;
  image: string | null;
  sender: "user" | "landlord";
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "failed";
}

// Connection status enum
enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  FAILED = "failed"
}

export default function BookingCard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const user = useDecodedToken(localStorage.getItem("accessToken"));

  const { id } = useParams();
  const { data: property } = usePropertyDetailsWithReviewQuery(id);
  const { data: permisionData } = useGetTenantpermissionQuery({
    tenantId: user?.userId,
    propertyId: id
  })
  const [permissionMutate, { isLoading: isPermissionLoading }] = useCreatePermissionMutation()

  const router = useRouter();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user?.userId) {
      toast.error("Please log in to chat with the landlord.");
      setIsChatOpen(false);
      return;
    }

    setConnectionStatus(ConnectionStatus.CONNECTING);

    const websocket = new WebSocket("wss://api.simpleroomsng.com");
    setWs(websocket);

    websocket.onopen = () => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setReconnectAttempts(0);

      // Authenticate
      websocket.send(JSON.stringify({
        event: "authenticate",
        token,
      }));

      // Send queued messages
      messageQueue.forEach(message => {
        websocket.send(JSON.stringify(message));
      });
      setMessageQueue([]);
    };

    websocket.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data);

        switch (eventType) {
          case "message":
            const newMsg: Message = {
              id: data._id,
              text: data.message,
              image: data.images?.[0] || null,
              sender: data.senderId === user.userId ? "user" : "landlord",
              timestamp: data.createdAt,
              status: "delivered"
            };

            setMessages(prev => {
              // First check if we already have this message (by ID)
              if (prev.some(m => m.id === newMsg.id)) {
                return prev;
              }

              // If it's our own message, check if we have a temporary version
              if (newMsg.sender === "user") {
                // Find index of temporary message with same content
                const tempMsgIndex = prev.findIndex(m => 
                  m.id.startsWith('temp_') && 
                  m.text === newMsg.text && 
                  (m.image === newMsg.image || (typeof m.image === 'string' && m.image.startsWith('blob:') && !!newMsg.image))
                );

                if (tempMsgIndex !== -1) {
                  // Replace temporary message with the real one
                  const updatedMessages = [...prev];
                  updatedMessages[tempMsgIndex] = newMsg;
                  return updatedMessages;
                }
              }

              // Otherwise add as new message
              return [...prev, newMsg];
            });
            break;

          case "fetchChats":
            const chatMessages = data.map((chat: any) => ({
              id: chat._id,
              text: chat.message,
              image: chat.images?.[0] || null,
              sender: chat.senderId === user.userId ? "user" : "landlord",
              timestamp: chat.createdAt,
              status: "delivered"
            }));

            setMessages(chatMessages);
            setIsChatLoading(false);
            break;

          case "typing":
            if (data.senderId !== user.userId) {
              setIsTyping(true);
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
              }, 3000);
            }
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
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setWs(null);

      // Attempt reconnection if it wasn't a manual close
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && isChatOpen) {
        setConnectionStatus(ConnectionStatus.RECONNECTING);
        setReconnectAttempts(prev => prev + 1);

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_DELAY * Math.pow(2, reconnectAttempts)); // Exponential backoff
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus(ConnectionStatus.FAILED);
        toast.error("Failed to connect to chat server after multiple attempts");
      }
    };

    websocket.onerror = (error) => {
      setConnectionStatus(ConnectionStatus.FAILED);
    };

    return websocket;
  }, [user?.userId, reconnectAttempts, messageQueue, isChatOpen]);

  // WebSocket setup effect
  useEffect(() => {
    if (!isChatOpen) {
      // Clean up when chat closes
      if (ws) {
        ws.close(1000, "Chat closed");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setReconnectAttempts(0);
      setMessages([]);
      setMessageQueue([]);
      return;
    }

    const websocket = connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close(1000, "Component unmounting");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isChatOpen]);

  // Fetch chats when connected
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.CONNECTED && ws && property?.data?.landlordId && messages.length === 0) {
      setIsChatLoading(true);
      ws.send(JSON.stringify({
        event: "fetchChats",
        receiverId: property.data.landlordId._id,
      }));
    }
  }, [connectionStatus, ws, property?.data?.landlordId, messages.length]);

  const sendMessage = useCallback((message: any) => {
    if (ws && connectionStatus === ConnectionStatus.CONNECTED) {
      ws.send(JSON.stringify(message));
    } else {
      setMessageQueue(prev => [...prev, message]);
      if (connectionStatus === ConnectionStatus.DISCONNECTED) {
        connectWebSocket();
      }
    }
  }, [ws, connectionStatus, connectWebSocket]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
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

    try {
      let imageUrl: string | null = null;

      if (selectedImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("images", selectedImage);
        const uploadResponse = await uploadFile(uploadFormData).unwrap();
        imageUrl = uploadResponse.data?.[0] || null;
      }

      // Add temporary message to UI immediately with unique temp ID
      const tempId = `temp_${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        text: messageText,
        image: selectedImage ? URL.createObjectURL(selectedImage) : null,
        sender: "user",
        timestamp: new Date().toISOString(),
        status: "sending"
      };

      setMessages(prev => [...prev, tempMessage]);

      const messageData = {
        event: "message",
        receiverId: property.data.landlordId._id,
        message: messageText,
        images: imageUrl ? [imageUrl] : [],
      };

      // Update message status to sent
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: "sent" as const, image: imageUrl || msg.image } : msg
      ));

      sendMessage(messageData);

    } catch (error) {
      toast.error("Failed to send message");

      // Update message status to failed for any temp messages
      setMessages(prev => prev.map(msg =>
        msg.sender === "user" && msg.status === "sent" ? { ...msg, status: "failed" as const } : msg
      ));
    } finally {
      setNewMessage("");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTyping = useCallback(() => {
    if (ws && connectionStatus === ConnectionStatus.CONNECTED && property?.data?.landlordId) {
      ws.send(JSON.stringify({
        event: "typing",
        receiverId: property.data.landlordId._id,
      }));
    }
  }, [ws, connectionStatus, property?.data?.landlordId]);

  const handleBookNowBtn = () => {
    if(!user){
      toast.error("Please log in to book this property.");
      return;
    }
    if (property?.data?.status === "pending") {
      if (permisionData?.data?.status === "granted") {
        router.push(`/properties/${id}/payment`);
        return;
      }
      if(permisionData?.data?.status !== "granted"){
        toast.error("Permission not granted. Please contact the landlord.");
        return;
      }
    };
    if (property?.data?.status === "rented") {
      toast.error("Property is already Booked");
      return
    };
    if (!permisionData || !permisionData?.data) {
      permissionMutate({
        landlordId: property?.data?.landlordId._id,
        propertyId: property?.data?._id,
        tenantId: user?.userId
      }).unwrap().then(() => {
        toast.error("Request sent successfully. Please Conatct Landlord to Granted");
      }).catch((error) => {
        toast.error(error?.data?.message || "Failed to send permission request");
      });
    } else if (permisionData?.data?.status !== "granted") {
      toast.error("Permission not granted. Please Conatct Landlord");
    }
    else {
      router.push(`/properties/${id}/payment`);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return "text-green-600";
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return "text-yellow-600";
      case ConnectionStatus.FAILED:
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return "Online";
      case ConnectionStatus.CONNECTING:
        return "Connecting...";
      case ConnectionStatus.RECONNECTING:
        return "Reconnecting...";
      case ConnectionStatus.FAILED:
        return "Connection failed";
      default:
        return "Offline";
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "h:mm a");
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const renderMessageStatus = (status?: string) => {
    switch (status) {
      case "sending":
        return <Loader2Icon className="h-3 w-3 animate-spin opacity-50" />;
      case "sent":
        return <CheckIcon className="h-3 w-3 opacity-50" />;
      case "delivered":
        return <div className="flex"><CheckIcon className="h-3 w-3 opacity-50" /><CheckIcon className="h-3 w-3 -ml-1 opacity-50" /></div>;
      case "failed":
        return <span className="text-red-500 text-xs">Failed</span>;
      default:
        return null;
    }
  };

  const handleContactLandlord = () => {
    if(!user){
      toast.error("Please log in to contact the landlord.");
      return;
    }

    if (user?.role === 'tenant') {
      if (!permisionData || !permisionData?.data) {
        permissionMutate({
          landlordId: property?.data?.landlordId._id,
          propertyId: property?.data?._id,
          tenantId: user?.userId
        }).unwrap().then(() => {
          toast.success("Permission Request sent successfully");
          setIsChatOpen(true)
        }).catch((error) => {
          toast.error(error?.data?.message || "Failed to send permission request");
        });
      } else {
        setIsChatOpen(true)
      }

    } else {
      toast.error("Only tenants can chat with landlords");
    }
  }

  return (
    <div className="ml-auto w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="mb-2">
        <span className="text-3xl font-bold text-primary">
          ₦{property?.data?.rentPerMonth}
        </span>
      </div>
      <h3 className="text-lg font-medium text-primary mb-6">Viewing request</h3>

      {
        user?.role !== "landlord" && (
          <>
            <Button
              onClick={() => handleContactLandlord()}
              className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mb-4 transition-all duration-200"
            >
              {
                isPermissionLoading ? <p className="flex gap-1 justify-center items-center"><Loader2Icon className="h-4 w-4 animate-spin" /> <span>Contact Landlord</span></p> : 'Contact Landlord'
              }
            </Button>

            <Button
              onClick={handleBookNowBtn}
              variant="outline"
              className="cursor-pointer w-full h-12 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 bg-transparent transition-all duration-200"
            >
              Book Now
            </Button>
          </>
        )
      }

      {/* Professional Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg h-[85vh] max-h-[600px] flex flex-col shadow-2xl">

            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {property?.data?.landlordId?.name?.charAt(0)?.toUpperCase() || 'L'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property?.data?.landlordId?.name || 'Landlord'}
                  </h3>
                  <p className={`text-xs ${getConnectionStatusColor()}`}>
                    {getConnectionStatusText()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-600" />
              </Button>
            </div>

            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
              style={{ scrollBehavior: 'smooth' }}
            >
              {isChatLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <FiSend className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-gray-500">Start a conversation</p>
                    <p className="text-sm text-gray-400">Send a message to the landlord</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
                    const isConsecutive = index > 0 && messages[index - 1].sender === msg.sender;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                      >
                        <div className={`flex max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          {/* Avatar */}
                          <div className={`flex-shrink-0 ${msg.sender === "user" ? "ml-2" : "mr-2"}`}>
                            {showAvatar ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${msg.sender === "user"
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}>
                                {msg.sender === "user" ? "Y" : property?.data?.landlordId?.name?.charAt(0)?.toUpperCase() || 'L'}
                              </div>
                            ) : (
                              <div className="w-8 h-8"></div>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 shadow-sm ${msg.sender === "user"
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                                } ${isConsecutive ? 'rounded-2xl' : ''}`}
                            >
                              {msg.image && (
                                <div className="mb-2">
                                  <Image
                                    src={msg.image}
                                    alt="Uploaded"
                                    className="max-w-full h-auto rounded-lg"
                                    width={200}
                                    height={200}
                                  />
                                </div>
                              )}
                              {msg.text && (
                                <p className="text-sm leading-relaxed break-words">
                                  {msg.text}
                                </p>
                              )}
                            </div>

                            {/* Message Info */}
                            <div className={`flex items-center space-x-1 mt-1 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                              <span className="text-xs text-gray-400">
                                {formatMessageTime(msg.timestamp)}
                              </span>
                              {msg.sender === "user" && renderMessageStatus(msg.status)}
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
                            {property?.data?.landlordId?.name?.charAt(0)?.toUpperCase() || 'L'}
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

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white rounded-b-2xl">
              {/* Image Preview */}
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="max-w-[120px] h-auto"
                      width={120}
                      height={120}
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />

                <Button
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  disabled={isUploading || connectionStatus !== ConnectionStatus.CONNECTED}
                >
                  <FiPaperclip className="h-5 w-5 text-gray-500" />
                </Button>

                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message..."
                    className="w-full p-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm max-h-20 min-h-[44px]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={connectionStatus !== ConnectionStatus.CONNECTED}
                    rows={1}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  className="p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-50"
                  disabled={
                    (!newMessage.trim() && !selectedImage) ||
                    isUploading ||
                    connectionStatus !== ConnectionStatus.CONNECTED
                  }
                >
                  {isUploading ? (
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                  ) : (
                    <FiSend className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Connection Status */}
              {connectionStatus !== ConnectionStatus.CONNECTED && (
                <div className="mt-2 text-center">
                  <span className={`text-xs ${getConnectionStatusColor()}`}>
                    {connectionStatus === ConnectionStatus.RECONNECTING &&
                      `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
                    }
                    {connectionStatus === ConnectionStatus.CONNECTING && "Connecting to chat..."}
                    {connectionStatus === ConnectionStatus.FAILED && "Connection failed. Please try again."}
                    {connectionStatus === ConnectionStatus.DISCONNECTED && "Disconnected"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}