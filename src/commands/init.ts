import { CentralManager } from '../core/central-manager.js';
import { logger } from '../utils/logger.js';

/** 初始化中心目录命令 */
export async function initCommand(): Promise<void> {
  try {
    const manager = new CentralManager();
    
    // 检查是否已初始化
    if (await manager.isInitialized()) {
      logger.warn(`中心目录已存在: ${manager.getCentralPath()}`);
      logger.info('如需重新初始化，请先删除该目录');
      return;
    }

    logger.info('初始化中心目录...\n');

    await manager.init();

    logger.success('✅ 初始化完成!\n');
    logger.info(`Workflows 目录: ${manager.getWorkflowsPath()}`);
    logger.info('');
    logger.info('接下来:');
    logger.info(`  1. 在 ${manager.getWorkflowsPath()} 中创建 .md 文件`);
    logger.info('  2. cd 到项目目录');
    logger.info('  3. 运行 sync-workflow sync');
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
