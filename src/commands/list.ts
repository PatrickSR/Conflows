import { CentralManager } from '../core/central-manager.js';
import { logger } from '../utils/logger.js';

/** List workflows command */
export async function listCommand(): Promise<void> {
  try {
    const centralManager = new CentralManager();

    // Check if central directory is initialized
    if (!await centralManager.isInitialized()) {
      logger.error('❌ Central directory not initialized');
      logger.info('Please run: conflows init');
      process.exit(1);
    }

    const workflows = await centralManager.scanWorkflows();

    if (workflows.length === 0) {
      logger.info('\nNo workflow files found\n');
      logger.info(`Please create .md files in ${centralManager.getWorkflowsPath()}`);
      return;
    }

    logger.info(`\nWorkflows (${workflows.length} files):\n`);

    workflows.forEach(w => {
      const date = w.mtime.toLocaleString('en-US');
      logger.info(`  ${w.name} (${w.size} bytes, ${date})`);
    });

    logger.info('');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`\n❌ Error: ${error.message}\n`);
    } else {
      logger.error('\n❌ Unknown error\n');
    }
    process.exit(1);
  }
}
