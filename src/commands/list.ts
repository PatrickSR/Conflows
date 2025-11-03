import { CentralManager } from '../core/central-manager.js';
import { logger } from '../utils/logger.js';

/** List commands and rules */
export async function listCommand(): Promise<void> {
  try {
    const centralManager = new CentralManager();

    // Check if central directory is initialized
    if (!await centralManager.isInitialized()) {
      logger.error('❌ Central directory not initialized');
      logger.info('Please run: conflows init');
      process.exit(1);
    }

    const commands = await centralManager.scanCommands();
    const rules = await centralManager.scanRules();

    if (commands.length === 0 && rules.length === 0) {
      logger.info('\nNo files found\n');
      logger.info(`Commands: ${centralManager.getCommandsPath()}`);
      logger.info(`Rules: ${centralManager.getRulesPath()}`);
      return;
    }

    // List commands
    if (commands.length > 0) {
      logger.info(`\n📋 Commands (${commands.length} files):\n`);
      commands.forEach(c => {
        const date = c.mtime.toLocaleString('en-US');
        logger.info(`  ${c.name} (${c.size} bytes, ${date})`);
      });
    }

    // List rules
    if (rules.length > 0) {
      logger.info(`\n📜 Rules (${rules.length} files):\n`);
      rules.forEach(r => {
        const date = r.mtime.toLocaleString('en-US');
        logger.info(`  ${r.name} (${r.size} bytes, ${date})`);
      });
    }

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
