"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface NavbarAuthProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function NavbarAuth({ isMobile = false, onNavigate }: NavbarAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsAuthenticated(Boolean(data.authenticated));
          }
        }
      } catch {
        // Guest mode fallback
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isMobile) {
    if (isAuthenticated) {
      return (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-[#00C800]" />
          <span>Editor Dashboard</span>
        </Link>
      );
    }

    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="w-full text-center py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Sign In
      </Link>
    );
  }

  // Desktop Rendering
  if (isAuthenticated) {
    return (
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-950 border border-emerald-500/25 hover:bg-emerald-500/20 backdrop-blur-md transition-all shadow-2xs shrink-0"
        title="Open Editor Admin Dashboard"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#00C800]" />
        <span>Dashboard</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="px-3.5 py-1.5 text-xs font-semibold rounded-full apple-glass-input text-gray-800 hover:text-black hover:bg-black/6 transition-all shadow-2xs shrink-0"
    >
      Login
    </Link>
  );
}
