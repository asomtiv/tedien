import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

const specialties = [
  "Odontología General",
  "Ortodoncia",
  "Endodoncia",
  "Implantología",
  "Periodoncia",
  "Odontopediatría",
  "Cirugía",
];

async function main() {
  for (const name of specialties) {
    await prisma.specialty.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${specialties.length} specialties`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
