import path from 'path';
import os from 'os';
import type { WorkflowFile } from '../types/index.js';
import { fs } from '../utils/fs.js';

/** 中心目录管理器 */
export class CentralManager {
  private centralPath: string;
  private workflowsPath: string;

  constructor(centralPath?: string) {
    this.centralPath = centralPath || path.join(os.homedir(), '.conflow');
    this.workflowsPath = path.join(this.centralPath, 'workflows');
  }

  /** 获取中心目录路径 */
  getCentralPath(): string {
    return this.centralPath;
  }

  /** 获取 workflows 目录路径 */
  getWorkflowsPath(): string {
    return this.workflowsPath;
  }

  /** 检查中心目录是否已初始化 */
  async isInitialized(): Promise<boolean> {
    return await fs.exists(this.workflowsPath);
  }

  /** 初始化中心目录 */
  async init(): Promise<void> {
    await fs.ensureDir(this.workflowsPath);
  }

  /** 扫描所有 workflow 文件 */
  async scanWorkflows(): Promise<WorkflowFile[]> {
    if (!await fs.exists(this.workflowsPath)) {
      return [];
    }

    const files = await fs.readdir(this.workflowsPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const workflows: WorkflowFile[] = [];

    for (const filename of mdFiles) {
      const filepath = path.join(this.workflowsPath, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const stats = await fs.stat(filepath);

      workflows.push({
        name: filename,
        path: filepath,
        content,
        ide: 'central', // 标记为来自中心目录
        size: stats.size,
        mtime: stats.mtime,
      });
    }

    return workflows;
  }

  /** 获取指定 workflow 文件 */
  async getWorkflow(filename: string): Promise<WorkflowFile | null> {
    const filepath = path.join(this.workflowsPath, filename);
    
    if (!await fs.exists(filepath)) {
      return null;
    }

    const content = await fs.readFile(filepath, 'utf-8');
    const stats = await fs.stat(filepath);

    return {
      name: filename,
      path: filepath,
      content,
      ide: 'central',
      size: stats.size,
      mtime: stats.mtime,
    };
  }
}
