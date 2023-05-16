import { PrismaClient, Script } from "@ezy/database";
import execa from "execa";
import fs from "fs-extra";
import _ from "lodash";
import pMap from "p-map";
import { dirname, join, relative } from "path";
import { getDirSize } from "../utils/helper";

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
    const value = await fs.readFile(pathToScript);

    return value.toString();
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

      console.log(pkg);

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

      const dtsFile = join(pathDir, "index.d.ts");

      const dtsFiles = await this.getAllDts(pathDir);
      const dtsContent = await pMap(dtsFiles, async (file) => {
        const content = await fs.readFile(file, "utf-8");
        // .replaceAll(
        //   "export declare",
        //   "declare"
        // );

        return {
          content,
          path: `${relative(pathToNodeModules, file)}`,
        };
      });

      const indexContent = await fs.readFile(dtsFile, "utf-8");

      console.log(name, dtsFile, relative(pathToNodeModules, dtsFile));
      return [
        ...dtsContent,
        {
          content: `declare module '${name}' {
            ${dtsContent.map((dts) => dts.content).join("\n")}
          }`,
          path: `${relative(pathToNodeModules, dtsFile)}`,
        },
      ];
    });

    return _.flatten(libs);
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

    if (!(await fs.pathExists(pathToRoot))) await fs.mkdir(pathToRoot);
    if (!(await fs.pathExists(pathToIndex)))
      await fs.writeFile(pathToIndex, "");

    const dependencies = {
      ...libs.reduce((acc, lib) => {
        acc[lib.name] = lib.version;
        return acc;
      }, {} as Record<string, string>),
      "@types/node": "^14.14.37",
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

    console.log(`Resyncing ${script.name} dependencies at ${pathToRoot}`);
    await execa("npm i", {
      cwd: pathToRoot,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      preferLocal: true,
    });

    console.log(2);

    return true;
  }

  static create(opts: ScriptHelperParams) {
    return new ScriptHelper(opts);
  }
}
