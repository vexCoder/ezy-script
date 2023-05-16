import { PrismaClient } from "../dist/generated";
import { Faker } from "@faker-js/faker";

type DeepMap<T, V> =
  T extends undefined ? undefined :
  T extends object ? { [K in keyof T]: DeepMap<T[K], V> } :
  V;

export type SeedSchema<T extends {}> = {
  model: string;
  env: "dev" | "prod" | "both";
  count?: number;
  seed?: Partial<DeepMap<T, (faker: Faker) => any>>;
  custom?: (prisma: PrismaClient) => Promise<void>;
};
