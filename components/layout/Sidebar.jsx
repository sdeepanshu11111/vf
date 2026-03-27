"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { toast } from "sonner";
import {
  Home,
  Compass,
  Bell,
  Trophy,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronUp,
  Bookmark,
  Clapperboard,
  ShoppingBag,
  Video,
  Coins,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import VfRoundMark from "@/components/brand/VfRoundMark";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/products", icon: ShoppingBag, label: "Products" },
  { href: "/reels", icon: Clapperboard, label: "Insights" },
  { href: "/webinars", icon: Video, label: "Webinars" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/notifications", icon: Bell, label: "Notifications", badge: true },
  { href: "/members", icon: Trophy, label: "Leaderboard" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();

    // Polling fallback
    const interval = setInterval(fetchUnread, 60000);

    // Pusher real-time updates
    const channelName = `user-${session.user.id}`;
    if (pusherClient) {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("new-notification", (data) => {
        // Exclude self-notifications if somehow triggered
        if (data.actorId === session.user.id) return;

        setUnreadCount((prev) => prev + 1);

        let message = "You have a new notification";
        if (data.type === "follow") message = "Someone started following you!";
        if (data.type === "upvote") message = "Someone upvoted your post!";
        if (data.type === "comment")
          message = "Someone commented on your post!";
        if (data.type === "reply") message = "Someone replied to your comment!";

        toast(message, {
          icon: <Bell className="h-4 w-4 text-primary" />,
        });
      });
    }

    return () => {
      clearInterval(interval);
      if (pusherClient) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (pathname.startsWith("/notifications")) {
      setUnreadCount(0);
    }
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-4 top-4 bottom-4 w-[260px] glass-card rounded-3xl z-40 overflow-hidden shadow-2xl shadow-primary/5 border-white/20 dark:border-white/5">
        {/* Logo */}
        <div className="p-8 pb-6">
          <Link href="/feed" className="flex items-center gap-3.5 group">
            <div className="h-10 w-10 shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300 rounded-[30px] overflow-hidden">
              <VfRoundMark className="h-10 w-10" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-foreground block leading-none">
                vF Community
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5 block opacity-90">
                The Inner Circle
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const showBadge = item.badge && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`tour-${item.label.toLowerCase()}`}
                className={cn(
                  "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all group",
                  isActive
                    ? "text-primary font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl -z-10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative shrink-0">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "stroke-[2.5px]" : "stroke-2",
                    )}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-md shadow-red-500/40 ring-2 ring-background animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}

          <div className="h-px bg-border/50 mx-4 my-6" />

          {user && (
            <Link
              href={`/profile/${user.id}`}
              id="tour-profile"
              className={cn(
                "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all group",
                pathname.includes("/profile") && !pathname.includes("/edit")
                  ? "text-primary font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              {pathname.includes("/profile") && !pathname.includes("/edit") && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl -z-10 border border-primary/20"
                />
              )}
              <User
                className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  pathname.includes("/profile") && !pathname.includes("/edit")
                    ? "stroke-[2.5px]"
                    : "stroke-2",
                )}
              />
              My Space
            </Link>
          )}

          {user?.role && ["moderator", "admin"].includes(user.role) && (
            <Link
              href="/moderation"
              id="tour-admin"
              className={cn(
                "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all group",
                pathname === "/moderation"
                  ? "text-primary font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              {pathname === "/moderation" && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl -z-10 border border-primary/20"
                />
              )}
              <Shield
                className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  pathname === "/moderation" ? "stroke-[2.5px]" : "stroke-2",
                )}
              />
              Admin Hub
            </Link>
          )}
        </nav>

        {/* User Profile Footer or Login/Signup */}
        {user ? (
          <div className="p-4 mt-auto">
            <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-2xl shadow-slate-300/60 dark:shadow-none translate-y-0 hover:-translate-y-1 group/footer">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-3 w-full p-2 rounded-[2rem] transition-all outline-none outline-none">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={user.avatar}
                          name={user.name}
                          size="sm"
                          className="h-11 w-11 ring-4 ring-white dark:ring-slate-800 shadow-lg rounded-full object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <TierBadge tier={user.tier} size="xs" />
                          <div
                            id="tour-hustle-points"
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-tighter"
                          >
                            <Coins className="h-2.5 w-2.5" />
                            <span>{user.points || 0} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400 group-hover/footer:text-primary group-hover/footer:-translate-y-0.5 transition-all mr-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="w-[230px] glass-card rounded-[2rem] mb-3 p-2 border-white/40 dark:border-white/10 shadow-2xl backdrop-blur-2xl"
                >
                  <DropdownMenuItem
                    asChild
                    className="rounded-2xl focus:bg-primary/10 focus:text-primary py-3 px-4 font-black text-xs uppercase tracking-widest cursor-pointer transition-all"
                  >
                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-3"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10 my-1 mx-2" />
                  <DropdownMenuItem
                    className="rounded-2xl text-red-500 focus:bg-red-50/10 focus:text-red-600 py-3 px-4 font-black text-xs uppercase tracking-widest cursor-pointer transition-all"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <div className="p-6 mt-auto space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center w-full py-3 px-4 rounded-2xl text-sm font-bold text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center w-full py-3 px-4 rounded-2xl text-sm font-black text-white bg-primary hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              Join Community
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-6 inset-x-0 z-50 px-4 flex items-center justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <nav className="glass-card w-full max-w-md bg-background/80 dark:bg-[#020617]/80 backdrop-blur-3xl px-4 py-3.5 rounded-full flex items-center justify-between border-white/20 dark:border-white/10 shadow-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/5">
          {navItems
            .filter((i) =>
              [
                "Home",
                "Products",
                "Webinars",
                "Insights",
                "Notifications",
              ].includes(i.label),
            )
            .map((item) => {
              const isActive = pathname.startsWith(item.href);
              const showBadge = item.badge && unreadCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex items-center justify-center transition-all duration-300"
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-primary/20 rounded-full blur-md transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="relative">
                    <item.icon
                      className={cn(
                        "h-6 w-6 relative z-10 transition-all duration-300",
                        isActive
                          ? "stroke-[2.5px] text-primary"
                          : "stroke-2 text-muted-foreground",
                      )}
                    />
                    {showBadge && (
                      <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-md animate-pulse z-20 ring-2 ring-background">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          {user ? (
            <Link
              href={`/profile/${user.id}`}
              className={cn(
                "group relative flex flex-col items-center justify-center transition-all duration-300",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-primary/20 rounded-full blur-md transition-opacity duration-300",
                  pathname.includes("/profile") ? "opacity-100" : "opacity-0",
                )}
              />
              <UserAvatar
                src={user.avatar}
                name={user.name}
                size="xs"
                className={cn(
                  "relative z-10 w-7 h-7 ring-2 transition-all duration-300 shadow-sm",
                  pathname.includes("/profile")
                    ? "ring-primary"
                    : "ring-transparent grayscale-[30%]",
                )}
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="group relative flex flex-col items-center justify-center transition-all duration-300"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
