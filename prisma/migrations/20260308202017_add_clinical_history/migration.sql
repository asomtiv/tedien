-- CreateTable
CREATE TABLE "ClinicalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "bloodType" TEXT,
    "chronicDiseases" TEXT,
    "generalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClinicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "historyId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "treatment" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tooth" TEXT,
    "face" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evolution_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "ClinicalHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evolution_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalHistory_patientId_key" ON "ClinicalHistory"("patientId");
