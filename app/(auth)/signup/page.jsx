"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui/UserAvatar";
import VfRoundMark from "@/components/brand/VfRoundMark";

const niches = [
  "Fashion",
  "Electronics",
  "Health & Wellness",
  "Home & Kitchen",
  "Beauty",
  "Other",
];
const gmvRanges = ["Just starting", "₹1L–10L", "₹10L–50L", "₹50L+"];

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const callbackUrl = searchParams.get("callbackUrl");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("idle");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
    bio: "",
    city: "",
    niche: "Fashion",
    gmvRange: "Just starting",
  });

  useEffect(() => {
    if (!inviteCode) return;

    const validateInvite = async () => {
      setInviteStatus("loading");
      try {
        const res = await fetch(`/api/invites/${inviteCode}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setInviteStatus("invalid");
          setError(data.error || "This invite is no longer valid.");
          return;
        }

        setForm((prev) => ({
          ...prev,
          email: data.email || prev.email,
          gmvRange:
            data.tier === "scale"
              ? "₹50L+"
              : data.tier === "growth"
                ? "₹10L–50L"
                : prev.gmvRange,
        }));
        setInviteStatus("valid");
      } catch (err) {
        setInviteStatus("invalid");
        setError("Could not validate invite code.");
      }
    };

    validateInvite();
  }, [inviteCode]);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const endpoint = inviteCode ? `/api/invites/${inviteCode}` : "/api/auth/register";
      // Send the entire form to ensure bio, city, niche, avatar, etc. are passed for invites too
      const payload = form;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl || "/feed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.name || !form.email || !form.password) {
        setError("Please fill all required fields");
        return false;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords don't match");
        return false;
      }
    }
    return true;
  };

  const generatedAvatar = form.name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-10 w-10 rounded-full overflow-hidden shadow-md shadow-[#514de2]/30 shrink-0">
            <VfRoundMark className="h-10 w-10" />
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-gray-900 block">vF Community</span>
            <span className="text-[10px] font-bold text-[#514de2] uppercase tracking-widest">
              The Inner Circle
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step
                    ? "bg-primary text-white"
                    : s === step
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    s < step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {inviteCode && inviteStatus === "valid" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              Invite verified for {form.email}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Create your account
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Full Name *
                </label>
                <Input
                  placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="rounded-xl h-11"
                  disabled={Boolean(inviteCode)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Password *
                </label>
                <Input
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Set up your profile
              </h3>
              <div className="flex justify-center">
                <UserAvatar src={form.avatar || generatedAvatar} name={form.name} size="2xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Profile Photo URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="url"
                    placeholder="https://example.com/your-photo.jpg"
                    value={form.avatar}
                    onChange={(e) => update("avatar", e.target.value)}
                    className="rounded-xl pl-9 h-11"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Bio
                </label>
                <textarea
                  placeholder="D2C founder passionate about..."
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none border-gray-200"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  City
                </label>
                <Input
                  placeholder="Mumbai, Delhi, Bangalore..."
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          )}

          {/* Step 3: Business Info */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Tell us about your business
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Niche
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {niches.map((n) => (
                    <button
                      key={n}
                      onClick={() => update("niche", n)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.niche === n
                          ? "border-primary bg-orange-50 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Monthly GMV Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {gmvRanges.map((g) => (
                    <button
                      key={g}
                      onClick={() => update("gmvRange", g)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.gmvRange === g
                          ? "border-primary bg-orange-50 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => validateStep() && setStep(step + 1)}
                disabled={inviteStatus === "loading" || inviteStatus === "invalid"}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  inviteStatus === "loading" ||
                  inviteStatus === "invalid"
                }
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6"
              >
                {loading ? "Creating..." : "🚀 Join Community"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SignupContent />
    </Suspense>
  );
}
