import { PrismaClient } from '@prisma/client';

// console.log(process.env);

export const prisma = ((globalThis as any).prisma as PrismaClient | undefined)
  || new PrismaClient();

(globalThis as any).prisma = prisma;
