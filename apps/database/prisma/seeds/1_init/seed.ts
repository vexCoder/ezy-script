import { PrismaClient, Script } from "../../../dist/generated";
import { SeedSchema } from "../../types";
import pMap from "p-map";
import fs from "fs-extra";
import { join } from "path";

const schema: SeedSchema<Script> = {
  model: "script",
  env: "dev",
  seed: {},
  async custom(prisma: PrismaClient) {
    // Custom seed logic

    const libs = [
      {
        name: "got",
        version: "11.8.6",
      },
      {
        name: "p-map",
        version: "4.0.0",
      },
    ];

    const scriptData = {
      name: "sample",
      path: "W:\\Projects\\ezy-script\\temp",
    };

    const script = await prisma.script.upsert({
      where: {
        name: "sample",
      },
      create: scriptData,
      update: scriptData,
    });

    await pMap(libs, async (lib) => {
      const libData = {
        name: lib.name,
        version: lib.version,
        scriptId: script.id,
      };
      await prisma.library.upsert({
        where: {
          name: lib.name,
        },
        create: libData,
        update: libData,
      });
    });

    const pathToDir = join(scriptData.path, scriptData.name);
    const indexPath = join(pathToDir, "index.ts");
    const pkg = join(pathToDir, "package.json");
    if (!(await fs.pathExists(pathToDir))) await fs.mkdir(pathToDir);
    if (!(await fs.pathExists(indexPath)))
      await fs.writeFile(indexPath, "");
    if (!(await fs.pathExists(pkg))) {
      await fs.writeJSON(pkg, {
        name: scriptData.name,
        version: "1.0.0",
        description: "",
        dependencies: libs.reduce((acc, lib) => {
          acc[lib.name] = lib.version;
          return acc;
        }, {} as Record<string, string>),
      }, {
        spaces: 2,
      });
    }
  },
};

export default schema;
