import dotenv from "dotenv";
import esbuild from "esbuild";
import { join } from "path";
import fs from "fs-extra";
import electron from "./electron";

dotenv.config({
  path: join(__dirname, ".env"),
});

const defaults: esbuild.BuildOptions = {
  bundle: true,
  platform: "node",
  format: "cjs",
};

const makeEsbuild = async (
  entries: string[],
  outdir: string,
  override: esbuild.BuildOptions = {}
) => {
  await esbuild.build({
    ...defaults,
    ...(override ?? {}),
    entryPoints: entries,
    outdir,
    tsconfig: join(__dirname, "..", "tsconfig.json"),
  });
};

const build = async () => {
  const args = process.argv.slice(1);
  const isDev = args.includes("--dev") || args.includes("-D");
  const pathToBuild = join(__dirname, "..", "dist");
  const pathToRoot = join(__dirname, "..", "..", "..");
  const pathToGenerated = join(
    pathToRoot,
    "apps",
    "database",
    "dist",
    "generated"
  );

  const pathToPrisma = join(pathToGenerated, "schema.prisma");

  await fs.copyFile(pathToPrisma, join(pathToBuild, "schema.prisma"));
  const plugins: esbuild.Plugin[] = [];
  if (isDev) {
    plugins.push(
      electron({
        dir: pathToBuild,
        dev: true,
        async onRestart() {
          console.log("Copying Prisma schema to dist", pathToPrisma);
          await fs.copyFile(pathToPrisma, join(pathToBuild, "schema.prisma"));
        },
      })
    );
  }

  console.log(pathToBuild);

  await makeEsbuild(["src/index.ts", "preload/preload.ts"], pathToBuild, {
    watch: isDev,
    plugins,
    external: ["electron", "argon2"],
    entryNames: `[name]`,
    sourcemap: isDev ? "linked" : "external",
    sourceRoot: "src",
    define: {
      "process.env.NODE_ENV": isDev ? `"development"` : `"production"`,
      "process.env.DATABASE_URL": `"${process.env.DATABASE_URL}"`,
    },
  });
};

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
