import { Syncer } from '../core/syncer.js';
import { logger } from '../utils/logger.js';
import type { SyncOptions } from '../types/index.js';

/**
 * sync 命令：同步工作流
 * 
 * 执行工作流文件的同步操作
 * 
 * @param options 同步选项（from, to, both, force）
 */
export async function syncCommand(options: SyncOptions): Promise<void> {
  try {
    const syncer = new Syncer();
    await syncer.sync(options);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`\n❌ 错误: ${error.message}\n`);
    } else {
      logger.error('\n❌ 未知错误\n');
    }
    process.exit(1);
  }
}
