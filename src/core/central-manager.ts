import path from 'path';
import os from 'os';
import type { WorkflowFile } from '../types/index.js';
import { fs } from '../utils/fs.js';

/** Central directory manager */
export class CentralManager {
  private centralPath: string;
  private commandsPath: string;
  private rulesPath: string;
  
  /** @deprecated Use commandsPath instead */
  private workflowsPath: string;

  constructor(centralPath?: string) {
    this.centralPath = centralPath || path.join(os.homedir(), '.conflows');
    this.commandsPath = path.join(this.centralPath, 'commands');
    this.rulesPath = path.join(this.centralPath, 'rules');
    this.workflowsPath = this.commandsPath; // for backward compatibility
  }

  /** Get central directory path */
  getCentralPath(): string {
    return this.centralPath;
  }

  /** Get commands directory path */
  getCommandsPath(): string {
    return this.commandsPath;
  }
  
  /** Get rules directory path */
  getRulesPath(): string {
    return this.rulesPath;
  }
  
  /** @deprecated Use getCommandsPath instead */
  getWorkflowsPath(): string {
    return this.commandsPath;
  }

  /** Check if central directory is initialized */
  async isInitialized(): Promise<boolean> {
    return await fs.exists(this.commandsPath) || await fs.exists(this.rulesPath);
  }

  /** Initialize central directory */
  async init(): Promise<void> {
    await fs.ensureDir(this.commandsPath);
    await fs.ensureDir(this.rulesPath);
  }

  /** Scan all command files */
  async scanCommands(): Promise<WorkflowFile[]> {
    return this.scanFiles(this.commandsPath, ['.md', '.mdc']);
  }
  
  /** Scan all rule files */
  async scanRules(): Promise<WorkflowFile[]> {
    return this.scanFiles(this.rulesPath, ['.md', '.mdc']);
  }
  
  /** @deprecated Use scanCommands instead */
  async scanWorkflows(): Promise<WorkflowFile[]> {
    return this.scanCommands();
  }
  
  /** Scan files in a directory with given extensions */
  private async scanFiles(dirPath: string, extensions: string[]): Promise<WorkflowFile[]> {
    if (!await fs.exists(dirPath)) {
      return [];
    }

    const files = await fs.readdir(dirPath);
    const targetFiles = files.filter(f => 
      extensions.some(ext => f.endsWith(ext))
    );

    const results: WorkflowFile[] = [];

    for (const filename of targetFiles) {
      const filepath = path.join(dirPath, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const stats = await fs.stat(filepath);

      results.push({
        name: filename,
        path: filepath,
        content,
        ide: 'central',
        size: stats.size,
        mtime: stats.mtime,
      });
    }

    return results;
  }

  /** Get specific command file */
  async getCommand(filename: string): Promise<WorkflowFile | null> {
    return this.getFile(this.commandsPath, filename);
  }
  
  /** Get specific rule file */
  async getRule(filename: string): Promise<WorkflowFile | null> {
    return this.getFile(this.rulesPath, filename);
  }
  
  /** @deprecated Use getCommand instead */
  async getWorkflow(filename: string): Promise<WorkflowFile | null> {
    return this.getCommand(filename);
  }
  
  /** Get a file from a directory */
  private async getFile(dirPath: string, filename: string): Promise<WorkflowFile | null> {
    const filepath = path.join(dirPath, filename);
    
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
