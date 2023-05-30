import { observable } from "@trpc/server/observable";
import z from "zod";
import { injectClient, logger } from "../middlewares";
import { createProcedure, router } from "../trpc";
import { getAppPositioning, getCurrentScreen } from "../utils/screen";

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
  toggleWindowSize: procedure
    .input(
      z.object({
        size: z.enum(["small", "medium", "large"]).optional(),
        custom: z.number().optional(),
        width: z.number().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const width = 600;

      const currentScreen = ctx.screen;

      const updateSize = (height: number) => {
        ctx.win.setMaximumSize(input.width ?? width, height + 50);
        ctx.win.setSize(input.width ?? width, height + 50);
        const { x, y } = getAppPositioning(ctx.win, currentScreen);
        ctx.win.setPosition(x, y);
      };

      console.log(input.custom);

      const minimum = 46 + 28;

      switch (input.size) {
        case "small":
          updateSize(minimum);
          break;
        case "medium":
          updateSize(350);
          break;
        case "large":
          updateSize(650);
          break;
        default:
          if (input.custom) updateSize(input.custom);
          break;
      }

      const size = ctx.win.getSize();
      return {
        width: size[0],
        height: size[1],
      };
    }),
  onToggleVisibility: procedure.subscription(({ ctx }) =>
    observable<"show" | "hide">((emit) => {
      const onMessage = (arg: "show" | "hide") => {
        console.log(arg);
        emit.next(arg);
      };

      ctx.emitter.on("toggle-window-visibility", onMessage);

      return () => {
        ctx.emitter.off("toggle-window-visibility", onMessage);
      };
    })
  ),
  onUnFocus: procedure.subscription(({ ctx }) =>
    observable<void>((emit) => {
      const onMessage = () => {
        emit.next();
      };

      ctx.win.on("blur", onMessage);

      return () => {
        ctx.win.off("blur", onMessage);
      };
    })
  ),
  toggleVisibility: procedure
    .input(z.enum(["show", "hide"]))
    .mutation(({ ctx, input }) => {
      if (input === "show") ctx.win.show();
      else ctx.win.hide();
    }),
  bringToFront: procedure.mutation(({ ctx }) => {
    ctx.win.focus();
  }),
  currentWindow: procedure.query(async ({ ctx }) => {
    const current = getCurrentScreen(ctx.win);

    const settings = await ctx.client.settings.findFirst({});

    if (current.id !== ctx.screen.id && settings) {
      await ctx.client.settings.update({
        where: {
          id: settings.id,
        },
        data: {
          primaryScreen: BigInt(current.id),
        },
      });
    }

    return current;
  }),
});
