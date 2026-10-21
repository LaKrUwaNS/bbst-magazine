"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  PenSquare,
  BookOpen,
  Layers,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Mail,
  Calendar,
} from "lucide-react";

interface AdminSidebarProps {
  username?: string;
}

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Submissions Queue",
    href: "/admin/submissions",
    icon: Inbox,
    exact: false,
  },
  {
    label: "All Articles",
    href: "/admin/articles",
    icon: FileText,
    exact: true,
  },
  {
    label: "Create Article",
    href: "/admin/articles/new",
    icon: PenSquare,
    exact: true,
  },
  {
    label: "Writer Profiles",
    href: "/admin/writers",
    icon: Users,
    exact: false,
  },
  {
    label: "Magazine Editions",
    href: "/admin/magazines",
    icon: BookOpen,
    exact: false,
  },
  {
    label: "Events Management",
    href: "/admin/events",
    icon: Calendar,
    exact: false,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Layers,
    exact: false,
  },
  {
    label: "Email & Notifications",
    href: "/admin/email",
    icon: Mail,
    exact: false,
  },
];

export function AdminSidebar({ username = "editor@bbst.uwu.ac.lk" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("[Logout] Failed to log out:", err);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-6 flex items-center justify-center">
            <svg viewBox="0 0 36 28" fill="none" className="w-full h-full">
              <path
                d="M18 5C13 1.5 4 1.5 2 3.5V23.5C4 21.5 13 21.5 18 25V5Z"
                fill="#00E500"
              />
              <path
                d="M18 5C23 1.5 32 1.5 34 3.5V23.5C32 21.5 23 21.5 18 25V5Z"
                fill="#00C800"
              />
            </svg>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-[#171717] block leading-none">
              BBST Admin
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-800">
              Editor Dashboard
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-200/90 flex flex-col justify-between py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top Branding */}
        <div className="space-y-6">
          <div className="px-6 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-7 flex items-center justify-center">
                <svg viewBox="0 0 36 28" fill="none" className="w-full h-full drop-shadow-xs">
                  <path
                    d="M18 5C13 1.5 4 1.5 2 3.5V23.5C4 21.5 13 21.5 18 25V5Z"
                    fill="#00E500"
                  />
                  <path
                    d="M18 5C23 1.5 32 1.5 34 3.5V23.5C32 21.5 23 21.5 18 25V5Z"
                    fill="#00C800"
                  />
                </svg>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#171717] block leading-none">
                  BBST Editor
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                  Uva Wellassa University
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Editor Status Pill */}
          <div className="px-6">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#00C800]" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Active Editor
                </span>
                <span className="block text-xs font-semibold text-gray-800 truncate">
                  {username}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) &&
                  (item.href !== "/admin" || pathname === "/admin");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#00E500] text-black font-bold shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-gray-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="px-4 space-y-3 pt-6 border-t border-gray-100">
          <Link
            href="/magazines"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span>Public Magazines</span>
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 transition-colors cursor-pointer disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>

          <p className="text-center text-[10px] text-gray-400">
            BBST Magazine v2.0 • UWU
          </p>
        </div>
      </aside>
    </>
  );
}
