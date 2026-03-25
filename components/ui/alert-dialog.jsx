"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white shadow-2xl border border-gray-200 p-6 w-full max-w-md mx-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, children, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

const AlertDialogFooter = ({ className, children, ...props }) => (
  <div className={cn("flex justify-end gap-3 mt-6", className)} {...props}>
    {children}
  </div>
);

const AlertDialogTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-bold text-gray-900", className)} {...props}>
    {children}
  </h2>
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-500 mt-1.5", className)} {...props}>
    {children}
  </p>
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold transition-all active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 focus:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
