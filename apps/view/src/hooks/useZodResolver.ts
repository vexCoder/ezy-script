import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

export const useZodResolver = <T extends z.ZodType<any, any>>(
  schema: T,
  mapError?: (
    errors: z.ZodIssueOptionalMessage,
    path?: string
  ) => string | undefined | void
) => {
  const mapZodError = (errors: z.ZodIssueOptionalMessage) => {
    // combine path, path is an array with number and string
    const path = errors.path?.reduce((acc: string, cur) => {
      if (!acc.length) return String(cur);
      if (typeof cur === "number") {
        return `${acc}[${cur}]`;
      }
      return `${acc}.${cur}`;
    }, "") as string;

    const message =
      mapError?.(errors, path) || errors.message || "Internal error";
    return { message };
  };

  const resolver = zodResolver(schema, {
    ...(mapError && {
      errorMap: mapZodError,
    }),
  });

  return resolver;
};
