"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MessageBubble({ message, isOwn }) {
  const timeAgo = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : "";

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "bg-[#FF6B35] text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm",
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-white/70" : "text-gray-400",
          )}
        >
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export default function ChatWindow({ conversationId, otherUser }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pusher real-time (optional)
  useEffect(() => {
    if (!conversationId) return;
    let channel;
    try {
      const { pusherClient } = require("@/lib/pusher-client");
      if (pusherClient) {
        channel = pusherClient.subscribe(`conversation-${conversationId}`);
        channel.bind("new-message", (data) => {
          setMessages((prev) => [...prev, data.message]);
        });
      }
    } catch (e) {
      // Pusher not configured
    }
    return () => {
      try {
        const { pusherClient } = require("@/lib/pusher-client");
        if (pusherClient) {
          pusherClient.unsubscribe(`conversation-${conversationId}`);
        }
      } catch (e) {}
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        const sent = {
          _id: Date.now().toString(),
          conversationId,
          senderId: session.user.id,
          content: newMessage,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, sent]);
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Choose someone to start chatting with</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      {otherUser && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <UserAvatar
            src={otherUser.avatar}
            name={otherUser.name}
            size="sm"
            online
          />
          <div>
            <p className="text-sm font-semibold">{otherUser.name}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
              >
                <div className="h-10 w-48 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId === session?.user?.id}
            />
          ))
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hello! 👋
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            size="icon"
            className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white rounded-full h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
