import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyJwt(token);

  if (!payload || !payload.email) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email as string },
    select: { id: true, email: true, name: true, role: true, walletAddress: true, isKYCVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
