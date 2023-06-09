/* eslint-disable prefer-destructuring */
import { PrismaClient } from "@ezy/database/dist/generated";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { BrowserWindow } from "electron";
import { CreateContextOptions } from "electron-trpc/main";
import { EventEmitter } from "events";
import { Screen } from "./utils/screen";

export interface ContextBuilderParams {
  client: PrismaClient;
  win: BrowserWindow;
  emitter: EventEmitter;
  screen: Screen;
}

export const createContext =
  (opts: ContextBuilderParams) =>
  async ({ event }: CreateContextOptions) => ({
    event,
    client: opts.client,
    win: opts.win,
    emitter: opts.emitter,
    screen: opts.screen,
  }); // no context

export type Context = inferAsyncReturnType<ReturnType<typeof createContext>> & {
  client: PrismaClient;
  win: BrowserWindow;
  emitter: EventEmitter;
  screen: Screen;
};

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

export type Middleware = ReturnType<typeof middleware>;

export const createProcedure = (...middlewares: Middleware[]) => {
  let newProcedure = procedure;
  for (let i = 0; i < middlewares.length; i++) {
    const md = middlewares[i];
    newProcedure = newProcedure.use(md);
  }

  return newProcedure;
};
