"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Globe, 
  Search, 
  Ship, 
  Package, 
  Home as HomeIcon, 
  CheckCircle2, 
  ArrowRight,
  X,
  ChevronRight,
  Coins,
  Users,
  Zap,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import VfRoundMark from "@/components/brand/VfRoundMark";

const TOUR_STORAGE_KEY = "vf_community_tour_completed";

const features = [
  { icon: Sparkles, label: "Exclusive Product Drops", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: TrendingUp, label: "Expert Scaling Insights", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Users, label: "Elite Founder Network", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: CheckCircle2, label: "Verified Winning Strategies", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Globe, label: "Real-time Market Trends", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Zap, label: "Collaborative Growth", color: "text-emerald-600", bg: "bg-emerald-500/10" },
];

const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to vF Community",
    description: "Launch & Grow your COD eCommerce Business in India, the smart way.",
    target: null, // Full screen modal
  },
  {
    id: "tour-home",
    title: "Home Feed",
    description: "Stay updated with the latest trends and community discussions in real-time.",
    target: "#tour-home",
  },
  {
    id: "tour-products",
    title: "Winning Products",
    description: "Access our exclusive hand-picked product drops, researched for maximum conversion.",
    target: "#tour-products",
  },
  {
    id: "tour-insights",
    title: "Product Insights",
    description: "Deep-dive into performance data and insights to scale your business.",
    target: "#tour-insights",
  },
  {
    id: "tour-webinars",
    title: "Webinars Hub",
    description: "Access elite masterclasses and expert-led workshops to master eCommerce scaling.",
    target: "#tour-webinars",
  },
  {
    id: "tour-leaderboard",
    title: "Leaderboard",
    description: "Connect with top founders and track your growth within the community.",
    target: "#tour-leaderboard",
  },
  {
    id: "tour-right-panel",
    title: "Product Drops & Trends",
    description: "Never miss a winning product with our real-time research drops and data-driven insights.",
    target: "#tour-right-panel",
  }
];

export default function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(-1); // -1: not started, 0: welcome modal, 1+: interactive
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasCompleted) {
      setTimeout(() => {
        setCurrentStep(0);
        setIsVisible(true);
      }, 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  };

  if (!isClient || !isVisible || currentStep === -1) return null;

  const stepData = tourSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={handleComplete}
          />

          {currentStep === 0 ? (
            /* Welcome Modal (Step 0) */
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-white/20 dark:border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />
              
              <div className="p-8 sm:p-12 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/10 ring-1 ring-primary/20">
                  <VfRoundMark className="h-10 w-10 text-primary" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
                  <Sparkles className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    The Elite Inner Circle for Ecom Founders
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-6 leading-[1.1] tracking-tight">
                  Connect, Learn & Scale with India's <span className="text-primary italic">Top 1% Founders.</span>
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
                  Join a high-performance network of entrepreneurs sharing winning strategies, exclusive product drops, and real-time market insights.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mb-10">
                  {features.map((feature, i) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.05) }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-white dark:border-white/10 shadow-sm"
                    >
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", feature.bg)}>
                        <feature.icon className={cn("h-4 w-4", feature.color)} />
                      </div>
                      <span className="text-[11px] font-bold text-foreground text-left leading-tight">
                        {feature.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-3 group"
                >
                  Start Your Tour
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Interactive Tooltip Steps (Step 1+) */
            <motion.div
              layoutId="tour-tooltip"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl border-white/30 dark:border-white/10 z-[110]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs">
                    {currentStep}
                  </div>
                  <h3 className="font-black text-foreground tracking-tight">{stepData.title}</h3>
                </div>
                <button onClick={handleComplete} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6 font-medium leading-relaxed">
                {stepData.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {tourSteps.slice(1).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i + 1 === currentStep ? "w-6 bg-primary" : "w-2 bg-slate-200 dark:bg-slate-800"
                      )} 
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Arrow Indicator for context */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-6 bg-primary hidden lg:flex" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
            </motion.div>
          )}

          {/* Special UI element to highlight target (simple approach) */}
          {currentStep > 0 && stepData.target && (
            <TourHighlight target={stepData.target} />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

function TourHighlight({ target }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [target]);

  if (!coords) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed z-[105] pointer-events-none ring-[200vw] ring-black/40"
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        height: coords.height,
        borderRadius: '1rem',
        boxShadow: '0 0 0 4px #514de2, 0 0 20px #514de280'
      }}
    />
  );
}
