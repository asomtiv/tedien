-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SocialInsurance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "lastVisit" DATETIME,
    "notes" TEXT,
    "address" TEXT,
    "locality" TEXT,
    "birthDate" DATETIME,
    "provinceId" TEXT,
    "socialInsuranceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Patient_socialInsuranceId_fkey" FOREIGN KEY ("socialInsuranceId") REFERENCES "SocialInsurance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("createdAt", "dni", "email", "firstName", "id", "lastName", "lastVisit", "notes", "phone", "updatedAt") SELECT "createdAt", "dni", "email", "firstName", "id", "lastName", "lastVisit", "notes", "phone", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_dni_key" ON "Patient"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialInsurance_name_key" ON "SocialInsurance"("name");
