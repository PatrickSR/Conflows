import { ConfigManager } from '../core/config-manager.js';
import { logger } from '../utils/logger.js';

/** Tags 管理命令 */
export async function tagsCommand(
  action: 'list' | 'show',
  tagName?: string
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const centralManager = configManager.getCentralManager();

    // 检查中心目录是否已初始化
    if (!await centralManager.isInitialized()) {
      logger.error('❌ 中心目录未初始化');
      logger.info('请先运行: sync-workflow init');
      process.exit(1);
    }

    const config = await centralManager.getConfig();

    switch (action) {
      case 'list':
        await listTags(centralManager, config);
        break;
      
      case 'show':
        if (!tagName) {
          logger.error('❌ 请指定 tag 名称');
          process.exit(1);
        }
        await showTag(config, tagName);
        break;
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

/** 列出所有 tags */
async function listTags(centralManager: any, config: any): Promise<void> {
  const tagNames = Object.keys(config.tags);

  if (tagNames.length === 0) {
    logger.info('暂无已定义的 tags\n');
    logger.info(`请编辑 ${centralManager.getCentralPath()}/config.json 添加 tags`);
    return;
  }

  logger.info(`\n可用的 tags (${tagNames.length} 个):\n`);

  for (const tagName of tagNames) {
    const tag = config.tags[tagName];
    logger.info(`${tagName} (${tag.workflows.length} 个 workflows)`);
    logger.info(`  描述: ${tag.description}`);
    
    if (tag.workflows.length > 0) {
      logger.info(`  包含: ${tag.workflows.join(', ')}`);
    }
    
    logger.info('');
  }
}

/** 显示单个 tag */
async function showTag(config: any, tagName: string): Promise<void> {
  const tag = config.tags[tagName];

  if (!tag) {
    logger.warn(`Tag '${tagName}' 不存在\n`);
    return;
  }

  logger.info(`\nTag: ${tagName}\n`);
  logger.info(`描述: ${tag.description}`);
  logger.info(`Workflows (${tag.workflows.length} 个):`);
  
  if (tag.workflows.length === 0) {
    logger.info('  (无)');
  } else {
    tag.workflows.forEach((w: string) => {
      logger.info(`  - ${w}`);
    });
  }
  
  logger.info('');
}
