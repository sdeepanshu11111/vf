"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Hash, Video, BarChart2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import VfRoundMark from "@/components/brand/VfRoundMark";

const postTypes = [
  { value: "tip", label: "GROWTH TIP", activeColor: "bg-[#2563eb] text-white border-transparent", defaultColor: "bg-white text-[#64748b] border-slate-200 hover:bg-slate-50" },
  { value: "win", label: "SHARE A WIN", activeColor: "bg-[#2563eb] text-white border-transparent", defaultColor: "bg-white text-[#64748b] border-slate-200 hover:bg-slate-50" },
  { value: "question", label: "ASK FOR HELP", activeColor: "bg-[#2563eb] text-white border-transparent", defaultColor: "bg-white text-[#64748b] border-slate-200 hover:bg-slate-50" },
  { value: "sourcing", label: "SOURCING TIP", activeColor: "bg-[#2563eb] text-white border-transparent", defaultColor: "bg-white text-[#64748b] border-slate-200 hover:bg-slate-50" },
];

export default function PostComposer({ onPostCreated }) {
  const { data: session } = useSession();
  const { requestAuth } = useAuthPrompt();
  
  const [content, setContent] = useState("");
  const [type, setType] = useState("tip");
  const [tags, setTags] = useState("");
  
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUrlStr, setImageUrlStr] = useState("");
  
  const [videoUrl, setVideoUrl] = useState("");
  
  const [pollOptions, setPollOptions] = useState([{ text: "", votes: [] }, { text: "", votes: [] }]);
  
  const [activeTab, setActiveTab] = useState(null);
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !type) return;
    setIsSubmitting(true);
    setError("");
    
    const validPollOptions = pollOptions.filter(o => o.text.trim());
    const pollData = validPollOptions.length >= 2 ? { options: validPollOptions } : null;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content: content.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: imageUrls,
          video: videoUrl.trim() || null,
          poll: pollData
        }),
      });
      if (res.ok) {
        setContent(""); 
        setTags(""); 
        setImageUrls([]); 
        setVideoUrl("");
        setPollOptions([{ text: "", votes: [] }, { text: "", votes: [] }]);
        setActiveTab(null); 
        setIsExpanded(false);
        onPostCreated?.();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create post.");
      }
    } catch { setError("Network error."); }
    finally { setIsSubmitting(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addImageUrl = () => {
    if (imageUrlStr.trim() && !imageUrls.includes(imageUrlStr.trim())) {
      setImageUrls([...imageUrls, imageUrlStr.trim()]);
      setImageUrlStr("");
    }
  };

  const removeImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const toggleTab = (tab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, { text: "", votes: [] }]);
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index].text = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  if (!session) {
    return (
      <div className="bg-white mb-4 sm:mb-5 overflow-visible rounded-[2rem] shadow-sm border border-slate-100 relative z-10">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-full overflow-hidden opacity-90 shrink-0 ring-1 ring-slate-100 shadow-sm flex items-center justify-center bg-red-600 text-white font-bold">
              ?
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                placeholder="Share a win, ask for help, or drop a sourcing tip..."
                className="w-full resize-none border-0 bg-transparent text-[16px] font-medium placeholder:text-slate-500 text-slate-800 focus:outline-none focus:ring-0 min-h-[50px] leading-relaxed pt-2.5"
                disabled
                rows={1}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white mb-4 sm:mb-5 overflow-visible rounded-[2rem] shadow-sm border border-slate-100 relative z-10">
      <div className="p-4 sm:p-6 sm:pb-5 transition-all">
        <div className="flex items-start gap-3 sm:gap-4">
          <UserAvatar src={session.user.avatar} name={session.user.name} size="md" className="shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <textarea
              placeholder="Share a win, ask for help, or drop a sourcing tip..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              className="w-full resize-none border-0 bg-transparent text-[16px] font-medium placeholder:text-slate-500 text-slate-800 focus:outline-none focus:ring-0 transition-all min-h-[50px] leading-relaxed pt-2"
              rows={isExpanded ? 3 : 1}
            />

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 pt-4 border-t border-slate-100 space-y-4">
                    
                    <div className="flex flex-wrap gap-2.5">
                      {postTypes.map((pt) => {
                        const isSelected = type === pt.value;
                        return (
                          <button
                            key={pt.value}
                            onClick={() => setType(pt.value)}
                            className={cn(
                              "px-3.5 py-2 rounded-full text-[11px] font-black tracking-widest transition-all duration-200 border",
                              isSelected ? pt.activeColor : pt.defaultColor
                            )}
                          >
                            {pt.label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative group">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Tags (comma separated)"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full bg-[#F8FAFC] border border-slate-100 rounded-2xl pl-9 pr-4 py-3 text-[14px] font-medium focus:outline-none focus:border-slate-200 transition-all text-slate-600 placeholder:text-slate-400"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleTab('image')}
                          className={cn(
                            "h-[46px] w-[46px] flex items-center justify-center rounded-2xl transition-all border", 
                            activeTab === 'image' || imageUrls.length > 0
                              ? "bg-blue-50/50 border-blue-100 text-[#2563eb]" 
                              : "bg-[#F8FAFC] border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          )}
                        >
                          <ImageIcon className="h-[20px] w-[20px]" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => toggleTab('video')}
                          className={cn(
                            "h-[46px] w-[46px] flex items-center justify-center rounded-2xl transition-all border", 
                            activeTab === 'video' || videoUrl
                              ? "bg-blue-50/50 border-blue-100 text-[#2563eb]" 
                              : "bg-[#F8FAFC] border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          )}
                        >
                          <Video className="h-[20px] w-[20px]" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => toggleTab('poll')}
                          className={cn(
                            "h-[46px] w-[46px] flex items-center justify-center rounded-2xl transition-all border", 
                            activeTab === 'poll' || pollOptions[0].text
                              ? "bg-blue-50/50 border-blue-100 text-[#2563eb]" 
                              : "bg-[#F8FAFC] border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          )}
                        >
                          <BarChart2 className="h-[20px] w-[20px]" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {activeTab === 'image' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3"
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Paste high-res image URL..."
                              value={imageUrlStr}
                              onChange={(e) => setImageUrlStr(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-blue-300"
                            />
                            <Button type="button" onClick={addImageUrl} variant="outline" className="rounded-xl shrink-0 h-[38px]">Add</Button>
                          </div>
                          {imageUrls.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {imageUrls.map((url, i) => (
                                <div key={i} className="relative w-[70px] h-[70px] rounded-xl overflow-hidden border border-slate-200 group shadow-sm bg-white">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-5 h-5 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === 'video' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3"
                        >
                          <input
                            type="text"
                            placeholder="Paste YouTube or MP4 video URL..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-300"
                          />
                        </motion.div>
                      )}

                      {activeTab === 'poll' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 space-y-3"
                        >
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Poll Options</label>
                          {pollOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                value={opt.text}
                                onChange={(e) => updatePollOption(i, e.target.value)}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-300"
                              />
                              {pollOptions.length > 2 && (
                                <button onClick={() => removePollOption(i)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          {pollOptions.length < 4 && (
                            <button onClick={addPollOption} className="text-sm font-bold text-[#2563eb] flex items-center gap-1 hover:underline pl-1 py-1">
                              <Plus className="w-4 h-4" /> Add option
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-1">
                       <p className="hidden sm:block text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">
                        PRESS <kbd className="bg-[#f1f5f9] px-1.5 py-0.5 rounded border border-[#e2e8f0] font-bold mx-1 text-[10px] text-[#64748b]">CMD + ENTER</kbd> TO POST
                      </p>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {error && <p className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
                        <Button
                          onClick={handleSubmit}
                          disabled={!content.trim() || isSubmitting}
                          className="bg-[#8A9DF8] hover:bg-[#7a8cef] text-white rounded-[14px] px-6 h-[44px] font-bold shadow-none active:scale-95 disabled:opacity-50 disabled:bg-slate-200 w-full sm:w-auto text-[14px] group"
                        >
                          {isSubmitting ? "Sending..." : "Share Post"}
                          {!isSubmitting && <Send className="w-4 h-4 ml-2 opacity-90 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
