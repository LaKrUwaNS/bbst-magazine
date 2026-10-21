"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function AdminLoginCard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push(data.redirect || "/admin");
      router.refresh();
    } catch (err) {
      console.error("[Login] Network or client error:", err);
      setErrorMessage("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-linear-to-b from-gray-50/80 via-white to-gray-50/50">
      {/* Ambient Radial Glowing Elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/4 w-80 h-80 rounded-full bg-[#00FF00]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 right-1/4 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl"
      />

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Card Box */}
        <div className="rounded-3xl border border-gray-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-gray-200/40 space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus:outline-none"
              aria-label="BBST Magazine Home"
            >
              {/* Green Book Icon */}
              <div className="w-10 h-9 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 28" fill="none" className="w-full h-full drop-shadow-xs">
                  <path
                    d="M18 5C13 1.5 4 1.5 2 3.5V23.5C4 21.5 13 21.5 18 25V5Z"
                    fill="#00E500"
                  />
                  <path
                    d="M18 5C23 1.5 32 1.5 34 3.5V23.5C32 21.5 23 21.5 18 25V5Z"
                    fill="#00C800"
                  />
                  <line
                    x1="18"
                    y1="5"
                    x2="18"
                    y2="25"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-[#171717] leading-none">
                  BBST
                </span>
                <span className="block text-[9px] font-bold tracking-[0.2em] uppercase text-emerald-800 leading-tight mt-0.5">
                  Student Magazine
                </span>
              </div>
            </Link>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Editorial Administration
              </div>
              <h1 className="text-2xl font-black text-[#171717] tracking-tight mt-2">
                Editor Sign In
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto mt-1">
                Authorized access to publish, manage, and archive BBST Magazine editions.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold text-gray-700 tracking-tight"
              >
                Editor Username / Email
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. editor@bbst.uwu.ac.lk"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gray-700 tracking-tight"
                >
                  Editor Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs font-semibold text-[#00873D] hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your editor password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md shadow-[#00E500]/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link
              href="/"
              className="hover:text-black transition-colors flex items-center gap-1 font-medium"
            >
              <span>← Return to Public Site</span>
            </Link>
            <span className="text-[11px] text-gray-400">UWU BBST Portal</span>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-gray-500 mt-6 max-w-sm mx-auto leading-relaxed">
          This is a protected administrative portal. All login sessions are securely
          monitored and rate-limited.
        </p>
      </div>
    </div>
  );
}
