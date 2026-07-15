// src/app/api/upload/route.ts
// Upload file to IPFS (Pinata) and optionally save CID to brand

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToIPFS } from "@/lib/ipfs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const ownerId = payload.id as string;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fieldName = formData.get("fieldName") as string | null; // "legalDocsCID" or "sopDocsCID"

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 10MB" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau DOCX." },
        { status: 400 }
      );
    }

    // Upload to IPFS
    const cid = await uploadToIPFS(file, file.name);

    // If fieldName provided, save to brand record
    if (fieldName && (fieldName === "legalDocsCID" || fieldName === "sopDocsCID")) {
      const brand = await prisma.brand.findFirst({ where: { ownerId } });
      if (brand) {
        await prisma.brand.update({
          where: { id: brand.id },
          data: { [fieldName]: cid },
        });
      }
    }

    return NextResponse.json({
      cid,
      message: "File berhasil diunggah ke IPFS",
    });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
