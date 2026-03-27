"use client";

import { motion } from "framer-motion";
import { Play, Calendar, Users, Star, ArrowRight, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const featuredWebinar = {
  title: "Scaling to $100k/Month: The COD Blueprint",
  speaker: "Vipul Garg",
  role: "Founder, vFulfill",
  videoUrl:
    "https://d24fzeiqvvundc.cloudfront.net/media_uploads/04f7bda332c76acff66fbee3bab6c67e.mp4",
  duration: "45:12",
  views: "1.2k",
  rating: "4.9",
};

const itemVariants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
};

const pastWebinars = [
  {
    title: "New Product Development",
    speaker: "Nimisha",
    thumbnail:
      "https://d24fzeiqvvundc.cloudfront.net/media_uploads/8b3c92a18490d218134a0003e81be003.jpeg",
  },
  {
    title: "Sourcing Mastery: Beyond the Basics",
    speaker: "Rachna",
    thumbnail:
      "https://d24fzeiqvvundc.cloudfront.net/media_uploads/dce0c4f25e88e56859a33a331da75c18.jpeg",
  },
  {
    title: "Inventory Management for Scale",
    speaker: "Vikram Singh",
    thumbnail:
      "https://d24fzeiqvvundc.cloudfront.net/media_uploads/312e1665903515fd1aa3187e5b5279da.jpeg",
  },
  {
    title: "The Art of Private Labeling",
    speaker: "Manya",
    thumbnail:
      "https://d24fzeiqvvundc.cloudfront.net/media_uploads/ca1630f69a6d7e373a88f5e4ae256d21.png",
  },
  {
    title: "COD Optimization Strategies",
    speaker: "Amit",
    thumbnail:
      "https://d24fzeiqvvundc.cloudfront.net/media_uploads/7cfdc6c9de34288c70514825326391e0.png",
  },
];

export default function WebinarsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Video className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">
            Elite Learning
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Webinars Hub
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Learn scaling secrets and market-proven strategies directly from the
          top 1% of eCommerce founders in the vF Community.
        </p>
      </div>

      {/* Featured Masterclass */}
      <motion.div
        variants={itemVariants}
        className="group relative rounded-[2rem] overflow-hidden glass-card border-white/20 dark:border-white/10 shadow-2xl"
      >
        <div className="aspect-video relative overflow-hidden bg-black/5">
          <video
            src={featuredWebinar.videoUrl}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            muted
            autoPlay
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:bg-primary/90 transition-all"
            >
              <Play className="h-8 w-8 fill-current ml-1" />
            </motion.button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                  New Drop
                </span>
                <span className="flex items-center gap-1 text-white/80 text-xs font-medium">
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  {featuredWebinar.duration}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                {featuredWebinar.title}
              </h2>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <span className="font-bold text-white">
                  {featuredWebinar.speaker}
                </span>
                <span>•</span>
                <span>{featuredWebinar.role}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Past Sessions Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            Past Masterclasses
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-black">
              {pastWebinars.length}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastWebinars.map((webinar, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3 shadow-lg ring-1 ring-black/5 dark:ring-white/5 transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                <img
                  src={webinar.thumbnail}
                  alt={webinar.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>
              </div>
              <h4 className="font-black text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1 leading-tight">
                {webinar.title}
              </h4>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {webinar.speaker}
              </p>
            </motion.div>
          ))}

          {/* Coming Soon Card */}
          <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-6 text-center space-y-2 opacity-60">
            <Calendar className="h-8 w-8 text-muted-foreground/40" />
            <span className="text-xs font-black uppercase tracking-wider">
              Next Session
            </span>
            <p className="text-[10px] font-medium text-muted-foreground">
              Stay tuned for more elite insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
