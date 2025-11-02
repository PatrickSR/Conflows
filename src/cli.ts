#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { projectsCommand } from './commands/projects.js';
import { listCommand } from './commands/list.js';
import { tagsCommand } from './commands/tags.js';

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

// sync 命令 - 从中心目录下发到项目
program
  .command('sync [project-dir]')
  .description('从中心目录下发 workflow 到项目')
  .option('--tags <tags>', '指定 tags（逗号分隔）', (value) => value.split(','))
  .option('--ides <ides>', '指定 IDE（逗号分隔）', (value) => value.split(','))
  .option('--include <files>', '额外包含的文件（逗号分隔）', (value) => value.split(','))
  .option('--exclude <files>', '排除的文件（逗号分隔）', (value) => value.split(','))
  .option('--save', '保存配置到 projects.json')
  .option('--dry-run', '预览但不实际写入')
  .option('--force', '强制覆盖，不提示冲突')
  .option('--all', '同步所有已配置的项目')
  .action((projectDir, options) => syncCommand(projectDir, options));

// projects 命令组
const projectsCmd = program
  .command('projects')
  .description('管理项目配置');

projectsCmd
  .command('list')
  .description('列出所有已配置的项目')
  .action(() => projectsCommand('list'));

projectsCmd
  .command('show <project-dir>')
  .description('查看项目配置')
  .action((projectDir) => projectsCommand('show', projectDir));

projectsCmd
  .command('set <project-dir>')
  .description('设置项目配置')
  .option('--tags <tags>', '指定 tags（逗号分隔）', (value) => value.split(','))
  .option('--ides <ides>', '指定 IDE（逗号分隔）', (value) => value.split(','))
  .action((projectDir, options) => projectsCommand('set', projectDir, options));

projectsCmd
  .command('remove <project-dir>')
  .description('删除项目配置')
  .action((projectDir) => projectsCommand('remove', projectDir));

// list 命令
program
  .command('list')
  .description('列出中心目录的 workflows')
  .option('--tag <name>', '按 tag 筛选')
  .option('--projects', '显示 workflow 会同步到哪些项目')
  .action((options) => listCommand(options));

// tags 命令组
const tagsCmd = program
  .command('tags')
  .description('管理 tags');

tagsCmd
  .command('list')
  .description('列出所有 tags')
  .action(() => tagsCommand('list'));

tagsCmd
  .command('show <tag-name>')
  .description('查看 tag 详情')
  .action((tagName) => tagsCommand('show', tagName));

program.parse();
