import { join } from "path";

export const template = `
    import { PrismaClient } from '../../../dist/generated';
    import { SeedSchema } from '../../types';
    const schema: SeedSchema<T> = {
        env: 'dev',
        seed: {},
        async custom (prisma: PrismaClient) {}
    }
    export default schema;
`;

export const pathToSeeds = join(__dirname, "..", "prisma", "seeds");

type DeepMap<T, V> = T extends undefined
  ? undefined
  : T extends object
  ? { [K in keyof T]: DeepMap<T[K], V> }
  : V;

export const deepMap = <T, V>(obj: T, fn: (v: any) => V): DeepMap<T, V> => {
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as {}).map(([key, value]) => [key, deepMap(value, fn)])
    ) as DeepMap<T, V>;
  }
  return fn(obj) as any;
};

export const interopImport = async (path: string) => {
  const fn = await import(path);
  if (fn.__esModule) {
    return fn.default;
  }
  return fn;
};
