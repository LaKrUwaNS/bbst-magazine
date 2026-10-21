import { Metadata } from "next";
import { ForgotPasswordCard } from "@/components/admin/forgot-password-card";

export const metadata: Metadata = {
  title: "Password Recovery | BBST Magazine",
  description: "Reset your administrative editorial password for BBST Magazine.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordCard />;
}
