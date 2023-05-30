import execa from "execa";
import fs, { writeFile } from "fs-extra";
import { join } from "path";
import { z } from "zod";
import dayjs from "dayjs";
import { observable } from "@trpc/server/observable";
import rl from "node:readline";
import chokidar from "chokidar";
import { Library } from "@ezy/database/dist/generated";
import { injectClient, logger } from "../middlewares";
import { createProcedure, router } from "../trpc";
import { ScriptHelper } from "./scripts.helper";

const procedure = createProcedure(injectClient, logger);

export const scriptRouter = router({
  getScript: procedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const [command] = (input ?? "").split(" ");

      const script = await ctx.client.script.findFirst({
        where: {
          name: command,
        },
      });

      if (!script) return null;

      const helper = ScriptHelper.create({ client: ctx.client });

      const scriptWithLibs = await helper.getScriptData(script);
      const value = await helper.getScriptValue(script);
      const doc = await helper.getScriptDoc(script);

      const parameters = helper.makeArgs(input, (key) => key.replace("--", ""));

      return {
        ...(scriptWithLibs || {}),
        value,
        doc,
        parameters,
      };
    }),
  getScriptById: procedure.input(z.number()).query(async ({ ctx, input }) => {
    const script = await ctx.client.script.findFirst({
      where: {
        id: input,
      },
    });

    if (!script) return null;

    const helper = ScriptHelper.create({ client: ctx.client });

    const scriptWithLibs = await helper.getScriptData(script);
    const value = await helper.getScriptValue(script);
    const doc = await helper.getScriptDoc(script);

    return {
      ...(scriptWithLibs || {}),
      value,
      doc,
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

      await helper.formatScript(script);

      await ctx.client.script.update({
        where: {
          id: input.id,
        },
        data: {
          updatedAt: dayjs().toDate(),
        },
      });

      return true;
    }),
  updateLib: procedure
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        version: z.string(),
        script: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const helper = ScriptHelper.create({ client: ctx.client });

      console.log(input);

      let lib: Library | null = null;
      if (!input.id && input.script) {
        lib = await ctx.client.library.create({
          data: {
            name: input.name,
            version: input.version,
            scriptId: input.script,
          },
        });
      } else {
        lib = await ctx.client.library.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            version: input.version,
          },
        });
      }

      console.log(lib.scriptId);
      await helper.resyncScript(lib.scriptId);

      return true;
    }),
  deleteLib: procedure.input(z.number()).mutation(async ({ ctx, input }) => {
    const helper = ScriptHelper.create({ client: ctx.client });

    const lib = await ctx.client.library.delete({
      where: {
        id: input,
      },
    });

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
  makeItems: procedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const [command] = (input ?? "").split(" ");

      const script = await ctx.client.script.findFirst({
        where: {
          name: command,
        },
      });

      const commands = [];

      if (script) {
        commands.push(
          {
            label: "Run",
            description: "",
            command: "script.run",
            arguments: [],
            keys: ["ctrl", "enter"],
          },
          {
            label: "Edit",
            description: "",
            command: "script.edit",
            arguments: [],
            keys: ["ctrl", "e"],
          },
          {
            label: "Delete",
            description: "",
            command: "script.delete",
            arguments: [],
            keys: ["ctrl", "d"],
          }
        );
      } else {
        commands.push({
          label: "New Script",
          description: "",
          command: "script.new",
          arguments: [],
          keys: ["ctrl", "n"],
        });
      }

      return commands;
    }),
  runScript: procedure
    .input(
      z.object({
        script: z.number(),
        input: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const helper = ScriptHelper.create({ client: ctx.client });

      const script = await helper.getScriptData(input.script);
      const value = await helper.getScriptValue(input.script);

      if (!script || !value) return;

      const env = helper.makeArgs(input.input);

      const pathToRoot = join(script.path, script.name);

      const tempIndex = join(pathToRoot, "~index.ts");

      await writeFile(
        tempIndex,
        `
        import __fs from "fs";
        import __path from "path";

        function args(name: string) {
          return process.env[\`ENV_PARAMETERS_\${name.toUpperCase()}\`] || null
        }

        function makeDebug (
          cat: "info" | "error" | "warn" | "debug" | "trace"
        ) {
          return (...args: any[]) => {
            let logType = "log"

            if (cat === "error") logType = "error"
            if (cat === "warn") logType = "warn"
            if (cat === "debug") logType = "debug"
            if (cat === "trace") logType = "trace"
            
            console[logType](...args)

            const path = __path.join(__dirname, "logs", \`${
              script.name
            }-${dayjs().format("MMMM-DD-YYYY")}.log\`)
            
            try {
              __fs.mkdirSync(__path.join(__dirname, "logs"))
            } catch (e) {}

            try {
              __fs.existsSync(path)
            } catch (e) {
              __fs.writeFileSync(path, "")
            }

            const err2String = (err: any) => {
              if(!(err instanceof Error)) return err
              return \`\${err.message}\\n\${err.stack.toString()}\`
            }


            __fs.appendFileSync(
              path,
              JSON.stringify({ category: cat, args: args.map(err2String), timestamp: ${dayjs().unix()}}) + "\\n"
            )
          }
        }

        const debug = {
          info: makeDebug("info"),
          error: makeDebug("error"),
          warn: makeDebug("warn"),
          debug: makeDebug("debug"),
          trace: makeDebug("trace"),
        }

        ${value}
      `
      );

      await helper.resyncScript(script.id);

      await execa("node --loader tsx ./~index.ts", {
        cwd: pathToRoot,
        env,
        stdout: "inherit",
        stderr: "inherit",
      });
    }),
  logs: procedure.input(z.number()).subscription(async ({ ctx, input }) => {
    const helper = ScriptHelper.create({ client: ctx.client });

    const script = await helper.getScriptData(input);

    type Parsed = {
      category: "info" | "error" | "warn" | "debug" | "trace";
      args: any[];
      timestamp: number;
    };

    type Log = {
      id: number;
      category: Parsed["category"];
      message: string[];
      timestamp: number;
    };

    return observable<{
      currentLine: number;
      logs: Log[];
    }>((emit) => {
      if (!script) return;

      const pathToRoot = join(script.path, script.name);
      const pathToLogs = join(
        pathToRoot,
        "logs",
        `${script.name}-${dayjs().format("MMMM-DD-YYYY")}.log`
      );

      let running = false;
      let lastLine = 0;

      const handleLines = () => {
        if (running) return;
        let currentLine = 0;
        running = true;
        const currentLogs: Log[] = [];

        const stream = fs.createReadStream(pathToLogs);

        const reader = rl.createInterface({
          input: stream,
        });

        const handleLine = (line: string) => {
          console.log(`Line ${currentLine}`, line);
          currentLine += 1;
          if (currentLine >= lastLine) {
            const parsed = JSON.parse(line) as Parsed;
            currentLogs.push({
              id: currentLine,
              message: parsed.args,
              category: parsed.category,
              timestamp: parsed.timestamp,
            });
          }
        };

        reader.on("line", handleLine);

        reader.on("close", () => {
          lastLine = currentLine;
          running = false;
          emit.next({
            currentLine: lastLine,
            logs: currentLogs,
          });
        });
      };

      chokidar.watch(pathToLogs).on("all", (event) => {
        console.log(event, lastLine);
        if (event === "add" || event === "change") {
          handleLines();
        }
      });
    });
  }),
});
