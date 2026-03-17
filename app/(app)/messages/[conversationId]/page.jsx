"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const activeConv = conversations.find((c) => c._id === conversationId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-[calc(100vh-120px)] min-h-[500px]">
      {/* Sidebar */}
      <div
        className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${conversationId ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={conversationId}
            />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${!conversationId ? "hidden md:flex" : "flex"}`}
      >
        <ChatWindow
          conversationId={conversationId}
          otherUser={activeConv?.otherUser}
        />
      </div>
    </div>
  );
}
