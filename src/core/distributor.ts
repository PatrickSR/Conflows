import path from 'path';
import type { WorkflowFile, ResolvedConfig } from '../types/index.js';
import { fs } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { getAdapter } from '../adapters/index.js';
import { Transformer } from './transformer.js';
import { CentralManager } from './central-manager.js';

/** 同步计划 */
export interface SyncPlan {
  workflows: string[];
  ides: string[];
  totalFiles: number;
}

/** Workflow 分发器 */
export class Distributor {
  private centralManager: CentralManager;
  private transformer: Transformer;

  constructor(centralPath?: string) {
    this.centralManager = new CentralManager(centralPath);
    this.transformer = new Transformer();
  }

  /** 下发 workflows 到项目 */
  async distribute(
    projectPath: string,
    config: ResolvedConfig,
    dryRun: boolean = false
  ): Promise<void> {
    const absProjectPath = path.resolve(projectPath);

    // 获取最终的 workflow 列表
    const workflowFiles = new Set<string>([
      ...config.workflows,
      ...config.include,
    ]);

    // 排除指定的文件
    config.exclude.forEach(f => workflowFiles.delete(f));

    const workflows = Array.from(workflowFiles);

    if (workflows.length === 0) {
      logger.warn('没有需要同步的 workflow');
      return;
    }

    // 显示同步计划
    logger.info(`\n🎯 项目: ${absProjectPath}`);
    logger.info(`📦 模式: ${dryRun ? '预览' : '执行'}`);
    logger.info(`   IDEs: ${config.ides.join(', ')}`);
    logger.info('');
    logger.info(`📋 同步文件 (${workflows.length} 个):`);
    
    workflows.forEach(w => {
      logger.info(`   ✓ ${w}`);
    });
    
    logger.info('');
    logger.info('📁 目标目录:');
    config.ides.forEach(ide => {
      const adapter = getAdapter(ide);
      logger.info(`   → ${adapter.dirPath} (${workflows.length} 个文件)`);
    });

    if (dryRun) {
      logger.info('\n💡 移除 --dry-run 选项以执行同步');
      return;
    }

    logger.info('\n开始同步...');

    let syncCount = 0;

    // 对每个 IDE 进行同步
    for (const ideName of config.ides) {
      const adapter = getAdapter(ideName);
      const ideDir = path.join(absProjectPath, adapter.dirPath);

      // 确保 IDE 目录存在
      await fs.ensureDir(ideDir);

      // 同步每个 workflow
      for (const workflowName of workflows) {
        const workflow = await this.centralManager.getWorkflow(workflowName);
        
        if (!workflow) {
          logger.warn(`⚠️  找不到文件: ${workflowName}`);
          continue;
        }

        // 转换格式（中心目录使用 Cursor 格式，即纯 markdown）
        const converted = this.transformer.transform(
          workflow.content,
          workflow.name,
          'cursor',
          ideName
        );

        // 写入文件
        const targetPath = path.join(ideDir, workflowName);
        await fs.writeFile(targetPath, converted, 'utf-8');
        
        logger.success(`   ✓ ${adapter.dirPath}/${workflowName}`);
        syncCount++;
      }
    }

    logger.success(`\n✅ 完成! 已同步 ${workflows.length} 个 workflow 到 ${config.ides.length} 个 IDE`);
  }
}
