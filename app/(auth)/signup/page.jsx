"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui/UserAvatar";

const niches = [
  "Fashion",
  "Electronics",
  "Health & Wellness",
  "Home & Kitchen",
  "Beauty",
  "Other",
];
const gmvRanges = ["Just starting", "₹1L–10L", "₹10L–50L", "₹50L+"];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("idle");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      const payload = inviteCode
        ? { name: form.name, password: form.password }
        : form;

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
        router.push("/feed");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8F65] flex items-center justify-center font-bold text-white">
            vF
          </div>
          <span className="text-xl font-bold text-gray-900">vF Community</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step
                    ? "bg-[#FF6B35] text-white"
                    : s === step
                      ? "bg-[#FF6B35] text-white ring-4 ring-[#FF6B35]/20"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    s < step ? "bg-[#FF6B35]" : "bg-gray-200"
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
                <UserAvatar name={form.name} size="2xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Bio
                </label>
                <textarea
                  placeholder="D2C founder passionate about..."
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 resize-none"
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
                          ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35]"
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
                          ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35]"
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
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white rounded-xl px-6"
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
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white rounded-xl px-6"
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
            className="text-[#FF6B35] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
