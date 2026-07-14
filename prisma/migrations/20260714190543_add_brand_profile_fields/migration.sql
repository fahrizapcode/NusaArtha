-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'INVESTOR',
    "walletAddress" TEXT,
    "isKYCVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "legalDocsCID" TEXT,
    "sopDocsCID" TEXT,
    "readinessScore" INTEGER,
    "riskLevel" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "socialMedia" TEXT,
    "yearFounded" INTEGER,
    "nib" TEXT,
    "npwp" TEXT,
    "outletCount" INTEGER,
    "outletLocations" TEXT,
    "monthlyRevenue" REAL,
    "monthlyTransactions" INTEGER,
    "averageOrderValue" REAL,
    "operationalCosts" REAL,
    "capitalPerOutlet" REAL,
    "supplyChain" TEXT,
    "qualityStandard" TEXT,
    "mainProducts" TEXT,
    "profileCompletedAt" DATETIME,
    CONSTRAINT "Brand_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvestmentPool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "targetFunding" REAL NOT NULL,
    "totalSupply" INTEGER NOT NULL,
    "pricePerToken" REAL NOT NULL,
    "revenueShares" TEXT NOT NULL DEFAULT '{"investor":40,"brand":30,"operator":20,"platform":10}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "smartContractAddr" TEXT,
    "disclosureCID" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvestmentPool_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolId" TEXT NOT NULL,
    "operatorId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Outlet_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "InvestmentPool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outlet_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investorId" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "tokensOwned" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Investment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Investment_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "InvestmentPool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PosTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outletId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "items" TEXT NOT NULL DEFAULT '{}',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PosTransaction_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_ownerId_key" ON "Brand"("ownerId");
