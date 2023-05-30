import { PrismaClient, Script } from "@ezy/database";
import execa from "execa";
import fs from "fs-extra";
import _ from "lodash";
import pMap from "p-map";
import { dirname, join, relative } from "path";
import prettier from "prettier";
import { extractMatches, getDirSize } from "../utils/helper";

interface ScriptHelperParams {
  client: PrismaClient;
}

export class ScriptHelper {
  client: PrismaClient;

  constructor(opts: ScriptHelperParams) {
    this.client = opts.client;
  }

  private async getScript(id: number | Script) {
    const script =
      typeof id === "number"
        ? await this.client.script.findFirst({ where: { id } })
        : id;

    if (!script) return undefined;

    return script;
  }

  // get all dts filename recursively from pathDir

  private async getAllDts(pathDir: string) {
    const allDts = await fs.readdir(pathDir);
    const dtsFiles: (string | string[])[] = await pMap(allDts, async (file) => {
      const pathFile = join(pathDir, file);
      const stat = await fs.stat(pathFile);
      if (stat.isDirectory()) {
        return this.getAllDts(pathFile);
      }
      return pathFile;
    });

    return _.flatten(dtsFiles).filter((file) => file.endsWith(".d.ts"));
  }
  // const allDts = await fs.readdir(pathDir);
  // const dtsFiles = allDts.filter((file) => file.endsWith(".d.ts"));
  // const dtsContent = await pMap(dtsFiles, async (file) => {
  //   const content = await fs.readFile(join(pathDir, file), "utf-8");
  //   return content;
  // });

  async getScriptData(id: number | Script) {
    const script = await this.getScript(id);

    if (!script) return undefined;

    const libraries = await this.client.library.findMany({
      where: { scriptId: script.id },
    });

    const size = await getDirSize(join(script.path, script.name));
    const kb = size / 1000;

    return { ...script, libraries, filesize: kb };
  }

  async getScriptValue(id: number | Script) {
    const script = await this.getScript(id);

    if (!script) return undefined;

    const pathToScript = join(script.path, script.name, "index.ts");
    const value = await fs.readFile(pathToScript, {
      encoding: "utf-8",
    });

    return value;
  }

  async saveCode(path: string, value: string) {
    await fs.writeFile(path, value);
  }

