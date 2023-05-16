import { basename, join } from "path";
import fs from "fs-extra";
import { range } from "remeda";
import { faker } from "@faker-js/faker";
import { SeedSchema } from "../prisma/types";
import { PrismaClient, Prisma } from "../dist/generated";
import _ from "lodash";
import pMap from "p-map";
import { deepMap, interopImport, pathToSeeds } from "./utils";
import { Params, SeedFn } from "./types";

const runSeed = async ({ name, renew, reset }: Params) => {
  const prisma = new PrismaClient();
  let functions: SeedFn[] = [];
  if (!name) {
    const files = await fs.readdir(pathToSeeds);

    for (const file of files) {
      const path = join(pathToSeeds, file, "seed.ts");
      const generated = join(pathToSeeds, file, "generated.json");

      const schema = (await interopImport(path)) as SeedSchema<any>;

      const renewSeed =
        renew?.split(",").some((v) => v === basename(file)) || renew === "*";
      const resetSeed =
        reset?.split(",").some((v) => v === basename(file)) || reset === "*";

      functions.push({
        ...schema,
        path,
        saved: generated,
        reset: resetSeed,
        renew: renewSeed,
      });
    }
  } else {
    const path = join(pathToSeeds, name, `seed.ts`);
    const generated = join(pathToSeeds, name, "generated.json");
    const schema = (await interopImport(path)) as SeedSchema<any>;
    const renewSeed =
      renew?.split(",").some((v) => v === name) || renew === "*";
    const resetSeed =
      reset?.split(",").some((v) => v === name) || reset === "*";

    functions.push({
      ...schema,
      path,
      saved: generated,
      reset: resetSeed,
      renew: renewSeed,
    });
  }

  prisma.$connect();
  await Promise.all(
    functions.map(async (schema) => {
      console.log(`Running seed file at ${schema.path}`);

      const generated =
        (await fs.readJSON(schema.saved).catch(() => ({}))) ?? [];

      if (schema.env === "dev" && process.env.NODE_ENV !== "development") {
        return;
      }

      if (schema.env === "prod" && process.env.NODE_ENV !== "production") {
        return;
      }

      if (schema.custom) {
        return await schema.custom(prisma);
      }

      if (schema.renew && !generated.length) {
        return;
      }

      if (schema.seed) {
        if (schema.reset || !generated.length || !generated) {
          const count = schema.count ?? 0;

          if (generated.length) {
            const ids = generated.map((v: any) => (v as any).id);
            await prisma.$executeRaw(
              Prisma.sql([
                `DELETE FROM \"${_.capitalize(
                  schema.model
                )}\" WHERE id IN (${ids.join(",")})`,
              ])
            );
          }

          const res = await pMap(range(0, count + 1), async () => {
            const data = deepMap(schema.seed, (v: any) => {
              return typeof v === "function" ? v(faker) : v;
            }) as {};

            const result = await (
              prisma[schema.model as keyof typeof prisma] as any
            ).create({
              data,
            });

            console.log(`Generated ${result.id} from ${schema.model}`)

            return result;
          });
          await fs.writeJSON(schema.saved, res);
          return;
        }

        if (schema.renew && generated.length) {
          const res = await pMap(generated, async (v) => {
            const data = deepMap(schema.seed, (v: any) => {
              return typeof v === "function" ? v(faker) : v;
            }) as {};

            const result = await (
              prisma[schema.model as keyof typeof prisma] as any
            ).upsert({
              where: { id: (v as any).id },
              update: data,
              create: data,
            });
            
            console.log(`Renewed ID ${result.id} from ${schema.model}`)

            return result;
          });

          await fs.writeJSON(schema.saved, res, {
            encoding: "utf8",
            spaces: 2,
          });
          return;
        }
      }
    })
  );

  prisma.$disconnect();
};

export default runSeed