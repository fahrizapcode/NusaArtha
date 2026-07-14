import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id as string;

    const body = await request.json();
    const { name, businessType, legalDocsCID, sopDocsCID } = body;

    if (!name || !businessType) {
      return NextResponse.json({ error: 'Name and businessType are required' }, { status: 400 });
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { ownerId: userId },
    });

    if (existingBrand) {
      return NextResponse.json({ error: 'You already registered a brand' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        ownerId: userId,
        name,
        businessType,
        legalDocsCID,
        sopDocsCID,
        riskLevel: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Brand registered successfully',
      brand,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Brand registration failed' }, { status: 500 });
  }
}
