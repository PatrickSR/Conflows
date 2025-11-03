import { CentralManager } from '../core/central-manager.js';
import { logger } from '../utils/logger.js';

/** Initialize central directory command */
export async function initCommand(): Promise<void> {
  try {
    const manager = new CentralManager();
    
    // Check if already initialized
    if (await manager.isInitialized()) {
      logger.warn(`Central directory already exists: ${manager.getCentralPath()}`);
      logger.info('To reinitialize, please delete the directory first');
      return;
    }

    logger.info('Initializing central directory...\n');

    await manager.init();

    logger.success('✅ Initialization complete!\n');
    logger.info(`Workflows directory: ${manager.getWorkflowsPath()}`);
    logger.info('');
    logger.info('Next steps:');
    logger.info(`  1. Create .md files in ${manager.getWorkflowsPath()}`);
    logger.info('  2. cd to your project directory');
    logger.info('  3. Run conflows sync');
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
