import z from "zod";
import { injectClient, logger } from "../middlewares";
import { createProcedure, router } from "../trpc";

const procedure = createProcedure(injectClient, logger);

export const windowRouter = router({
  toggleWindow: procedure
    .input(z.enum(["minimize", "maximize", "restore", "close"]))
    .mutation(({ ctx, input }) => {
      switch (input) {
        case "minimize":
          ctx.win.minimize();
          break;
        case "maximize":
          ctx.win.maximize();
          break;
        case "restore":
          ctx.win.restore();
          break;
        case "close":
          ctx.win.close();
          break;
        default:
          break;
      }
    }),
  isMaximized: procedure.query(({ ctx }) => ctx.win.isMaximized()),
});
