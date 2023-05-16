import { join } from "path";
import fs from "fs-extra";
import { pipe, sort, map, last } from "remeda";
import _ from "lodash";
import { Params } from "./types";
import { pathToSeeds, template } from "./utils";

const createSeed = async ({ name }: Params) => {
  if (!name) {
    throw new Error("Missing name");
  }

  const order = pipe(
    await fs.readdir(pathToSeeds),
    map((file) => {
      const [order] = file.split("_");
      return parseInt(order, 10);
    }),
    sort((a, b) => a - b),
    (v) => last(v),
    (v) => (v ? v + 1 : 1)
  );

  const fullName = `${order}_${name}`;

  const path = join(pathToSeeds, fullName, `seed.ts`);

  console.log(`Creating seed file at ${path}`);

  await fs.ensureDir(join(pathToSeeds, fullName));
  await fs.writeFile(path, template);
};

export default createSeed;