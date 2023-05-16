import search from "libnpmsearch";
import z from "zod";
import got from "got";
import semver from "semver";
import { injectClient, logger } from "../middlewares";
import { createProcedure, router } from "../trpc";

const procedure = createProcedure(injectClient, logger);

export const npmRouter = router({
  searchNPM: procedure.input(z.string()).query(async ({ input }) => {
    const list = await search(input, { limit: 10 });

    return list;
  }),
  getVersions: procedure.input(z.string()).query(async ({ input }) => {
    const { body } = await got(`https://registry.npmjs.org/${input}`, {
      responseType: "json",
    });

    const sorted = Object.keys((body as any).versions).sort(
      (a, b) =>
        // semver version checker
        -semver.compare(a, b)
    );

    return sorted;
  }),
});
