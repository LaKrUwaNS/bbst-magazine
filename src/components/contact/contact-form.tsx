"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Mail, Clock } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<
    "EDITORIAL" | "SUBMISSION_QUERY" | "MAGAZINE_PRINT" | "EVENT" | "GENERAL"
  >("EDITORIAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setCategory("EDITORIAL");
    setSubject("");
    setMessage("");
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-10 shadow-sm text-center">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-[#00A84D] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#171717] mb-2 tracking-tight">
          Message Transmitted Successfully
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
          Your dispatch has been routed to the BBST Magazine editorial desk. An automated receipt and confirmation has been dispatched to{" "}
          <strong className="text-gray-900">{email}</strong>.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto mb-8 border border-gray-100 flex items-start gap-3 text-left">
          <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500">
            <strong className="font-semibold text-gray-700 block mb-0.5">Editorial Response SLA</strong>
            Our editorial desk typically reviews inquiries within 24 to 48 business hours. For urgent submission revisions, reference your submission tracking ID.
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] hover:bg-black text-white transition-all shadow-xs cursor-pointer"
        >
          Send Another Dispatch
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
          Dispatch an Inquiry
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Your message is securely delivered to the editorial board inbox via our verified SMTP relay.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="c-name" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              id="c-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Kasun Perera"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/40 focus:border-[#00C800] transition-all bg-gray-50/40 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="c-email" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              id="c-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.ac.lk"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/40 focus:border-[#00C800] transition-all bg-gray-50/40 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="c-category" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Department / Topic *
            </label>
            <select
              id="c-category"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as
                    | "EDITORIAL"
                    | "SUBMISSION_QUERY"
                    | "MAGAZINE_PRINT"
                    | "EVENT"
                    | "GENERAL"
                )
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/40 focus:border-[#00C800] transition-all bg-gray-50/40 focus:bg-white cursor-pointer"
            >
              <option value="EDITORIAL">Editorial &amp; Peer Review</option>
              <option value="SUBMISSION_QUERY">Submission Tracking Query</option>
              <option value="MAGAZINE_PRINT">Magazine &amp; Print Edition</option>
              <option value="EVENT">Event &amp; Workshop Collaboration</option>
              <option value="GENERAL">General Reader Correspondence</option>
            </select>
          </div>

          <div>
            <label htmlFor="c-subject" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Subject Line *
            </label>
            <input
              id="c-subject"
              type="text"
              required
              minLength={3}
              maxLength={150}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of inquiry"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/40 focus:border-[#00C800] transition-all bg-gray-50/40 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="c-message" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
            Detailed Message *
          </label>
          <textarea
            id="c-message"
            rows={5}
            required
            minLength={15}
            maxLength={3000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your correspondence, feedback, or editorial inquiry here..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500]/40 focus:border-[#00C800] transition-all bg-gray-50/40 focus:bg-white resize-y"
          />
          <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
            <span>Minimum 15 characters</span>
            <span>{message.length} / 3000</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted transmission via Gmail SMTP Relay</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-[#171717] hover:bg-black text-white border-b-2 border-[#00E500] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-[#00E500]" />
            <span>{isSubmitting ? "Transmitting..." : "Send Dispatch"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
