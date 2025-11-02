#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('sync-workflow')
  .description('集中管理和分发 workflow 工具')
  .version('0.0.2');

// init 命令
program
  .command('init')
  .description('初始化中心目录')
  .action(initCommand);

// sync 命令 - 从中心目录下发到当前项目
program
  .command('sync')
  .description('从中心目录下发 workflow 到当前项目')
  .option('--tags <tags>', '指定 tags（逗号分隔），不指定则全量同步', (value) => value.split(','))
  .option('--ides <ides>', '指定 IDE（逗号分隔）', (value) => value.split(','))
  .option('--include <files>', '额外包含的文件（逗号分隔）', (value) => value.split(','))
  .option('--exclude <files>', '排除的文件（逗号分隔）', (value) => value.split(','))
  .option('--dry-run', '预览但不实际写入')
  .action((options) => syncCommand(options));

// list 命令
program
  .command('list')
  .description('列出中心目录的 workflows')
  .option('--tag <name>', '按 tag 筛选')
  .action((options) => listCommand(options));

program.parse();
