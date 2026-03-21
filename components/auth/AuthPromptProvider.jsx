"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AuthPromptContext = createContext(null);

export function useAuthPrompt() {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) {
    throw new Error("useAuthPrompt must be used within <AuthPromptProvider />");
  }
  return ctx;
}

export default function AuthPromptProvider({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState({
    actionText: "",
    callbackUrl: "",
  });

  const requestAuth = ({ actionText = "", callbackUrl } = {}) => {
    const defaultCallbackUrl =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/feed";

    setIntent({
      actionText,
      callbackUrl: callbackUrl || defaultCallbackUrl,
    });
    setOpen(true);
  };

  const encodedCallbackUrl = useMemo(() => {
    const url = intent.callbackUrl || "/feed";
    return encodeURIComponent(url);
  }, [intent.callbackUrl]);

  const goLogin = () => {
    setOpen(false);
    router.push(`/login?callbackUrl=${encodedCallbackUrl}`);
  };

  const goSignup = () => {
    setOpen(false);
    router.push(`/signup?callbackUrl=${encodedCallbackUrl}`);
  };

  return (
    <AuthPromptContext.Provider value={{ requestAuth }}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Join vF Community</DialogTitle>
            <DialogDescription>
              {intent.actionText
                ? `To ${intent.actionText}, create an account or sign in.`
                : "Sign in to like, save, and comment with your profile."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button
              onClick={() => {
                goSignup();
              }}
              className="w-full sm:w-auto"
            >
              Create account
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                goLogin();
              }}
              className="w-full sm:w-auto"
            >
              Log in
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Continue as guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthPromptContext.Provider>
  );
}

