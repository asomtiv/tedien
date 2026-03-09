-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "historyId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "treatment" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tooth" TEXT,
    "face" TEXT NOT NULL,
    "appointmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evolution_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "ClinicalHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evolution_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evolution_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Evolution" ("createdAt", "date", "description", "face", "historyId", "id", "professionalId", "tooth", "treatment") SELECT "createdAt", "date", "description", "face", "historyId", "id", "professionalId", "tooth", "treatment" FROM "Evolution";
DROP TABLE "Evolution";
ALTER TABLE "new_Evolution" RENAME TO "Evolution";
CREATE UNIQUE INDEX "Evolution_appointmentId_key" ON "Evolution"("appointmentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
