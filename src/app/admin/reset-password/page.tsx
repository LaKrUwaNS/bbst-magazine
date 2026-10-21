import { Suspense } from "react";
import { Metadata } from "next";
import { ResetPasswordContent } from "@/components/admin/reset-password-card";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Update Password | BBST Magazine",
  description: "Establish a new editorial password for your BBST Magazine account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E500]" />
            <span className="text-xs text-gray-500 font-medium">Loading security verification...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
