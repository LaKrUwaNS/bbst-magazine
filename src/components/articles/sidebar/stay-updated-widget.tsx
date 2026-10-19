"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export function StayUpdatedWidget() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Frontend-only demo feedback state as required by backend protection rules
    setStatus("success");
    setEmail("");
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/40 via-white to-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#00E500]/15 text-[#00C800] flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-base text-[#171717]">Stay Updated</h3>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mb-4">
        Subscribe to get the latest articles, new magazine issues and university news.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-[#00C800] shrink-0" />
          <span>Thank you for subscribing! (Demo mode)</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Enter your email address"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white placeholder-gray-400 text-[#171717] focus:outline-none focus:border-[#00C800] focus:ring-2 focus:ring-[#00C800]/20 transition-all"
            />
          </div>

          {status === "error" && (
            <p className="text-[11px] text-red-500">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00C800] text-[#171717] shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <span>Subscribe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
