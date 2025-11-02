import { CentralManager } from '../core/central-manager.js';
import { logger } from '../utils/logger.js';

/** 列出工作流命令 */
export async function listCommand(options?: {
  tag?: string;
}): Promise<void> {
  try {
    const centralManager = new CentralManager();

    // 检查中心目录是否已初始化
    if (!await centralManager.isInitialized()) {
      logger.error('❌ 中心目录未初始化');
      logger.info('请先运行: sync-workflow init');
      process.exit(1);
    }

    const workflows = await centralManager.scanWorkflows();
    const config = await centralManager.getConfig();

    if (workflows.length === 0) {
      logger.info('\n暂无 workflow 文件\n');
      logger.info(`请在 ${centralManager.getWorkflowsPath()} 中创建 .md 文件`);
      return;
    }

    // 如果指定了 tag，只显示该 tag 的 workflows
    if (options?.tag) {
      const tagConfig = config.tags[options.tag];
      if (!tagConfig) {
        logger.warn(`\nTag '${options.tag}' 不存在\n`);
        return;
      }

      logger.info(`\nTag: ${options.tag}`);
      logger.info(`描述: ${tagConfig.description}`);
      logger.info(`Workflows (${tagConfig.workflows.length} 个):\n`);

      tagConfig.workflows.forEach(w => {
        const workflow = workflows.find(wf => wf.name === w);
        if (workflow) {
          logger.info(`  ${w} (${workflow.size} bytes)`);
        } else {
          logger.info(`  ${w} (文件不存在)`);
        }
      });

      logger.info('');
      return;
    }

    // 默认显示所有 workflows
    logger.info(`\n中心目录 workflows (${workflows.length} 个):\n`);

    workflows.forEach(w => {
      logger.info(`  ${w.name} (${w.size} bytes)`);
      
      // 显示该 workflow 属于哪些 tags
      const belongsTo: string[] = [];
      for (const [tagName, tagConfig] of Object.entries(config.tags)) {
        if (tagConfig.workflows.includes(w.name)) {
          belongsTo.push(tagName);
        }
      }
      
      if (belongsTo.length > 0) {
        logger.info(`    Tags: ${belongsTo.join(', ')}`);
      }
    });

    logger.info('');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`\n❌ 错误: ${error.message}\n`);
    } else {
      logger.error('\n❌ 未知错误\n');
    }
    process.exit(1);
  }
}
