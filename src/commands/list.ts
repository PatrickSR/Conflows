import { Scanner } from '../core/scanner.js';
import { logger } from '../utils/logger.js';

/**
 * list 命令：列出所有工作流
 * 
 * 显示当前项目中 Cursor 和 Windsurf 的所有工作流文件
 */
export async function listCommand(): Promise<void> {
  const scanner = new Scanner();
  
  logger.info('\n工作流列表:\n');
  
  const allFiles = await scanner.scanAll();
  
  for (const [ideName, files] of allFiles) {
    if (files.length > 0) {
      logger.success(`${ideName} (${files.length}):`);
      files.forEach(f => {
        logger.info(`  - ${f.name.replace('.md', '')}`);
      });
      logger.log('');
    }
  }
  
  const totalCount = Array.from(allFiles.values()).reduce((sum, files) => sum + files.length, 0);
  
  if (totalCount === 0) {
    logger.warn('未找到任何工作流文件\n');
  }
}
