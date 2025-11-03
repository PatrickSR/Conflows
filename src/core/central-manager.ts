import path from 'path';
import os from 'os';
import type { WorkflowFile } from '../types/index.js';
import { fs } from '../utils/fs.js';

/** Central directory manager */
export class CentralManager {
  private centralPath: string;
  private workflowsPath: string;

  constructor(centralPath?: string) {
    this.centralPath = centralPath || path.join(os.homedir(), '.conflow');
    this.workflowsPath = path.join(this.centralPath, 'workflows');
  }

  /** Get central directory path */
  getCentralPath(): string {
    return this.centralPath;
  }

  /** Get workflows directory path */
  getWorkflowsPath(): string {
    return this.workflowsPath;
  }

  /** Check if central directory is initialized */
  async isInitialized(): Promise<boolean> {
    return await fs.exists(this.workflowsPath);
  }

  /** Initialize central directory */
  async init(): Promise<void> {
    await fs.ensureDir(this.workflowsPath);
  }

  /** Scan all workflow files */
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
        ide: 'central', // Mark as from central directory
        size: stats.size,
        mtime: stats.mtime,
      });
    }

    return workflows;
  }

  /** Get specific workflow file */
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
