"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import VfRoundMark from "@/components/brand/VfRoundMark";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(searchParams.get("callbackUrl") || "/feed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side — Branding */}
      <div className="hidden lg:flex flex-1 bg-[#020617] flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[#514de2]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-20 group">
            <div className="h-12 w-12 rounded-[1.4rem] overflow-hidden shadow-2xl shadow-[#514de2]/40 ring-4 ring-white/5 transition-transform duration-500 group-hover:rotate-6">
              <VfRoundMark className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight leading-none">
                vF Community
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-px w-4 bg-[#514de2]" />
                <p className="text-[#514de2] text-[10px] font-black uppercase tracking-[0.2em] opacity-90">
                  The Inner Circle
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Scale your brand<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#514de2] via-blue-400 to-indigo-400">
                with the best.
              </span>
            </h2>
            <p className="text-slate-400 mt-8 text-xl leading-relaxed max-w-md font-medium">
              India&apos;s most elite ecommerce network. Connect, source, and grow with 10k+ founders.
            </p>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 max-w-sm rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/10">
            <CardContent className="p-7">
              <div className="flex gap-1 mb-4 text-[#514de2]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                &quot;Crossed ₹10L GMV in my second month using community tips. The sourcing connections are a game changer!&quot;
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#514de2] to-indigo-400 flex items-center justify-center text-white text-sm font-black shadow-lg">
                  AM
                </div>
                <div>
                  <p className="text-white text-sm font-black">Arjun Mehta</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                    Health Brands, Delhi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-12">
            <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-xl shadow-[#514de2]/30 ring-4 ring-[#514de2]/10 transition-transform hover:scale-105 active:scale-95 duration-300">
              <VfRoundMark className="h-14 w-14" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black block tracking-tight">vF Community</h1>
              <span className="text-[10px] font-black text-[#514de2] uppercase tracking-[0.2em] mt-1 block">
                The Inner Circle
              </span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 font-medium mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@founder.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl h-14 px-5 border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Secure Password
                </label>
              </div>
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl h-14 px-5 pr-12 border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#514de2]/10 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#514de2] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#514de2] hover:bg-[#433fd7] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-[#514de2]/20 hover:shadow-[#514de2]/30 active:scale-[0.98] transition-all duration-300 mt-4"
            >
              {loading ? "Verifying..." : "Sign In ✨"}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-[13px] text-slate-500 font-bold">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#514de2] font-black hover:text-[#433fd7] transition-colors ml-1"
              >
                Join the Community 🚀
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}
