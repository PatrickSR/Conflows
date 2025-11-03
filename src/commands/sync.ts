import { CentralManager } from '../core/central-manager.js';
import { Distributor } from '../core/distributor.js';
import { logger } from '../utils/logger.js';
import type { SyncOptions, ResolvedConfig } from '../types/index.js';

/** Default IDE list */
const DEFAULT_IDES = ['cursor', 'windsurf'];

/** Sync workflow command - distribute from central directory to current project */
export async function syncCommand(options: SyncOptions): Promise<void> {
  try {
    const centralManager = new CentralManager();
    const distributor = new Distributor();

    // Check if central directory is initialized
    if (!await centralManager.isInitialized()) {
      logger.error('❌ 中心目录未初始化');
      logger.info('请先运行: conflow init');
      process.exit(1);
    }

    // Use current directory
    const projectDir = process.cwd();

    // Scan all workflows (full)
    const allWorkflows = await centralManager.scanWorkflows();
    let workflows = allWorkflows.map(w => w.name);
    
    if (workflows.length === 0) {
      logger.warn('⚠️  中心目录没有 workflow 文件');
      logger.info(`请在 ${centralManager.getWorkflowsPath()} 中创建 .md 文件`);
      return;
    }

    // Handle include
    if (options.include && options.include.length > 0) {
      workflows.push(...options.include);
    }

    // Handle exclude
    if (options.exclude && options.exclude.length > 0) {
      workflows = workflows.filter(w => !options.exclude?.includes(w));
    }

    // Deduplicate
    workflows = [...new Set(workflows)];

    if (workflows.length === 0) {
      logger.warn('没有需要同步的 workflow');
      return;
    }

    // Build final config (using hardcoded defaults)
    const resolvedConfig: ResolvedConfig = {
      ides: options.ides || DEFAULT_IDES,
      workflows,
      include: options.include || [],
      exclude: options.exclude || [],
    };

    // Execute sync
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
