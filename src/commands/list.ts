import { CentralManager } from '../core/central-manager.js';
import { logger } from '../utils/logger.js';

/** List workflows command */
export async function listCommand(): Promise<void> {
  try {
    const centralManager = new CentralManager();

    // Check if central directory is initialized
    if (!await centralManager.isInitialized()) {
      logger.error('❌ 中心目录未初始化');
      logger.info('请先运行: conflow init');
      process.exit(1);
    }

    const workflows = await centralManager.scanWorkflows();

    if (workflows.length === 0) {
      logger.info('\n暂无 workflow 文件\n');
      logger.info(`请在 ${centralManager.getWorkflowsPath()} 中创建 .md 文件`);
      return;
    }

    logger.info(`\nWorkflows (${workflows.length} 个):\n`);

    workflows.forEach(w => {
      const date = w.mtime.toLocaleDateString('zh-CN');
      logger.info(`  ${w.name} (${w.size} bytes, ${date})`);
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
