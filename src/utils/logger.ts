import chalk from 'chalk';

/** Colored logger utility */
export const logger = {
  success: (msg: string) => console.log(chalk.green(msg)),
  error: (msg: string) => console.log(chalk.red(msg)),
  warn: (msg: string) => console.log(chalk.yellow(msg)),
  info: (msg: string) => console.log(chalk.blue(msg)),
  log: (msg: string) => console.log(msg),
};
