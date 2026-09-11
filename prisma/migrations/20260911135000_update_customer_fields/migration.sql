-- Add contactPerson column
ALTER TABLE "Customer" ADD COLUMN "contactPerson" TEXT;

-- Rename address to location
ALTER TABLE "Customer" RENAME COLUMN "address" TO "location";

-- Rename creditLimit to maxCapacity (SQLite stores as REAL, values are compatible with INTEGER)
ALTER TABLE "Customer" RENAME COLUMN "creditLimit" TO "maxCapacity";
