import { Scanner } from '../core/scanner.js';
import { logger } from '../utils/logger.js';

/** 检测项目工作流配置 */
export async function detectCommand(): Promise<void> {
  const scanner = new Scanner();
  
  logger.info('\n检测项目工作流配置...\n');
  
  const allFiles = await scanner.scanAll();
  
  let hasAny = false;
  
  for (const [ideName, files] of allFiles) {
    if (files.length > 0) {
      hasAny = true;
      logger.success(`✓ ${ideName} (${files.length} 个工作流)`);
      files.forEach(f => {
        logger.info(`  - ${f.name}`);
      });
    } else {
      logger.warn(`✗ ${ideName} (未找到工作流)`);
    }
  }
  
  if (!hasAny) {
    logger.warn('\n⚠️  未检测到任何工作流文件');
    logger.info('\n提示:');
    logger.info('  - Cursor 工作流应放在 .cursor/commands/ 目录');
    logger.info('  - Windsurf 工作流应放在 .windsurf/workflows/ 目录');
  }
  
  logger.log('');
}
