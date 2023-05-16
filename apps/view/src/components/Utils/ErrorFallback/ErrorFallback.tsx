export type ErrorFallbackProps = {
  error: Error;
};

export const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  return <div>{error.message}</div>;
};
