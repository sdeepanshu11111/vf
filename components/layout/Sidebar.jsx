"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/members", icon: Trophy, label: "Members" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] bg-[#111111] text-white z-40">
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8F65] flex items-center justify-center font-bold text-sm">
              vF
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">
                vF Community
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5">
                Built for Hustlers
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-[#FF6B35]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={`/profile/${user.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname.includes("/profile")
                  ? "bg-white/10 text-[#FF6B35]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <User className="h-5 w-5" />
              My Profile
            </Link>
          )}

          {user?.role && ["moderator", "admin"].includes(user.role) && (
            <Link
              href="/moderation"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname === "/moderation"
                  ? "bg-white/10 text-[#FF6B35]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Shield className="h-5 w-5" />
              Moderation
            </Link>
          )}
        </nav>

        {/* User info bottom */}
        {user && (
          <div className="p-4 border-t border-white/10 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left outline-none group">
                  <UserAvatar src={user.avatar} name={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-[#FF6B35] transition-colors">
                      {user.name}
                    </p>
                    <TierBadge tier={user.tier} size="sm" />
                  </div>
                  <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[200px] bg-[#1a1a1a] border-white/10 text-white"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 cursor-pointer focus:bg-white/10 focus:text-[#FF6B35]"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-1 flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-[#FF6B35]" : "text-gray-400",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        {user && (
          <Link
            href={`/profile/${user.id}`}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
              pathname.includes("/profile")
                ? "text-[#FF6B35]"
                : "text-gray-400",
            )}
          >
            <User className="h-5 w-5" />
            Profile
          </Link>
        )}
      </nav>
    </>
  );
}
