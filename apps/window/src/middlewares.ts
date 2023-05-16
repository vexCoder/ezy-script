import { middleware } from "./trpc";

export const injectClient = middleware(async (opts) => {
  const { client } = opts.ctx;
  await client.$connect();
  const res = await opts.next({
    ctx: {
      client,
    },
  });
  await client.$disconnect();
  return res;
});

export const logger = middleware(async (opts) => {
  const t1 = performance.now();
  const res = await opts.next();
  const t2 = performance.now();
  console.log(`[${opts.path}] perf: ${(t2 - t1).toFixed(2)}ms`);

  return res;
});

export const middlewares = {
  injectClient,
  logger,
};
