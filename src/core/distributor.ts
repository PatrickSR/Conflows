import path from 'path';
import type { WorkflowFile, ResolvedConfig, SyncType } from '../types/index.js';
import { fs } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { getAdapter } from '../adapters/index.js';
import { Transformer } from './transformer.js';
import { CentralManager } from './central-manager.js';

/** Sync plan */
export interface SyncPlan {
  workflows: string[];
  ides: string[];
  totalFiles: number;
}

/** Workflow distributor */
export class Distributor {
  private centralManager: CentralManager;
  private transformer: Transformer;

  constructor(centralPath?: string) {
    this.centralManager = new CentralManager(centralPath);
    this.transformer = new Transformer();
  }

  /** Distribute files to project */
  async distribute(
    projectPath: string,
    config: ResolvedConfig,
    syncType: SyncType = 'all',
    dryRun: boolean = false
  ): Promise<void> {
    const absProjectPath = path.resolve(projectPath);
    
    // Determine what to sync
    const shouldSyncCommands = syncType === 'commands' || syncType === 'all';
    const shouldSyncRules = syncType === 'rules' || syncType === 'all';
    
    // Sync commands
    if (shouldSyncCommands) {
      await this.distributeCommands(absProjectPath, config, dryRun);
    }
    
    // Sync rules
    if (shouldSyncRules) {
      await this.distributeRules(absProjectPath, config, dryRun);
    }
  }
  
  /** Distribute commands to project */
  private async distributeCommands(
    projectPath: string,
    config: ResolvedConfig,
    dryRun: boolean
  ): Promise<void> {
    // Get command list (support both workflows and commands for backward compatibility)
    const commandFiles = new Set<string>([
      ...config.commands,
      ...config.workflows, // backward compatibility
      ...config.include,
    ]);

    // Exclude specified files
    config.exclude.forEach(f => commandFiles.delete(f));

    const commands = Array.from(commandFiles);

    if (commands.length === 0) {
      logger.info('No commands to sync');
      return;
    }

    // Show sync plan
    logger.info(`\n📋 Commands (${commands.length} files):`);
    commands.forEach(c => logger.info(`   ✓ ${c}`));
    
    if (!dryRun) {
      logger.info('');
      logger.info('📁 Command target directories:');
      config.ides.forEach(ide => {
        const adapter = getAdapter(ide);
        logger.info(`   → ${adapter.commandDirPath}`);
      });
    }

    if (dryRun) {
      return;
    }

    logger.info('');
    logger.info('Syncing commands...');

    let syncCount = 0;

    // Sync for each IDE
    for (const ideName of config.ides) {
      const adapter = getAdapter(ideName);
      const ideDir = path.join(projectPath, adapter.commandDirPath);

      // Ensure IDE directory exists
      await fs.ensureDir(ideDir);

      // Sync each command
      for (const commandName of commands) {
        const command = await this.centralManager.getCommand(commandName);
        
        if (!command) {
          logger.warn(`⚠️  Command not found: ${commandName}`);
          continue;
        }

        // Transform from central format (.mdc) to target IDE format
        const converted = this.transformer.transformCommand(
          command.content,
          command.name,
          'central',
          ideName
        );

        // Determine output filename
        const outputName = this.getOutputFilename(
          commandName,
          adapter.commandFileExtension || '.md'
        );

        // Write file
        const targetPath = path.join(ideDir, outputName);
        await fs.writeFile(targetPath, converted, 'utf-8');
        
        logger.success(`   ✓ ${adapter.commandDirPath}/${outputName}`);
        syncCount++;
      }
    }

    logger.success(`✅ Synced ${commands.length} commands to ${config.ides.length} IDEs`);
  }
  
  /** Distribute rules to project */
  private async distributeRules(
    projectPath: string,
    config: ResolvedConfig,
    dryRun: boolean
  ): Promise<void> {
    const rules = Array.from(new Set([...config.rules]));

    if (rules.length === 0) {
      logger.info('\nNo rules to sync');
      return;
    }

    // Show sync plan
    logger.info(`\n📋 Rules (${rules.length} files):`);
    rules.forEach(r => logger.info(`   ✓ ${r}`));
    
    if (!dryRun) {
      logger.info('');
      logger.info('📁 Rule target directories:');
      config.ides.forEach(ide => {
        const adapter = getAdapter(ide);
        if (adapter.ruleDirPath) {
          logger.info(`   → ${adapter.ruleDirPath}`);
        }
      });
    }

    if (dryRun) {
      return;
    }

    logger.info('');
    logger.info('Syncing rules...');

    let syncCount = 0;

    // Sync for each IDE
    for (const ideName of config.ides) {
      const adapter = getAdapter(ideName);
      
      if (!adapter.ruleDirPath || !adapter.serializeRule) {
        logger.warn(`⚠️  ${ideName} does not support rules, skipping`);
        continue;
      }
      
      const ideDir = path.join(projectPath, adapter.ruleDirPath);

      // Ensure IDE directory exists
      await fs.ensureDir(ideDir);

      // Sync each rule
      for (const ruleName of rules) {
        const rule = await this.centralManager.getRule(ruleName);
        
        if (!rule) {
          logger.warn(`⚠️  Rule not found: ${ruleName}`);
          continue;
        }

        // Transform from central format to target IDE format
        const converted = this.transformer.transformRule(
          rule.content,
          rule.name,
          'central',
          ideName
        );

        // Determine output filename
        const outputName = this.getOutputFilename(
          ruleName,
          adapter.ruleFileExtension || '.md'
        );

        // Write file
        const targetPath = path.join(ideDir, outputName);
        await fs.writeFile(targetPath, converted, 'utf-8');
        
        logger.success(`   ✓ ${adapter.ruleDirPath}/${outputName}`);
        syncCount++;
      }
    }

    logger.success(`✅ Synced ${rules.length} rules to ${config.ides.length} IDEs`);
  }
  
  /** Convert filename extension */
  private getOutputFilename(inputName: string, targetExtension: string): string {
    // Remove existing extension (.md or .mdc)
    const nameWithoutExt = inputName.replace(/\.(md|mdc)$/, '');
    // Add target extension
    return nameWithoutExt + targetExtension;
  }
}
