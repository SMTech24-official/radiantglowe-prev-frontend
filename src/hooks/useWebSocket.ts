/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// Define the Message interface
export interface Message {
  id: string;
  text: string;
  image: string | null;
  sender: "user" | "landlord";
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "failed";
}

// Connection status enum
export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  FAILED = "failed",
}

// Constants
export const MAX_RECONNECT_ATTEMPTS = 5;
export const RECONNECT_DELAY = 2000;

interface WebSocketHookOptions {
  url: string;
  receiverId?: string;
  onMessage?: (message: Message) => void;
  onMessages?: (messages: Message[]) => void;
  onTyping?: (isTyping: boolean) => void;
  onError?: (error: string) => void;
}

interface WebSocketHook {
  ws: WebSocket | null;
  connectionStatus: ConnectionStatus;
  sendMessage: (message: any) => void;
  userId: string | null;
  isTyping: boolean;
  connect: () => void;
  disconnect: () => void;
  reconnectAttempts: number; // Added to expose reconnect attempts
}

export const useWebSocket = ({
  url,
  receiverId,
  onMessage,
  onMessages,
  onTyping,
  onError,
}: WebSocketHookOptions): WebSocketHook => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize user ID from token
  const initializeUser = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please log in to use chat.");
      return false;
    }

    try {
      const decodedToken = jwtDecode<{ userId: string }>(token);
      setUserId(decodedToken.userId || null);
      return true;
    } catch (error) {
      toast.error("Invalid token. Please log in again.");
      return false;
    }
  }, []);

  // WebSocket connection logic
  const connect = useCallback(() => {
    if (!initializeUser()) {
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    setConnectionStatus(ConnectionStatus.CONNECTING);
    const websocket = new WebSocket(url);
    setWs(websocket);

    const token = localStorage.getItem("accessToken");

    websocket.onopen = () => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setReconnectAttempts(0);

      // Authenticate
      websocket.send(
        JSON.stringify({
          event: "authenticate",
          token,
        })
      );

      // Send queued messages
      messageQueue.forEach((message) => websocket.send(JSON.stringify(message)));
      setMessageQueue([]);

      // Fetch chats if receiverId is provided
      if (receiverId) {
        websocket.send(
          JSON.stringify({
            event: "fetchChats",
            receiverId,
          })
        );
      }
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
              sender: data.senderId === userId ? "user" : "landlord",
              timestamp: data.createdAt,
              status: "delivered",
            };
            onMessage?.(newMsg);
            break;

          case "fetchChats":
            const chatMessages = data.map((chat: any) => ({
              id: chat._id,
              text: chat.message,
              image: chat.images?.[0] || null,
              sender: chat.senderId === userId ? "user" : "landlord",
              timestamp: chat.createdAt,
              status: "delivered",
            }));
            onMessages?.(chatMessages);
            break;

          case "typing":
            if (data.senderId !== userId) {
              setIsTyping(true);
              onTyping?.(true);
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                onTyping?.(false);
              }, 3000);
            }
            break;

          case "error":
            const errorMsg = data.message || "An error occurred";
            onError?.(errorMsg);
            toast.error(errorMsg);
            break;

          default:
            console.log("Unknown WebSocket event:", eventType);
        }
      } catch (error) {
        onError?.("Failed to process message");
        toast.error("Failed to process message");
      }
    };

    websocket.onclose = (event) => {

      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setWs(null);

      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus(ConnectionStatus.RECONNECTING);
        setReconnectAttempts((prev) => prev + 1);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY * Math.pow(2, reconnectAttempts));
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus(ConnectionStatus.FAILED);
        onError?.("Failed to connect to chat server after multiple attempts");
        toast.error("Failed to connect to chat server after multiple attempts");
      }
    };

    websocket.onerror = (error) => {
      setConnectionStatus(ConnectionStatus.FAILED);
      onError?.("WebSocket connection failed");
    };
  }, [url, receiverId, userId, reconnectAttempts, messageQueue, initializeUser, onMessage, onMessages, onTyping, onError]);

  // Send message with queueing support
  const sendMessage = useCallback(
    (message: any) => {
      if (ws && connectionStatus === ConnectionStatus.CONNECTED) {
        ws.send(JSON.stringify(message));
      } else {
        setMessageQueue((prev) => [...prev, message]);
        if (connectionStatus === ConnectionStatus.DISCONNECTED) {
          connect();
        }
      }
    },
    [ws, connectionStatus, connect]
  );

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (ws) {
      ws.close(1000, "Manual disconnect");
      setWs(null);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setReconnectAttempts(0);
    setMessageQueue([]);
  }, [ws]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ws,
    connectionStatus,
    sendMessage,
    userId,
    isTyping,
    connect,
    disconnect,
    reconnectAttempts,
  };
};