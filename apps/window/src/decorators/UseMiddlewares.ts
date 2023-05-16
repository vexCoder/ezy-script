/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
export type MiddlewareContext = {
  middleware?: string;
  name: string;
};

export type Middleware = (
  ctx: MiddlewareContext,
  next: () => void | Promise<void>
) => any;

export const UseMiddlewares =
  (...middlewares: Middleware[]) =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (descriptor === undefined) {
      // @ts-ignore
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }

    const originalMethod = descriptor.value;

    const ctx: MiddlewareContext = {
      name: key,
    };

    const clones = [...middlewares].reverse();

    // @ts-ignore
    descriptor.value = function (...args: any[]) {
      // eslint-disable-next-line no-return-assign
      let next = originalMethod;
      // eslint-disable-next-line no-restricted-syntax
      for (const middleware of clones) {
        ctx.middleware = middleware.name;
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        next = () => middleware(ctx, next);
      }

      return next;
    };

    console.log(descriptor.value, descriptor.value.length);

    return descriptor;
  };

// const middlewares = _.cloneDeep(Handler.handlerMiddlewares).reverse();

// let transformedFn: HandlerCallback<Handles[Namespace][Key], "invoke"> =
//   handler;

// // eslint-disable-next-line no-restricted-syntax
// for (const middleware of middlewares) {
//   const next: HandlerCallback<Handles[Namespace][Key], "invoke"> =
//     transformedFn;

//   transformedFn = (async (evt, ...args) => {
//     let res: any | undefined;
//     const opts = {
//       key: handlerKey,
//       args,
//     };

//     await middleware(opts, async () => {
//       res = await next(evt, ...args);
//     });

//     return res;
//   }) as HandlerCallback<Handles[Namespace][Key], "invoke">;
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// ipcMain.handle(handlerKey, transformedFn);
