import path from 'path';
import type { WorkflowFile, ResolvedConfig } from '../types/index.js';
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

  /** Distribute workflows to project */
  async distribute(
    projectPath: string,
    config: ResolvedConfig,
    dryRun: boolean = false
  ): Promise<void> {
    const absProjectPath = path.resolve(projectPath);

    // Get final workflow list
    const workflowFiles = new Set<string>([
      ...config.workflows,
      ...config.include,
    ]);

    // Exclude specified files
    config.exclude.forEach(f => workflowFiles.delete(f));

    const workflows = Array.from(workflowFiles);

    if (workflows.length === 0) {
      logger.warn('No workflows to sync');
      return;
    }

    // Show sync plan
    logger.info(`\n🎯 Project: ${absProjectPath}`);
    logger.info(`📦 Mode: ${dryRun ? 'Preview' : 'Execute'}`);
    logger.info(`   IDEs: ${config.ides.join(', ')}`);
    logger.info('');
    logger.info(`📋 Sync files (${workflows.length} total):`);
    
    workflows.forEach(w => {
      logger.info(`   ✓ ${w}`);
    });
    
    logger.info('');
    logger.info('📁 Target directories:');
    config.ides.forEach(ide => {
      const adapter = getAdapter(ide);
      logger.info(`   → ${adapter.dirPath} (${workflows.length} files)`);
    });

    if (dryRun) {
      logger.info('\n💡 Remove --dry-run option to execute sync');
      return;
    }

    logger.info('\nStarting sync...');

    let syncCount = 0;

    // Sync for each IDE
    for (const ideName of config.ides) {
      const adapter = getAdapter(ideName);
      const ideDir = path.join(absProjectPath, adapter.dirPath);

      // Ensure IDE directory exists
      await fs.ensureDir(ideDir);

      // Sync each workflow
      for (const workflowName of workflows) {
        const workflow = await this.centralManager.getWorkflow(workflowName);
        
        if (!workflow) {
          logger.warn(`⚠️  File not found: ${workflowName}`);
          continue;
        }

        // Convert format (central directory uses Cursor format, i.e., plain markdown)
        const converted = this.transformer.transform(
          workflow.content,
          workflow.name,
          'cursor',
          ideName
        );

        // Write file
        const targetPath = path.join(ideDir, workflowName);
        await fs.writeFile(targetPath, converted, 'utf-8');
        
        logger.success(`   ✓ ${adapter.dirPath}/${workflowName}`);
        syncCount++;
      }
    }

    logger.success(`\n✅ Complete! Synced ${workflows.length} workflows to ${config.ides.length} IDEs`);
  }
}
