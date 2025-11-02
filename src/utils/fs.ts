import fse from 'fs-extra';

/** 文件系统工具 */
export const fs = {
  exists: fse.pathExists,
  readdir: fse.readdir,
  readFile: fse.readFile,
  writeFile: fse.writeFile,
  stat: fse.stat,
  ensureDir: fse.ensureDir,
  copy: fse.copy,
  remove: fse.remove,
};
