"use client";
/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";

export default function UserAvatar({
  src,
  name,
  size = "md",
  online = false,
  className,
}) {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20",
    full: "h-full w-full",
  };

  const dotSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-3.5 w-3.5",
    "2xl": "h-4 w-4",
  };

  const avatarUrl =
    src ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "User")}`;

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)}>
      <img
        loading="lazy"
        src={avatarUrl}
        alt={name || "User"}
        className={cn(
          "object-cover bg-gray-100",
          className?.includes("rounded-") ? "" : "rounded-full",
          sizeClasses[size] || sizeClasses.md,
        )}
      />
      {online && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-white",
            dotSizes[size] || dotSizes.md,
          )}
        />
      )}
    </div>
  );
}
