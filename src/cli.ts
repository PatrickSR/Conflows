#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('conflows')
  .description('Centralized IDE workflow manager')
  .version('0.0.6');

// init command
program
  .command('init')
  .description('Initialize central directory')
  .action(initCommand);

// sync command - distribute from central directory to current project
program
  .command('sync')
  .description('Distribute workflows from central directory to current project')
  .option('--ides <ides>', 'Specify IDEs (comma-separated, default: cursor,windsurf)', (value) => value.split(','))
  .option('--include <files>', 'Additional files to include (comma-separated)', (value) => value.split(','))
  .option('--exclude <files>', 'Files to exclude (comma-separated)', (value) => value.split(','))
  .option('--auto-detect', 'Auto-detect installed IDEs (enabled by default when --ides not specified)', true)
  .option('--dry-run', 'Preview without writing')
  .action((options) => syncCommand(options));

// list command
program
  .command('list')
  .description('List all workflows in central directory')
  .action(() => listCommand());

program.parse();
