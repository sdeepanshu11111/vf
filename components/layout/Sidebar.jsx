"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Home,
  Compass,
  Bell,
  MessageCircle,
  Trophy,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronUp,
  Bookmark,
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

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/members", icon: Trophy, label: "Leaderboard" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-4 top-4 bottom-4 w-[260px] glass-card rounded-[2rem] z-40 overflow-hidden">
        {/* Logo */}
        <div className="p-8 pb-6">
          <Link href="/feed" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">
              <span className="font-black text-white text-lg">vF</span>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-gray-900 block leading-none">
                vF Community
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 block">
                The Inner Circle
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all group",
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                {item.label}
              </Link>
            );
          })}

          <div className="h-px bg-gray-100 mx-4 my-6" />

          {user && (
            <Link
              href={`/profile/${user.id}`}
              className={cn(
                "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all group",
                pathname.includes("/profile") && !pathname.includes("/edit")
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              {pathname.includes("/profile") && !pathname.includes("/edit") && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                />
              )}
              <User className="h-5 w-5" />
              My Space
            </Link>
          )}

          {user?.role && ["moderator", "admin"].includes(user.role) && (
            <Link
              href="/moderation"
              className={cn(
                "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all group",
                pathname === "/moderation"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              {pathname === "/moderation" && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                />
              )}
              <Shield className="h-5 w-5" />
              Admin Hub
            </Link>
          )}
        </nav>

        {/* User Profile Footer */}
        {user && (
          <div className="p-4 mt-auto">
            <div className="bg-white/40 p-3 rounded-[1.5rem] border border-white/40">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full p-1.5 rounded-xl hover:bg-white transition-all outline-none group">
                    <UserAvatar src={user.avatar} name={user.name} size="sm" className="ring-2 ring-white" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold truncate text-gray-900">
                        {user.name}
                      </p>
                      <TierBadge tier={user.tier} size="xs" />
                    </div>
                    <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="w-[220px] glass-card rounded-2xl mb-2"
                >
                  <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 font-bold">
                    <Link href="/profile/edit" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    className="rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 py-2.5 font-bold cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass-card rounded-[1.25rem] z-50 flex items-center justify-around px-2 shadow-2xl">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] h-full rounded-xl transition-all",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link
            href={`/profile/${user.id}`}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[60px] h-full rounded-xl transition-all",
              pathname.includes("/profile") ? "text-primary" : "text-gray-400"
            )}
          >
            <UserAvatar src={user.avatar} name={user.name} size="xs" className={cn("ring-1 ring-offset-2", pathname.includes("/profile") ? "ring-primary" : "ring-transparent")} />
            <span className="text-[9px] font-black uppercase tracking-widest">Me</span>
          </Link>
        )}
      </nav>
    </>
  );
}
