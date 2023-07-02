import { PrismaClient } from '@prisma/client';

// console.log(process.env);

export const prisma = ((globalThis as any).prisma as PrismaClient | undefined)
  || (console.log('Fuck you, here\'s a new PrismaClient'), new PrismaClient());

(globalThis as any).prisma = prisma;
