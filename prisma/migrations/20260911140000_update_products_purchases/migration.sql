-- Products: drop unused columns (drop index on sku first)
DROP INDEX IF EXISTS "Product_sku_key";
ALTER TABLE "Product" DROP COLUMN "description";
ALTER TABLE "Product" DROP COLUMN "sku";
ALTER TABLE "Product" DROP COLUMN "unitPrice";
ALTER TABLE "Product" RENAME COLUMN "costPrice" TO "defaultCost";

-- Purchase: make supplierId nullable (SQLite requires table recreation)
PRAGMA foreign_keys=OFF;

CREATE TABLE "Purchase_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT,
    "totalAmount" REAL NOT NULL,
    "notes" TEXT,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Purchase_new" SELECT "id", "supplierId", "totalAmount", "notes", "purchasedAt", "createdAt", "updatedAt" FROM "Purchase";
DROP TABLE "Purchase";
ALTER TABLE "Purchase_new" RENAME TO "Purchase";

PRAGMA foreign_keys=ON;
