"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Server,
  Clock,
} from "lucide-react";

interface SmtpServerInfo {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromName: string;
  fromEmail: string;
  editorNotificationEmail: string;
}

interface ConnectivityInfo {
  ok: boolean;
  simulated: boolean;
  message: string;
}

interface NotificationLogItem {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  status: "SENT" | "FAILED" | "SIMULATED";
  error: string | null;
  createdAt: string;
}

export function EmailDiagnosticsView() {
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState<SmtpServerInfo | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityInfo | null>(
    null,
  );
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Test form state
  const [testRecipient, setTestRecipient] = useState(
    "ceylonnest.org@gmail.com",
  );
  const [testNotes, setTestNotes] = useState(
    "Automated system diagnostic test",
  );
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    simulated?: boolean;
    error?: string;
  } | null>(null);

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/email/test");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve diagnostics.");
      }
      setServerInfo(data.data.server);
      setConnectivity(data.data.connectivity);
      setLogs(data.data.recentLogs || []);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Error connecting to API",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const res = await fetch("/api/admin/email/test");
        const data = await res.json();
        if (ignore) return;
        if (!res.ok) {
          throw new Error(data.error || "Failed to retrieve diagnostics.");
        }
        setServerInfo(data.data.server);
        setConnectivity(data.data.connectivity);
        setLogs(data.data.recentLogs || []);
      } catch (err) {
        if (ignore) return;
        setFetchError(
          err instanceof Error ? err.message : "Error connecting to API",
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: testRecipient.trim(),
          notes: testNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch test email.");
      }

      setTestResult({
        success: true,
        message: data.message,
        simulated: data.simulated,
      });

      // Refresh log entries
      await fetchDiagnostics();
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err instanceof Error ? err.message : "Failed to dispatch test.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#00873D] text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E500]" />
            Nodemailer &bull; Gmail SMTP
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Email System &amp; Notifications
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitor outbound SMTP health, verify Gmail App Password credentials,
            and inspect transaction dispatch history.
          </p>
        </div>

        <button
          onClick={fetchDiagnostics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00A84D]" : ""}`}
          />
          <span>Refresh Status</span>
        </button>
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Connectivity & Server Parameter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Connection State & Config */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>SMTP Server Configuration</span>
              </h2>

              {connectivity ? (
                connectivity.simulated ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Development Simulation
                  </span>
                ) : connectivity.ok ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Gmail SMTP Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    Connection Error
                  </span>
                )
              ) : null}
            </div>

            {connectivity && (
              <div
                className={`p-3.5 rounded-xl text-xs mb-5 border ${
                  connectivity.simulated
                    ? "bg-amber-50/60 border-amber-200 text-amber-900"
                    : connectivity.ok
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-red-50/60 border-red-200 text-red-900"
                }`}
              >
                {connectivity.message}
              </div>
            )}

            {serverInfo && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <dt className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Host &amp; Port
                  </dt>
                  <dd className="font-semibold text-gray-800 font-mono">
                    {serverInfo.host}:{serverInfo.port} (
                    {serverInfo.secure ? "SSL/TLS" : "STARTTLS"})
                  </dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <dt className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Authenticated User
                  </dt>
                  <dd
                    className="font-semibold text-gray-800 font-mono truncate"
                    title={serverInfo.user}
                  >
                    {serverInfo.user}
                  </dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <dt className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Sender Identity
                  </dt>
                  <dd
                    className="font-semibold text-gray-800 truncate"
                    title={`${serverInfo.fromName} <${serverInfo.fromEmail}>`}
                  >
                    {serverInfo.fromName} &lt;{serverInfo.fromEmail}&gt;
                  </dd>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <dt className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Editorial Alert Inbox
                  </dt>
                  <dd
                    className="font-semibold text-gray-800 font-mono truncate"
                    title={serverInfo.editorNotificationEmail}
                  >
                    {serverInfo.editorNotificationEmail}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* Right: Diagnostic Send Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-[#171717] mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Send Diagnostic Test Email</span>
            </h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Verify your template rendering and transport pipeline by sending
              an authorized test dispatch.
            </p>

            {testResult && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs border flex items-start gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.simulated && (
                    <div className="text-[11px] text-amber-700 mt-1">
                      (Simulated mode: check console logs for the full dispatch
                      payload).
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label
                  htmlFor="test-to"
                  className="block text-xs font-bold text-gray-700 mb-1"
                >
                  Recipient Address *
                </label>
                <input
                  id="test-to"
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="editor@bbst.uwu.ac.lk"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800] bg-gray-50/50"
                />
              </div>

              <div>
                <label
                  htmlFor="test-notes"
                  className="block text-xs font-bold text-gray-700 mb-1"
                >
                  Diagnostic Note (Optional)
                </label>
                <input
                  id="test-notes"
                  type="text"
                  maxLength={150}
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="e.g. Production readiness test"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800] bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest || !testRecipient}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#171717] hover:bg-black text-white border-b-2 border-[#00E500] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 text-[#00E500]" />
                <span>
                  {sendingTest ? "Transmitting Test..." : "Dispatch Test Email"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Outbound Notification Log Audit Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Outbound Notification Audit Log</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Persistent records of recent transactional email dispatches and
              delivery statuses.
            </p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {logs.length} dispatches logged
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
            No outbound notification activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Recipient</th>
                  <th className="py-2.5 px-3 font-semibold">Subject</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      SENT
                    </span>
                  );
                  if (log.status === "SIMULATED") {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        SIMULATED
                      </span>
                    );
                  } else if (log.status === "FAILED") {
                    badge = (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700"
                        title={log.error || undefined}
                      >
                        FAILED
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-3 px-3 text-gray-500 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-gray-700">
                        {log.type}
                      </td>
                      <td
                        className="py-3 px-3 text-gray-900 font-medium truncate max-w-45"
                        title={log.recipient}
                      >
                        {log.recipient}
                      </td>
                      <td
                        className="py-3 px-3 text-gray-600 truncate max-w-65"
                        title={log.subject}
                      >
                        {log.subject}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{badge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
