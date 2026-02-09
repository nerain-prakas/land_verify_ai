-- Create enums
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'VERIFIED', 'LIVE', 'SOLD', 'REJECTED');
CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PropertyType" AS ENUM ('LAND_ONLY', 'LAND_WITH_HOUSE', 'COMMERCIAL', 'AGRICULTURAL', 'INDUSTRIAL');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "imageUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create land_listings table
CREATE TABLE "land_listings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "propertyType" "PropertyType" NOT NULL DEFAULT 'LAND_ONLY',
    "title" TEXT,
    "description" TEXT,
    "totalArea" DOUBLE PRECISION,
    "coordinates" DOUBLE PRECISION[],
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "geojsonPolygon" JSONB,
    "aiVerificationScore" DECIMAL(3,2),
    "documentExtracted" JSONB,
    "boundaryMatchPct" DECIMAL(3,1),
    "videoUrl" TEXT,
    "videoAnalysis" JSONB,
    "noiseLevelDb" DECIMAL(4,1),
    "accessibilityScore" DECIMAL(3,2),
    "terrainClass" TEXT,
    "landTopography" TEXT,
    "soilColor" TEXT,
    "soilTexture" TEXT,
    "waterSource" TEXT,
    "fencingStatus" TEXT,
    "cropsVisible" TEXT[],
    "hasStructureDetected" BOOLEAN NOT NULL DEFAULT false,
    "houseExteriorScore" DECIMAL(3,2),
    "houseStyle" TEXT,
    "houseWallColor" TEXT,
    "housePaintFreshness" TEXT,
    "wallMaterial" TEXT,
    "floorsVisible" INTEGER,
    "houseExtensions" TEXT[],
    "schoolsNearbyCount" INTEGER DEFAULT 0,
    "hospitalsNearbyCount" INTEGER DEFAULT 0,
    "marketsNearbyCount" INTEGER DEFAULT 0,
    "distanceToNearestRoadM" INTEGER,
    "askingPrice" INTEGER,
    "pricePerSqm" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "images" TEXT[],
    "thumbnailUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "land_listings_pkey" PRIMARY KEY ("id")
);

-- Create meeting_requests table
CREATE TABLE "meeting_requests" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'PENDING',
    "proposedTimes" TIMESTAMP(3)[],
    "selectedTime" TIMESTAMP(3),
    "location" TEXT,
    "agenda" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_requests_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create indexes for performance
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE INDEX "land_listings_sellerId_idx" ON "land_listings"("sellerId");
CREATE INDEX "land_listings_propertyType_idx" ON "land_listings"("propertyType");
CREATE INDEX "land_listings_terrainClass_idx" ON "land_listings"("terrainClass");
CREATE INDEX "land_listings_hasStructureDetected_idx" ON "land_listings"("hasStructureDetected");
CREATE INDEX "land_listings_city_idx" ON "land_listings"("city");
CREATE INDEX "land_listings_status_idx" ON "land_listings"("status");
CREATE INDEX "land_listings_askingPrice_idx" ON "land_listings"("askingPrice");
CREATE INDEX "land_listings_aiVerificationScore_idx" ON "land_listings"("aiVerificationScore");
CREATE INDEX "land_listings_createdAt_idx" ON "land_listings"("createdAt");

CREATE INDEX "meeting_requests_buyerId_idx" ON "meeting_requests"("buyerId");
CREATE INDEX "meeting_requests_sellerId_idx" ON "meeting_requests"("sellerId");
CREATE INDEX "meeting_requests_listingId_idx" ON "meeting_requests"("listingId");

-- Add foreign key constraints
ALTER TABLE "land_listings" ADD CONSTRAINT "land_listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;