  async getTypescriptLibs(id: number | Script) {
    const script = await this.getScript(id);

    if (!script) return [];

    const pathToRoot = join(script.path, script.name);
    const pathToNodeModules = join(pathToRoot, "node_modules");

    const scriptPackages = await this.client.library.findMany({
      where: { scriptId: script.id },
    });

    const packages = [
      ...scriptPackages,
      { name: "@types/node", version: "^14.14.37" },
    ];

    const libs = await pMap(packages, async (pkg) => {
      const name =
        pkg.name.indexOf("@types/") === -1
          ? pkg.name
          : pkg.name.replace("@types/", "");

      const pathToLib = join(pathToNodeModules, pkg.name);
      const pathToJSON = join(pathToLib, "package.json");
      let pkgJSON = { main: null, types: null };
      if (await fs.pathExists(pathToJSON))
        pkgJSON = await fs.readJson(pathToJSON);

      const extraPath = pkgJSON.types
        ? [pkgJSON.types]
        : [pkgJSON.main ? dirname(pkgJSON.main) : "", "index.d.ts"];

      const path = join(pathToLib, ...extraPath);
      const pathDir = (await fs.stat(path)).isDirectory()
        ? path
        : dirname(path);

      const dtsFiles = await this.getAllDts(pathDir);

      const dtsContent = await pMap(dtsFiles, async (file) => {
        let content = (await fs.readFile(file, "utf-8")).replaceAll(
          "export declare",
          "declare"
        );

        try {
          const regex = /export\s+\*\s+from\s+(?:(?:'|")(?<path>.*)(?:'|");)/g;

          const matches = extractMatches(regex, content, (match) => [
            match?.[0],
            match?.groups?.path,
          ]) as [string, string][];

          const exports = await pMap(matches, async ([raw, match]) => {
            let pathToImport = join(dirname(file), `${match}.d.ts`);

            if (!(await fs.pathExists(pathToImport))) return undefined;
            if ((await fs.stat(pathToImport)).isDirectory()) {
              pathToImport = join(pathToImport, "index.d.ts");
            }

            const exportContent = (await fs.readFile(pathToImport, "utf-8"))
              .replaceAll("export declare", "declare")
              .replaceAll("declare", "");

            return {
              content: exportContent,
              raw,
            };
          });

          for (let i = 0; i < exports.length; i++) {
            const element = exports[i];
            if (element) {
              content = content.replace(element.raw, element.content);
            }
          }

          content = content.replaceAll(/import.*from\s+.*;/g, "");
          content = content.replaceAll("export {}", "");
        } catch (error) {
          console.error(error);
        }

        return {
          content,
          path: `${relative(pathToNodeModules, file)}`,
        };
      });

      const indexPath = (await fs.stat(path)).isDirectory()
        ? `${path}\\index.d.ts`
        : path;

      const indexContent = dtsContent.find(
        (dts) => dts.path === `${relative(pathToNodeModules, indexPath)}`
      );

      const otherContent = dtsContent.filter(
        (dts) => dts.path !== `${relative(pathToNodeModules, indexPath)}`
      );

      return [
        ...otherContent,
        {
          content: `declare module '${name}' {
            ${indexContent?.content.replaceAll("declare", "")}
          }`,
          path: `${relative(pathToNodeModules, indexPath)}`,
        },
      ];
    });

    const flatten = _.flatten(libs);

    flatten.push({
      content: `
        declare const args: (name: string) => string;
        declare const debug: {
          info: (...args: any[]) => void;
          error: (...args: any[]) => void;
          warn: (...args: any[]) => void;
          debug: (...args: any[]) => void;
          trace: (...args: any[]) => void;
        }
      `,
      path: "",
    });

    return flatten;
  }

  async resyncScript(id: number | Script) {
    const script = await this.getScript(id);

    if (!script) return undefined;
    const libs = await this.client.library.findMany({
      where: { scriptId: script.id },
    });

    const pathToRoot = join(script.path, script.name);
    const pathToIndex = join(pathToRoot, "index.ts");
    const pathToPkg = join(pathToRoot, "package.json");
    const pathToTsconfig = join(pathToRoot, "tsconfig.json");

    if (!(await fs.pathExists(pathToRoot))) await fs.mkdir(pathToRoot);
    if (!(await fs.pathExists(pathToIndex)))
      await fs.writeFile(pathToIndex, "");

    const dependencies = {
      ...libs.reduce((acc, lib) => {
        acc[lib.name] = lib.version;
        return acc;
      }, {} as Record<string, string>),
      "@types/node": "14.14.37",
      tsx: "3.12.7",
      prettier: "2.8.8",
    };

    await fs.writeJSON(
      pathToPkg,
      {
        name: script.name,
        version: "1.0.0",
        description: "",
        dependencies,
      },
      {
        spaces: 2,
      }
    );

    await fs.writeJSON(
      pathToTsconfig,
      {
        name: script.name,
        version: "1.0.0",
        description: "",
        dependencies,
      },
      {
        spaces: 2,
      }
    );

    await fs.writeJSON(
      pathToPkg,
      {
        name: script.name,
        version: "1.0.0",
        description: "",
        dependencies,
      },
      {
        spaces: 2,
      }
    );

    console.log(`Resyncing ${script.name} dependencies at ${pathToRoot}`);
    await execa("npm i", {
      cwd: pathToRoot,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    console.log(`Linting ${script.name}`);
    await this.formatScript(script.id);

    return true;
  }

  async formatScript(id: number | Script) {
    const script = await this.getScript(id);

    if (!script) return undefined;
    const pathToRoot = join(script.path, script.name);
    const pathToIndex = join(pathToRoot, "index.ts");

    const indexContent = await this.getScriptValue(script.id);

    if (indexContent) {
      const formatted = prettier.format(indexContent, {
        parser: "typescript",
        arrowParens: "always",
        bracketSameLine: false,
        bracketSpacing: true,
        embeddedLanguageFormatting: "auto",
        htmlWhitespaceSensitivity: "css",
        insertPragma: false,
        jsxSingleQuote: false,
        printWidth: 120,
        proseWrap: "preserve",
        quoteProps: "as-needed",
        requirePragma: false,
        semi: true,
        singleAttributePerLine: false,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "es5",
        useTabs: true,
        vueIndentScriptAndStyle: false,
        endOfLine: "crlf",
      });

      await fs.writeFile(pathToIndex, formatted);

      return formatted;
    }

    return indexContent;
  }

  async getScriptDoc(id: number | Script) {
    const script = await this.getScript(id);

    if (!script) return undefined;

    const value = await this.getScriptValue(script);

    if (!value) return undefined;

    const doc = value.match(/\/\*\*[\s\S]*?\*\//g);

    const comments = doc?.[0].split("\r\n");

    const parameters = comments
      ?.filter((v) => v.includes("@param"))
      .map((v) => {
        const extractRegex =
          /.*@param\s*(?:\{(?<type>\w*)\}\s){0,1}(?<value>\w*)\s*(?:-){0,1}\s*(?<description>[\w\s]*\w){0,1}\s*/g;
        const match = extractRegex.exec(v);

        return {
          name: match?.groups?.value,
          type: match?.groups?.type || "string",
          description: match?.groups?.description,
        };
      });

    const name = comments
      ?.find((v) => v.includes("@name"))
      ?.split("@name")[1]
      .trim();

    const description = comments
      ?.find((v) => v.includes("@description"))
      ?.split("@description")[1]
      .trim();

    return {
      parameters,
      name,
      description,
    };
  }

  makeArgs(input: string, map?: (key: string) => string) {
    const [, ...args] = (input ?? "").split(" ");

    const mappedArgs = args.reduce((p, c) => {
      if (c.indexOf("--") === 0) {
        return [...p, [c]];
      }
      const lastIndex = p.length - 1;

      p[lastIndex] = [...p[lastIndex], c];

      return p;
    }, [] as string[][]);

    const env = mappedArgs.reduce((p, c) => {
      const [key, ...values] = c;
      return {
        ...p,
        [map?.(key) ?? `ENV_PARAMETERS_${_.upperCase(key)}`]: values.join(" "),
      };
    }, {} as Record<string, string>);

    return env;
  }

  static create(opts: ScriptHelperParams) {
    return new ScriptHelper(opts);
  }
}
