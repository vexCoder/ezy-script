import { router } from "../trpc";
import { windowRouter } from "./window";
import { scriptRouter } from "./scripts";
import { npmRouter } from "./npm";

export const appRouter = router({
  scripts: scriptRouter,
  windows: windowRouter,
  npm: npmRouter,
});

export type AppRouter = typeof appRouter;
