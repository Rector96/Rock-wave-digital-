-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM (
  'VEHICLE_RENEWAL',
  'NIN_SERVICES',
  'TIN_EXTRACTION',
  'CAC_REGISTRATION',
  'ELECTRICITY_UTILITY',
  'EDUCATION_PINS'
);

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM (
  'LOOKED_UP',
  'PAID',
  'DIGITAL_READY',
  'QUEUED_PRINT',
  'SEALED',
  'DISPATCHED',
  'DELIVERED'
);

-- CreateTable "User"
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable "HubOrder"
CREATE TABLE "HubOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceType" "ServiceCategory" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'LOOKED_UP',
    "paymentRef" TEXT NOT NULL,
    "rawGovCost" DECIMAL(10,2) NOT NULL,
    "serviceMargin" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalCharged" DECIMAL(10,2) NOT NULL,
    "isPhysical" BOOLEAN NOT NULL DEFAULT false,
    "metaPayload" JSONB NOT NULL,
    "trackingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HubOrder_paymentRef_key" ON "HubOrder"("paymentRef");

-- CreateIndex
CREATE INDEX "HubOrder_status_idx" ON "HubOrder"("status");

-- CreateIndex
CREATE INDEX "HubOrder_paymentRef_idx" ON "HubOrder"("paymentRef");

-- AddForeignKey
ALTER TABLE "HubOrder" ADD CONSTRAINT "HubOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
