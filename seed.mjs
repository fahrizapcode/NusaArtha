import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nusaartha.id' },
    update: { passwordHash },
    create: {
      email: 'admin@nusaartha.id',
      name: 'Super Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Create Brand Owner
  const brandOwner = await prisma.user.upsert({
    where: { email: 'brand@nusaartha.id' },
    update: { passwordHash },
    create: {
      email: 'brand@nusaartha.id',
      name: 'Pemilik Brand Kopi',
      passwordHash,
      role: 'BRAND_OWNER',
    },
  });

  // Create Operator
  const operator = await prisma.user.upsert({
    where: { email: 'operator@nusaartha.id' },
    update: { passwordHash },
    create: {
      email: 'operator@nusaartha.id',
      name: 'Operator Outlet 1',
      passwordHash,
      role: 'OPERATOR',
    },
  });

  // Create Investor
  const investor = await prisma.user.upsert({
    where: { email: 'investor@nusaartha.id' },
    update: { passwordHash },
    create: {
      email: 'investor@nusaartha.id',
      name: 'Investor Publik',
      passwordHash,
      role: 'INVESTOR',
    },
  });

  // ── Create Brand for Brand Owner ──────────────────────────────────────────
  const brand = await prisma.brand.upsert({
    where: { ownerId: brandOwner.id },
    update: {},
    create: {
      ownerId: brandOwner.id,
      name: 'Kopi Nusantara',
      businessType: 'F&B / Coffee Shop',
      readinessScore: 85,
      riskLevel: 'MATURE',
    },
  });

  // ── Create Investment Pools (Campaigns) ───────────────────────────────────
  // Delete existing pools for this brand to avoid duplicates on re-run
  const existingPools = await prisma.investmentPool.findMany({
    where: { brandId: brand.id },
  });

  if (existingPools.length === 0) {
    const pool1 = await prisma.investmentPool.create({
      data: {
        brandId: brand.id,
        name: 'Kopi Nusantara - BSD City',
        location: 'Jl. Pahlawan No. 12, BSD City, Tangerang Selatan',
        targetFunding: 500000000,
        totalSupply: 1000,
        pricePerToken: 500000,
        status: 'PUBLISHED',
        revenueShares: JSON.stringify({ investor: 40, brand: 30, operator: 20, platform: 10 }),
      },
    });

    const pool2 = await prisma.investmentPool.create({
      data: {
        brandId: brand.id,
        name: 'Kopi Nusantara - Cihampelas',
        location: 'Jl. Cihampelas No. 87, Bandung',
        targetFunding: 350000000,
        totalSupply: 700,
        pricePerToken: 500000,
        status: 'PUBLISHED',
        revenueShares: JSON.stringify({ investor: 40, brand: 30, operator: 20, platform: 10 }),
      },
    });

    const pool3 = await prisma.investmentPool.create({
      data: {
        brandId: brand.id,
        name: 'Kopi Nusantara - Malioboro',
        location: 'Jl. Malioboro No. 22, Yogyakarta',
        targetFunding: 400000000,
        totalSupply: 800,
        pricePerToken: 500000,
        status: 'ACTIVE',
        revenueShares: JSON.stringify({ investor: 45, brand: 25, operator: 20, platform: 10 }),
      },
    });

    console.log('Created pools:', { pool1: pool1.id, pool2: pool2.id, pool3: pool3.id });

    // Create an outlet for pool3 (ACTIVE)
    await prisma.outlet.create({
      data: {
        poolId: pool3.id,
        operatorId: operator.id,
        name: 'Outlet Malioboro',
        location: 'Jl. Malioboro No. 22, Yogyakarta',
        status: 'ACTIVE',
      },
    });
  } else {
    console.log('Pools already exist, skipping creation.');
  }

  console.log('Seeding completed:');
  console.log({ admin: admin.email, brandOwner: brandOwner.email, operator: operator.email, investor: investor.email });
  console.log({ brand: brand.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
