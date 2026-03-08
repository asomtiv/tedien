import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

async function main() {
  const patientsWithoutHistory = await prisma.patient.findMany({
    where: { clinicalHistory: null },
    select: { id: true },
  });

  console.log(`Found ${patientsWithoutHistory.length} patients without clinical history`);

  for (const patient of patientsWithoutHistory) {
    await prisma.clinicalHistory.create({
      data: { patientId: patient.id },
    });
  }

  console.log("Backfill complete");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
