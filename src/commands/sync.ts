import { ConfigManager } from '../core/config-manager.js';
import { Distributor } from '../core/distributor.js';
import { logger } from '../utils/logger.js';
import type { SyncOptions } from '../types/index.js';

/** 同步工作流命令 - 从中心目录下发到项目 */
export async function syncCommand(
  projectDir: string | undefined,
  options: SyncOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const distributor = new Distributor();
    const centralManager = configManager.getCentralManager();

    // 检查中心目录是否已初始化
    if (!await centralManager.isInitialized()) {
      logger.error('❌ 中心目录未初始化');
      logger.info('请先运行: sync-workflow init');
      process.exit(1);
    }

    // 如果指定了 --all，同步所有已配置的项目
    if (options.all) {
      await syncAllProjects(configManager, distributor, options);
      return;
    }

    // 必须指定项目目录
    if (!projectDir) {
      logger.error('❌ 请指定项目目录');
      logger.info('用法: sync-workflow sync <project-dir>');
      logger.info('或者: sync-workflow sync --all');
      process.exit(1);
    }

    // 解析配置
    const resolvedConfig = await configManager.resolveConfig(projectDir, options);

    // 检查是否有配置
    if (resolvedConfig.tags.length === 0 && resolvedConfig.include.length === 0) {
      logger.error('❌ 未指定 tags 或 include');
      logger.info('用法: sync-workflow sync <project-dir> --tags <tags>');
      logger.info('示例: sync-workflow sync ~/project --tags common,frontend');
      process.exit(1);
    }

    // 执行同步
    await distributor.distribute(projectDir, resolvedConfig, options.dryRun || false);

    // 如果指定了 --save，保存配置
    if (options.save && !options.dryRun) {
      await configManager.saveProjectConfig(projectDir, {
        tags: resolvedConfig.tags,
        ides: resolvedConfig.ides,
        include: resolvedConfig.include,
        exclude: resolvedConfig.exclude,
      });
      logger.info(`\n💾 配置已保存，下次可以直接运行:`);
      logger.info(`   sync-workflow sync ${projectDir}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`\n❌ 错误: ${error.message}\n`);
    } else {
      logger.error('\n❌ 未知错误\n');
    }
    process.exit(1);
  }
}

/** 同步所有已配置的项目 */
async function syncAllProjects(
  configManager: ConfigManager,
  distributor: Distributor,
  options: SyncOptions
): Promise<void> {
  const projects = await configManager.getProjects();
  const projectPaths = Object.keys(projects.projects);

  if (projectPaths.length === 0) {
    logger.warn('没有已配置的项目');
    logger.info('请先为项目配置 tags:');
    logger.info('  sync-workflow sync <project-dir> --tags <tags> --save');
    return;
  }

  logger.info(`\n找到 ${projectPaths.length} 个已配置的项目\n`);

  for (const projectPath of projectPaths) {
    const config = await configManager.getProjectConfig(projectPath);
    if (!config) continue;

    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`同步: ${projectPath}`);
    logger.info('='.repeat(60));

    const resolvedConfig = await configManager.resolveConfig(projectPath, options);
    await distributor.distribute(projectPath, resolvedConfig, options.dryRun || false);
  }

  logger.success(`\n✅ 全部完成! 已同步 ${projectPaths.length} 个项目`);
}
