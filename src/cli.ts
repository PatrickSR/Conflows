#!/usr/bin/env node

import { Command } from 'commander';
import { detectCommand } from './commands/detect.js';
import { syncCommand } from './commands/sync.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('sync-workflow')
  .description('同步 Cursor 和 Windsurf 工作流')
  .version('0.0.1');

// detect 命令
program
  .command('detect')
  .description('检测项目中的工作流配置')
  .action(detectCommand);

// sync 命令
program
  .command('sync')
  .description('同步工作流')
  .option('--from <ide>', '源 IDE (cursor|windsurf)')
  .option('--to <ide>', '目标 IDE (cursor|windsurf)')
  .option('--both', '双向同步')
  .option('--force', '强制覆盖，不提示冲突')
  .action(syncCommand);

// list 命令
program
  .command('list')
  .description('列出所有工作流')
  .action(listCommand);

program.parse();
