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
