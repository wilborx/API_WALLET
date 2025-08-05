/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
import { encrypt } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  await prisma.apiKey.create({
    data: {
      name: "My OpenAI Key",
      provider: "OpenAI",
      encryptedKey: encrypt("sk-1234567890abcdef"),
      maskedKey: "sk-....cdef",
      status: "active",
    },
  });

  await prisma.apiKey.create({
    data: {
      name: "Stripe Test Key",
      provider: "Stripe",
      encryptedKey: encrypt("rk_test_1234567890abcdef"),
      maskedKey: "rk_t...cdef",
      status: "active",
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
