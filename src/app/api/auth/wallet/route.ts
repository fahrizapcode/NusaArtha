// src/app/api/auth/wallet/route.ts
// Wallet-based auth: upsert user by walletAddress, set JWT session cookie

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { walletAddress, role } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
    }

    // Validasi format Stellar public key (G... 56 chars)
    if (!/^G[A-Z2-7]{55}$/.test(walletAddress)) {
      return NextResponse.json({ error: "Invalid Stellar wallet address" }, { status: 400 });
    }

    // Upsert user by wallet address
    let user = await prisma.user.findFirst({ where: { walletAddress } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          role: role || "INVESTOR",
          // Email placeholder – bisa diupdate user nanti
          email: `${walletAddress.slice(0, 8).toLowerCase()}@stellar.wallet`,
        },
      });
    }

    // Buat JWT dan set session cookie (sama seperti email/password login)
    const token = await signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 jam
    });

    return NextResponse.json({
      message: "Wallet auth successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("[POST /api/auth/wallet]", err);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { walletAddress },
    include: {
      brand: { select: { id: true, name: true, riskLevel: true, readinessScore: true } },
      investments: {
        select: { id: true, tokensOwned: true, poolId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
