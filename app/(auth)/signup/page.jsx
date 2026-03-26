"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check, Link as LinkIcon, Plus } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#514de2]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-xl shadow-[#514de2]/30 ring-4 ring-[#514de2]/10 transition-all hover:scale-105 duration-300">
            <VfRoundMark className="h-14 w-14" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black block tracking-tight">vF Community</h1>
            <span className="text-[10px] font-black text-[#514de2] uppercase tracking-[0.2em] mt-1 block">
              The Inner Circle
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3 mb-10 justify-center px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-3 last:flex-none">
              <div
                className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                  s < step
                    ? "bg-[#514de2] text-white shadow-lg shadow-[#514de2]/20"
                    : s === step
                      ? "bg-[#514de2] text-white shadow-xl shadow-[#514de2]/30 ring-4 ring-[#514de2]/10"
                      : "bg-white text-slate-400 border border-slate-200"
                }`}
              >
                {s < step ? <Check className="h-5 w-5 stroke-[3px]" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-all duration-700 ${
                    s < step ? "bg-[#514de2]" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 border border-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-shake">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          {inviteCode && inviteStatus === "valid" && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold rounded-2xl flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Invite verified for {form.email}
            </div>
          )}

          {/* Form Content */}
          <div className="min-h-[380px] flex flex-col">
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Founders start here. 🌱</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <Input
                    placeholder="Arjun Mehta"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="rounded-2xl h-14 px-5 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@founder.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="rounded-2xl h-14 px-5 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                    disabled={Boolean(inviteCode)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="rounded-2xl h-14 px-5 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                    <Input
                      type="password"
                      placeholder="••••••"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      className="rounded-2xl h-14 px-5 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Profile */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Profile</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Make a great first impression. ✨</p>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <UserAvatar src={form.avatar || generatedAvatar} name={form.name} size="2xl" className="ring-8 ring-[#514de2]/5 shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#514de2] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#514de2]/30 border-4 border-white">
                      <Plus className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Photo URL (Optional)</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={form.avatar}
                    onChange={(e) => update("avatar", e.target.value)}
                    className="rounded-2xl h-14 px-5 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Bio</label>
                  <textarea
                    placeholder="What are you building?"
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#514de2]/10 transition-all bg-slate-50/30 focus:bg-white resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Business Info */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Business Intel</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Help us tailor your experience. 📈</p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Your Niche</label>
                  <div className="grid grid-cols-2 gap-3">
                    {niches.map((n) => (
                      <button
                        key={n}
                        onClick={() => update("niche", n)}
                        className={`px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all border ${
                          form.niche === n
                            ? "border-[#514de2] bg-[#514de2]/5 text-[#514de2] shadow-sm shadow-[#514de2]/10"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50/30"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Monthly GMV</label>
                  <div className="grid grid-cols-2 gap-3">
                    {gmvRanges.map((g) => (
                      <button
                        key={g}
                        onClick={() => update("gmvRange", g)}
                        className={`px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all border ${
                          form.gmvRange === g
                            ? "border-[#514de2] bg-[#514de2]/5 text-[#514de2] shadow-sm shadow-[#514de2]/10"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50/30"
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
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="rounded-2xl h-12 px-6 text-slate-500 font-bold hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  onClick={() => validateStep() && setStep(step + 1)}
                  disabled={inviteStatus === "loading" || inviteStatus === "invalid"}
                  className="bg-[#514de2] hover:bg-[#433fd7] text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-[#514de2]/20 transition-all active:scale-95"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    inviteStatus === "loading" ||
                    inviteStatus === "invalid"
                  }
                  className="bg-[#514de2] hover:bg-[#433fd7] text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-[#514de2]/20 transition-all active:scale-95"
                >
                  {loading ? "Joining..." : "🚀 Join Now"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[13px] text-slate-500 font-bold mt-8">
          Founding member already?{" "}
          <Link
            href="/login"
            className="text-[#514de2] font-black hover:text-[#433fd7] transition-colors ml-1"
          >
            Sign in here 🚪
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
