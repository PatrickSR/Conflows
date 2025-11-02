import { ConfigManager } from '../core/config-manager.js';
import { logger } from '../utils/logger.js';
import type { ProjectConfig } from '../types/index.js';

/** 项目管理命令 */
export async function projectsCommand(
  action: 'list' | 'show' | 'set' | 'remove',
  projectDir?: string,
  options?: {
    tags?: string[];
    ides?: string[];
  }
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

    switch (action) {
      case 'list':
        await listProjects(configManager);
        break;
      
      case 'show':
        if (!projectDir) {
          logger.error('❌ 请指定项目目录');
          process.exit(1);
        }
        await showProject(configManager, projectDir);
        break;
      
      case 'set':
        if (!projectDir) {
          logger.error('❌ 请指定项目目录');
          process.exit(1);
        }
        await setProject(configManager, projectDir, options);
        break;
      
      case 'remove':
        if (!projectDir) {
          logger.error('❌ 请指定项目目录');
          process.exit(1);
        }
        await removeProject(configManager, projectDir);
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

/** 列出所有项目 */
async function listProjects(configManager: ConfigManager): Promise<void> {
  const projects = await configManager.getProjects();
  const projectPaths = Object.keys(projects.projects);

  if (projectPaths.length === 0) {
    logger.info('暂无已配置的项目\n');
    return;
  }

  logger.info(`\n已配置 ${projectPaths.length} 个项目:\n`);

  for (const projectPath of projectPaths) {
    const config = projects.projects[projectPath];
    if (!config) continue; // 跳过不存在的配置
    
    logger.info(projectPath);
    
    if (config.name) {
      logger.info(`  名称: ${config.name}`);
    }
    
    logger.info(`  Tags: ${config.tags.join(', ')}`);
    
    if (config.ides && config.ides.length > 0) {
      logger.info(`  IDEs: ${config.ides.join(', ')}`);
    }
    
    if (config.include && config.include.length > 0) {
      logger.info(`  额外包含: ${config.include.join(', ')}`);
    }
    
    if (config.exclude && config.exclude.length > 0) {
      logger.info(`  排除: ${config.exclude.join(', ')}`);
    }
    
    if (config.lastSync) {
      const date = new Date(config.lastSync);
      logger.info(`  最后同步: ${date.toLocaleString('zh-CN')}`);
    }
    
    logger.info('');
  }
}

/** 显示单个项目 */
async function showProject(
  configManager: ConfigManager,
  projectDir: string
): Promise<void> {
  const config = await configManager.getProjectConfig(projectDir);

  if (!config) {
    logger.warn('该项目尚未配置\n');
    return;
  }

  // 确保 config 不为 undefined
  const projectConfig = config;

  logger.info(`\n项目: ${projectDir}\n`);
  
  if (projectConfig.name) {
    logger.info(`名称: ${projectConfig.name}`);
  }
  
  logger.info(`Tags: ${projectConfig.tags.join(', ')}`);
  
  if (projectConfig.ides && projectConfig.ides.length > 0) {
    logger.info(`IDEs: ${projectConfig.ides.join(', ')}`);
  }
  
  if (projectConfig.include && projectConfig.include.length > 0) {
    logger.info(`额外包含: ${projectConfig.include.join(', ')}`);
  }
  
  if (projectConfig.exclude && projectConfig.exclude.length > 0) {
    logger.info(`排除: ${projectConfig.exclude.join(', ')}`);
  }
  
  if (projectConfig.lastSync) {
    const date = new Date(projectConfig.lastSync);
    logger.info(`最后同步: ${date.toLocaleString('zh-CN')}`);
  }
  
  logger.info('');
}

/** 设置项目配置 */
async function setProject(
  configManager: ConfigManager,
  projectDir: string,
  options?: {
    tags?: string[];
    ides?: string[];
  }
): Promise<void> {
  if (!options || (!options.tags && !options.ides)) {
    logger.error('❌ 请指定要设置的配置项');
    logger.info('用法: sync-workflow projects set <project-dir> --tags <tags>');
    process.exit(1);
  }

  // 获取现有配置或创建新配置
  const existingConfig = await configManager.getProjectConfig(projectDir);
  const newConfig: ProjectConfig = {
    tags: options.tags || existingConfig?.tags || [],
    ides: options.ides || existingConfig?.ides,
    include: existingConfig?.include,
    exclude: existingConfig?.exclude,
  };

  await configManager.saveProjectConfig(projectDir, newConfig);
  
  logger.success('✅ 配置已更新\n');
  await showProject(configManager, projectDir);
}

/** 删除项目配置 */
async function removeProject(
  configManager: ConfigManager,
  projectDir: string
): Promise<void> {
  const config = await configManager.getProjectConfig(projectDir);

  if (!config) {
    logger.warn('该项目尚未配置\n');
    return;
  }

  await configManager.removeProjectConfig(projectDir);
  logger.success('✅ 项目配置已删除\n');
}
