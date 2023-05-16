import { SeedSchema } from "../prisma/types";

export type Params = {
  name?: string;
  renew?: string;
  reset?: string;
};

export type SeedFn = SeedSchema<any> & {
  path: string;
  renew: boolean;
  saved: string;
  reset: boolean;
};
