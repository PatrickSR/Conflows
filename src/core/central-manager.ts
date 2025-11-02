import path from 'path';
import os from 'os';
import type { WorkflowFile, CentralConfig, TagConfig } from '../types/index.js';
import { fs } from '../utils/fs.js';

/** 中心目录管理器 */
export class CentralManager {
  private centralPath: string;
  private workflowsPath: string;
  private configPath: string;

  constructor(centralPath?: string) {
    this.centralPath = centralPath || path.join(os.homedir(), '.sync-workflow');
    this.workflowsPath = path.join(this.centralPath, 'workflows');
    this.configPath = path.join(this.centralPath, 'config.json');
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
    return await fs.exists(this.centralPath) && await fs.exists(this.configPath);
  }

  /** 初始化中心目录 */
  async init(): Promise<void> {
    // 创建目录结构
    await fs.ensureDir(this.workflowsPath);

    // 创建默认配置
    const defaultConfig: CentralConfig = {
      version: '1.0.0',
      defaultIDEs: ['cursor', 'windsurf'],
      tags: {
        common: {
          description: '通用工作流',
          workflows: [],
        },
      },
      workflowMeta: {},
    };

    await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');

    // 创建空的 projects.json
    const projectsPath = path.join(this.centralPath, 'projects.json');
    await fs.writeFile(projectsPath, JSON.stringify({ projects: {} }, null, 2), 'utf-8');
  }

  /** 读取中心配置 */
  async getConfig(): Promise<CentralConfig> {
    if (!await fs.exists(this.configPath)) {
      throw new Error('中心目录未初始化，请先运行: sync-workflow init');
    }

    const content = await fs.readFile(this.configPath, 'utf-8');
    return JSON.parse(content) as CentralConfig;
  }

  /** 保存中心配置 */
  async saveConfig(config: CentralConfig): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
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

  /** 根据 tags 解析 workflow 文件列表 */
  resolveWorkflowsByTags(config: CentralConfig, tags: string[]): string[] {
    const workflows = new Set<string>();

    for (const tag of tags) {
      const tagConfig = config.tags[tag];
      if (tagConfig) {
        tagConfig.workflows.forEach(w => workflows.add(w));
      }
    }

    return Array.from(workflows);
  }

  /** 获取所有 tags */
  getTags(config: CentralConfig): TagConfig[] {
    return Object.entries(config.tags).map(([name, tagConfig]) => ({
      ...tagConfig,
      name,
    } as TagConfig & { name: string }));
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
