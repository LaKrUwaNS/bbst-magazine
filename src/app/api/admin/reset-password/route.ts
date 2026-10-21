import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/email/email-validation";
import { hashPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Hash token to look up in verification table
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const record = await prisma.verification.findFirst({
      where: {
        value: tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid or has expired. Please request a new recovery link.",
        },
        { status: 400 }
      );
    }

    // Invalidate the token immediately so it cannot be reused
    await prisma.verification.delete({
      where: { id: record.id },
    });

    // Hash the new password using scrypt
    const newHash = hashPassword(password);

    // If an associated User/Account exists in PostgreSQL, update their credential
    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: record.identifier, mode: "insensitive" as const } },
      include: { accounts: true },
    });

    if (dbUser) {
      const credentialAccount = dbUser.accounts.find(
        (acc) => acc.providerId === "credential"
      );

      if (credentialAccount) {
        await prisma.account.update({
          where: { id: credentialAccount.id },
          data: { password: newHash, updatedAt: new Date() },
        });
      } else {
        await prisma.account.create({
          data: {
            id: crypto.randomUUID(),
            accountId: dbUser.id,
            providerId: "credential",
            userId: dbUser.id,
            password: newHash,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Your password has been successfully updated. You may now sign in to the editorial dashboard.",
    });
  } catch (error) {
    console.error("[ResetPassword API] Error completing password reset:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
