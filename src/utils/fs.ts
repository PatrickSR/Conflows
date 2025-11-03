import fse from 'fs-extra';

/** Filesystem utility */
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
