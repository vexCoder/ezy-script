import pMap from "p-map";
import { z } from "zod";
import { join } from "path";
import { injectClient, logger } from "../middlewares";
import { createProcedure, router } from "../trpc";
import { ScriptHelper } from "./scripts.helper";

const procedure = createProcedure(injectClient, logger);

export const scriptRouter = router({
  getScripts: procedure.query(async ({ ctx }) => {
    const res = await ctx.client.script.findMany();

    const scriptWithLibs = await pMap(res, async (script) => {
      const helper = ScriptHelper.create({ client: ctx.client });
      const data = await helper.getScriptData(script);
      return data;
    });

    return scriptWithLibs;
  }),

  getScript: procedure
    .input(z.number().optional())
    .query(async ({ ctx, input }) => {
      if (!input) return null;
      const helper = ScriptHelper.create({ client: ctx.client });

      const script = await helper.getScriptData(input);
      const value = await helper.getScriptValue(input);

      return {
        ...script,
        value,
      };
    }),

  saveCode: procedure
    .input(
      z
        .object({
          id: z.number().optional(),
          code: z.string(),
        })
        .required()
    )
    .mutation(async ({ ctx, input }) => {
      console.log("saved", input);
      const helper = ScriptHelper.create({ client: ctx.client });

      const script = await helper.getScriptData(input.id);

      if (!script) return false;

      await helper.saveCode(
        join(script.path, script.name, "index.ts"),
        input.code
      );

      return true;
    }),
  updateLib: procedure
    .input(
      z
        .object({
          id: z.number(),
          name: z.string(),
          version: z.string(),
        })
        .required()
    )
    .mutation(async ({ ctx, input }) => {
      const helper = ScriptHelper.create({ client: ctx.client });

      const lib = await ctx.client.library.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          version: input.version,
        },
      });

      console.log(lib.scriptId);
      await helper.resyncScript(lib.scriptId);

      return true;
    }),
  getTypescriptLibs: procedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const helper = ScriptHelper.create({ client: ctx.client });

      const script = await helper.getScriptData(input);

      if (!script) return null;

      const libs = await helper.getTypescriptLibs(script);

      return libs;
    }),
  resyncScript: procedure.input(z.number()).mutation(async ({ ctx, input }) => {
    const helper = ScriptHelper.create({ client: ctx.client });

    await helper.resyncScript(input);

    return true;
  }),
});
