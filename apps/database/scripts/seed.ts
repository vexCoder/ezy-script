import { chunk } from "remeda";
import createSeed from "./createSeed";
import runSeed from "./runSeed";
import { Params } from "./types";

const main = async () => {
  const method = process.argv[2] as "create" | "run";
  const args = chunk(process.argv.slice(3), 2);
  const name = args.find((v) => v[0] === "--name");
  const renew = args.find((v) => v[0] === "--renew");
  const reset = args.find((v) => v[0] === "--reset");

  const params: Params = {
    name: name?.[1],
    renew: renew ? renew?.[1] || "*" : undefined,
    reset: reset ? reset?.[1] || "*" : undefined,
  };

  if (params.renew && params.reset) {
    throw new Error("Cannot use --renew and --reset at the same time");
  }

  const methods = {
    create: createSeed,
    run: runSeed,
  };

  if (methods[method]) {
    await methods[method](params);
  } else {
    throw new Error(`Invalid command: ${method}`);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
