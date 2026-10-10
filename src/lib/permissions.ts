import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "ADMIN" | "EDITOR" | null;

export const getSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
};

export const requireAuth = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
};

export const requireRole = async (allowedRoles: Role[]) => {
  const session = await requireAuth();
  
  // Type assertion or checking session user role
  const userRole = session.user.role as Role;
  
  if (!allowedRoles.includes(userRole)) {
    redirect("/unauthorized"); // or throw new Error("Unauthorized")
  }
  return session;
};

export const requireAdmin = () => requireRole(["ADMIN"]);
export const requireEditor = () => requireRole(["ADMIN", "EDITOR"]);
