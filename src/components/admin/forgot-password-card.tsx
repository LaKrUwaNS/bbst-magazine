"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Failed to process password recovery request.",
        );
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 shadow-xl shadow-black/3">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-6 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#171717] flex items-center justify-center text-white font-black text-sm">
                B
              </div>
              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-[#171717] leading-none">
                  BBST
                </span>
                <span className="block text-[9px] font-bold tracking-[0.2em] uppercase text-emerald-800 leading-tight mt-0.5">
                  Editorial Desk
                </span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Password Recovery
            </div>
            <h1 className="text-2xl font-black text-[#171717] tracking-tight mt-3">
              Reset Your Password
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto mt-1">
              Enter your verified editorial email address to receive secure
              reset instructions.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-[#00A84D] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-gray-900">
                  Recovery Link Dispatched
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-500">
                <strong>Important:</strong> The single-use link expires in 30
                minutes. If you do not see the message, verify your spam folder
                or check with system administration.
              </div>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-gray-700 tracking-tight"
                >
                  Editor Account Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@bbst.uwu.ac.lk"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md shadow-[#00E500]/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
