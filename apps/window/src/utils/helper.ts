import fs from "fs-extra";
import pMap from "p-map";
import { join } from "path";

export const getDirSize = async (dirPath: string) => {
  let size = 0;
  const files = await fs.readdir(dirPath);

  const sizes = await pMap(files, async (file) => {
    const filePath = join(dirPath, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      return stats.size;
    }
    if (stats.isDirectory()) {
      return getDirSize(filePath);
    }

    return 0;
  });

  size = sizes.reduce((acc, curr) => acc + curr, 0);

  return size;
};

export function extractMatches(regex: RegExp, value: string): RegExpExecArray[];
export function extractMatches<T>(
  regex: RegExp,
  value: string,
  mapper: (ext: RegExpExecArray) => T
): T[];
export function extractMatches<T>(
  regex: RegExp,
  value: string,
  mapper?: (ext: RegExpExecArray) => T
): (T | RegExpExecArray)[] {
  const matches: RegExpExecArray[] = [];

  let extracted: RegExpExecArray | undefined | null;
  do {
    extracted = regex.exec(value);
    if (extracted) matches.push(extracted);
  } while (extracted);

  return mapper ? matches.map(mapper) : matches;
}
