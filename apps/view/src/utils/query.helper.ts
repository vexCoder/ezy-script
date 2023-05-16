import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  QueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient({});

export default queryClient;

type ExposedAPIFunction = (args: any) => Promise<any> | any;

type InferPromise<T> = T extends Promise<infer U> ? U : T;

type Data<T extends ExposedAPIFunction> = InferPromise<ReturnType<T>> | null;

const transformError = (err: any) => {
  if (err instanceof Error) {
    const regex = /Error invoking remote method .*: (?<error>.*)/g;
    const match = regex.exec(err.message);
    return match?.groups?.error || err.message;
  }
  return err;
};

export interface CustomHookOpts<T extends any[]> {
  variables?: T[0];
}

type Options<T extends ExposedAPIFunction, E> = UseQueryOptions<Data<T>, E> &
  CustomHookOpts<Parameters<T>>;

export const createQuery = <T extends ExposedAPIFunction>(
  ctx: T,
  defaultOpts: Options<T, Error>
) => {
  return (opts: Options<T, Error> = {}) => {
    const res = useQuery<Data<T>, Error>({
      ...defaultOpts,
      ...opts,
      queryFn: () => {
        return ctx(opts.variables);
      },
    });

    let error = null;
    if (res.error) {
      error = new Error(transformError(res.error));
    }

    return { ...res, error };
  };
};

type InfiniteOptions<T extends ExposedAPIFunction, E> = UseInfiniteQueryOptions<
  Data<T>,
  E
> &
  CustomHookOpts<Parameters<T>>;

export const createInfiniteQuery = <T extends ExposedAPIFunction>(
  ctx: T,
  defaultOpts: InfiniteOptions<T, Error>
) => {
  return (opts: InfiniteOptions<T, Error> = {}) => {
    const res = useInfiniteQuery<Data<T>, Error>({
      ...defaultOpts,
      ...opts,
      queryFn: ({ pageParam }) => {
        return ctx({
          ...opts.variables,
          page: pageParam || opts.variables?.page || 0,
        });
      },
      getNextPageParam: (lastPage) => {
        if (lastPage?.nextPage) {
          return lastPage.nextPage;
        }
        return undefined;
      },
    });

    let error = null;
    if (res.error) {
      error = new Error(transformError(res.error));
    }

    return { ...res, error };
  };
};

type MOptions<T extends ExposedAPIFunction, E, V> = UseMutationOptions<
  Data<T>,
  E,
  V
> &
  CustomHookOpts<Parameters<T>>;

export const createMutation = <T extends ExposedAPIFunction>(
  ctx: T,
  defaultOpts: MOptions<T, Error, Parameters<T>>
) => {
  return (opts: MOptions<T, Error, Parameters<T>> = {}) => {
    const res = useMutation<Data<T>, Error, Parameters<T>[0]>({
      ...defaultOpts,
      ...opts,
      onError(error, variables, context) {
        const handler = opts.onError || defaultOpts.onError;
        if (handler) {
          handler(new Error(transformError(error)), variables, context);
        }
      },
      mutationFn: ctx,
    });

    let error = null;
    if (res.error) {
      error = new Error(transformError(res.error));
    }

    return { ...res, error };
  };
};
