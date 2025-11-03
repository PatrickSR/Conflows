import { CentralManager } from '../core/central-manager.js';
import { Distributor } from '../core/distributor.js';
import { logger } from '../utils/logger.js';
import { IDEDetector } from '../utils/ide-detector.js';
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
      logger.error('❌ Central directory not initialized');
      logger.info('Please run: conflows init');
      process.exit(1);
    }

    // Use current directory
    const projectDir = process.cwd();

    // Scan all workflows (full)
    const allWorkflows = await centralManager.scanWorkflows();
    let workflows = allWorkflows.map(w => w.name);
    
    if (workflows.length === 0) {
      logger.warn('⚠️  No workflow files in central directory');
      logger.info(`Please create .md files in ${centralManager.getWorkflowsPath()}`);
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
      logger.warn('No workflows to sync');
      return;
    }

    // Determine target IDEs
    let targetIDEs: string[] = options.ides || DEFAULT_IDES;

    // Auto-detect installed IDEs if not explicitly specified
    if (!options.ides) {
      const detection = IDEDetector.getDetectionSummary(DEFAULT_IDES);
      targetIDEs = detection.installed;

      // Show detection results
      if (targetIDEs.length > 0) {
        logger.info(`🔍 Auto-detected IDEs: ${targetIDEs.join(', ')}`);
      }
      if (detection.skipped.length > 0) {
        logger.info(`⚠️  Not detected: ${detection.skipped.join(', ')} (skipped)`);
      }

      if (targetIDEs.length === 0) {
        logger.warn('⚠️  No supported IDEs detected on this system');
        logger.info('Please install Cursor or Windsurf, or use --ides to specify target IDEs');
        return;
      }
    }

    // Build final config
    const resolvedConfig: ResolvedConfig = {
      ides: targetIDEs,
      workflows,
      include: options.include || [],
      exclude: options.exclude || [],
    };

    // Execute sync
    await distributor.distribute(projectDir, resolvedConfig, options.dryRun || false);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`\n❌ Error: ${error.message}\n`);
    } else {
      logger.error('\n❌ Unknown error\n');
    }
    process.exit(1);
  }
}
