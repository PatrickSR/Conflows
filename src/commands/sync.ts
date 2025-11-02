import { CentralManager } from '../core/central-manager.js';
import { Distributor } from '../core/distributor.js';
import { logger } from '../utils/logger.js';
import type { SyncOptions, ResolvedConfig } from '../types/index.js';

/** 同步工作流命令 - 从中心目录下发到当前项目 */
export async function syncCommand(options: SyncOptions): Promise<void> {
  try {
    const centralManager = new CentralManager();
    const distributor = new Distributor();

    // 检查中心目录是否已初始化
    if (!await centralManager.isInitialized()) {
      logger.error('❌ 中心目录未初始化');
      logger.info('请先运行: sync-workflow init');
      process.exit(1);
    }

    // 使用当前目录
    const projectDir = process.cwd();
    const config = await centralManager.getConfig();

    // 解析 workflows
    let workflows: string[];

    if (options.tags && options.tags.length > 0) {
      // 指定了 tags，根据 tags 解析
      workflows = centralManager.resolveWorkflowsByTags(config, options.tags);
      
      if (workflows.length === 0) {
        logger.warn(`⚠️  指定的 tags 没有对应的 workflows`);
        logger.info('提示: 检查 ~/.sync-workflow/config.json 中的 tags 配置');
        return;
      }
    } else {
      // 未指定 tags，全量同步
      const allWorkflows = await centralManager.scanWorkflows();
      workflows = allWorkflows.map(w => w.name);
      
      if (workflows.length === 0) {
        logger.warn('⚠️  中心目录没有 workflow 文件');
        logger.info(`请在 ${centralManager.getWorkflowsPath()} 中创建 .md 文件`);
        return;
      }
    }

    // 处理 include
    if (options.include && options.include.length > 0) {
      workflows.push(...options.include);
    }

    // 处理 exclude
    if (options.exclude && options.exclude.length > 0) {
      workflows = workflows.filter(w => !options.exclude?.includes(w));
    }

    // 去重
    workflows = [...new Set(workflows)];

    if (workflows.length === 0) {
      logger.warn('没有需要同步的 workflow');
      return;
    }

    // 构建最终配置
    const resolvedConfig: ResolvedConfig = {
      tags: options.tags || [],
      ides: options.ides || config.defaultIDEs,
      workflows,
      include: options.include || [],
      exclude: options.exclude || [],
    };

    // 执行同步
    await distributor.distribute(projectDir, resolvedConfig, options.dryRun || false);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`\n❌ 错误: ${error.message}\n`);
    } else {
      logger.error('\n❌ 未知错误\n');
    }
    process.exit(1);
  }
}
