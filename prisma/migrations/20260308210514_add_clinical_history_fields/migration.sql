-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClinicalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "bloodType" TEXT,
    "chronicDiseases" TEXT,
    "generalNotes" TEXT,
    "allergies" TEXT,
    "currentMedications" TEXT,
    "initialized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClinicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClinicalHistory" ("bloodType", "chronicDiseases", "createdAt", "generalNotes", "id", "patientId", "updatedAt") SELECT "bloodType", "chronicDiseases", "createdAt", "generalNotes", "id", "patientId", "updatedAt" FROM "ClinicalHistory";
DROP TABLE "ClinicalHistory";
ALTER TABLE "new_ClinicalHistory" RENAME TO "ClinicalHistory";
CREATE UNIQUE INDEX "ClinicalHistory_patientId_key" ON "ClinicalHistory"("patientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
