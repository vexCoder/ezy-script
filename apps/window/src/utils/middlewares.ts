import { PrismaClient } from "@ezy/database";
import { Middleware } from "../decorators/UseMiddlewares";

const prisma = new PrismaClient();
export const connectPrisma: Middleware = async (_ctx, next) => {
  await prisma.$connect();
  await next();
  await prisma.$disconnect();
};

export const functionPerf: Middleware = async (ctx, next) => {
  const t1 = performance.now();
  await next();
  const t2 = performance.now();
  console.log(`${ctx.name} perf: ${(t2 - t1).toFixed(2)}ms`);
};
