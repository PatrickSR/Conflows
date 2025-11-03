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
    logger.info(`Central directory: ${manager.getCentralPath()}`);
    logger.info(`  Commands: ${manager.getCommandsPath()}`);
    logger.info(`  Rules: ${manager.getRulesPath()}`);
    logger.info('');
    logger.info('Next steps:');
    logger.info(`  1. Create .mdc files in ${manager.getCommandsPath()} or ${manager.getRulesPath()}`);
    logger.info('  2. Example format:');
    logger.info('     ---');
    logger.info('     description: "Your description"');
    logger.info('     vscode:');
    logger.info('       mode: agent');
    logger.info('     ---');
    logger.info('     # Your content here');
    logger.info('  3. cd to your project directory');
    logger.info('  4. Run: conflows sync');
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
