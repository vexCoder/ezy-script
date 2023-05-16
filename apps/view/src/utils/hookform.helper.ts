import { FieldErrors } from "react-hook-form";

export const getError = (
  errors: FieldErrors
): { message?: string; key?: string } => {
  const keys = Object.keys(errors);
  if (keys.length === 0) return {};
  const err = errors[keys[0]]?.message;
  let message: string | undefined = "Internal error";

  if (typeof err === "object") message = err.message as string;
  else message = err;

  return {
    key: keys[0],
    message,
  };
};
