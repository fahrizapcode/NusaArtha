// src/app/api/kyc/route.ts
// KYC submission endpoint

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = payload.id as string;
    const body = await request.json();
    const { fullName, phone, birthDate, country, address, bankName, accountNumber, accountHolder } = body;

    if (!fullName || !phone || !birthDate) {
      return NextResponse.json({ error: "Data pribadi wajib diisi" }, { status: 400 });
    }

    // Dalam MVP, kita simpan KYC data ke User dan set isKYCVerified = true (auto-approve)
    // Pada produksi, ini perlu review manual oleh admin
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: fullName,
        // isKYCVerified diset true setelah user submit — review manual di admin
        // Untuk demo/MVP kita set langsung
        isKYCVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "KYC berhasil disubmit. Akun Anda telah diverifikasi.",
    });
  } catch (err) {
    console.error("[POST /api/kyc]", err);
    return NextResponse.json({ error: "KYC submission gagal" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { id: true, name: true, email: true, isKYCVerified: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "Gagal memuat status KYC" }, { status: 500 });
  }
}
