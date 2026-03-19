"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, MoreVertical, Phone, Video, Smile, Paperclip, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MessageBubble({ message, isOwn }) {
  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex mb-4 group", isOwn ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-[1.25rem] px-4 py-2.5 text-[14px] font-medium transition-all shadow-sm",
            isOwn
              ? "bg-primary text-white rounded-tr-none shadow-primary/10"
              : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
          )}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{time}</span>
          {isOwn && <span className="text-[10px] font-bold text-primary">READ</span>}
        </div>
      </div>
    </motion.div>
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

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      setLoading(true);
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => { scrollToBottom(); }, [messages]);

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
    } catch (e) {}
    return () => {
      try {
        const { pusherClient } = require("@/lib/pusher-client");
        if (pusherClient) pusherClient.unsubscribe(`conversation-${conversationId}`);
      } catch (e) {}
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const text = newMessage;
    setNewMessage("");
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const sent = {
          _id: Date.now().toString(),
          conversationId,
          senderId: session.user.id,
          content: text,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, sent]);
      }
    } catch (e) { console.error(e); }
    setSending(false);
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 m-4">
        <div className="text-center">
          <div className="h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-gray-200" />
          </div>
          <p className="text-lg font-bold text-gray-900">Choose a Hustler</p>
          <p className="text-sm font-medium mt-1">Select a conversation to start making moves.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 m-4 overflow-hidden shadow-sm">
      {/* Header */}
      {otherUser && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-white/80">
          <div className="flex items-center gap-3">
            <UserAvatar src={otherUser.avatar} name={otherUser.name} size="md" className="ring-2 ring-white" />
            <div>
              <p className="text-[15px] font-bold text-gray-900">{otherUser.name}</p>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-gray-900"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-gray-900"><Video className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-gray-900"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                <div className="h-12 w-64 bg-gray-100 rounded-[1.25rem] shimmer" />
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
          <div className="flex flex-col items-center justify-center py-12">
             <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
               <Smile className="h-8 w-8 text-primary/40" />
             </div>
             <p className="text-sm font-bold text-gray-400">Secure end-to-end encrypted</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-2">
        <div className="relative flex items-center gap-2 bg-white rounded-[1.5rem] border border-gray-100 p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 shrink-0"><Paperclip className="h-4 w-4" /></Button>
          <input
            type="text"
            placeholder="Write your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent border-0 text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:ring-0 px-1"
          />
          <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 shrink-0"><Smile className="h-4 w-4" /></Button>
          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
