import { memo, lazy as ReactLazy } from "react";
import comparator from "fast-deep-equal/react";
import clsx from "clsx";

export const lazyDefault = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): T => {
  return ReactLazy(() => factory()) as unknown as T;
};

export const mergeClassNames = <K extends string = string>(
  ...classNames: (Partial<Record<K, string>> | undefined | null)[]
) => {
  const merged = classNames.reduce((acc, cur) => {
    if (!cur) return acc || {};
    const obj = {} as Record<K, string>;
    const keys = Object.keys(cur) as (keyof Record<K, string>)[];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as K;
      const prev = acc?.[key] as Record<K, string> | null | undefined;
      const next = cur[key] as string;
      if (prev) obj[key] = clsx(prev, next);
      else obj[key] = next as string;
    }

    return { ...(acc || {}), ...obj };
  }, {} as Record<K, string>) as Record<K, string>;

  return merged;
};

type MemoizedComponent<T extends {}> = (p: T) => JSX.Element;

export const fastMemo = <T extends {}>(fn: MemoizedComponent<T>) => {
  return memo(fn, comparator);
};

export const optionize = <T extends string | object, L = string, V = T>(
  obj: T[] | readonly T[],
  mapper?: (o: T) => { label: L; value: V }
) => {
  return obj.map((o) => {
    if (mapper) return mapper(o);
    return { label: o as string, value: o };
  }) as { label: L; value: V }[];
};
