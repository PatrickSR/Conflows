import path from 'path';
import os from 'os';
import type {
  ProjectsMapping,
  ProjectConfig,
  ResolvedConfig,
  SyncOptions,
  CentralConfig,
} from '../types/index.js';
import { fs } from '../utils/fs.js';
import { CentralManager } from './central-manager.js';

/** 配置管理器 */
export class ConfigManager {
  private centralManager: CentralManager;
  private projectsPath: string;

  constructor(centralPath?: string) {
    this.centralManager = new CentralManager(centralPath);
    const centralDir = this.centralManager.getCentralPath();
    this.projectsPath = path.join(centralDir, 'projects.json');
  }

  /** 读取项目映射 */
  async getProjects(): Promise<ProjectsMapping> {
    if (!await fs.exists(this.projectsPath)) {
      return { projects: {} };
    }

    const content = await fs.readFile(this.projectsPath, 'utf-8');
    return JSON.parse(content) as ProjectsMapping;
  }

  /** 保存项目映射 */
  async saveProjects(mapping: ProjectsMapping): Promise<void> {
    await fs.writeFile(this.projectsPath, JSON.stringify(mapping, null, 2), 'utf-8');
  }

  /** 获取项目配置 */
  async getProjectConfig(projectPath: string): Promise<ProjectConfig | null> {
    const absPath = path.resolve(projectPath);
    const projects = await this.getProjects();
    return projects.projects[absPath] || null;
  }

  /** 保存项目配置 */
  async saveProjectConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    const absPath = path.resolve(projectPath);
    const projects = await this.getProjects();
    
    projects.projects[absPath] = {
      ...config,
      lastSync: new Date().toISOString(),
    };

    await this.saveProjects(projects);
  }

  /** 删除项目配置 */
  async removeProjectConfig(projectPath: string): Promise<void> {
    const absPath = path.resolve(projectPath);
    const projects = await this.getProjects();
    
    delete projects.projects[absPath];
    
    await this.saveProjects(projects);
  }

  /** 解析最终配置（合并命令行选项、项目配置、全局默认） */
  async resolveConfig(
    projectPath: string,
    cliOptions?: SyncOptions
  ): Promise<ResolvedConfig> {
    const centralConfig = await this.centralManager.getConfig();
    const projectConfig = await this.getProjectConfig(projectPath);

    // 合并配置：命令行 > 项目配置 > 全局默认
    const tags = cliOptions?.tags || projectConfig?.tags || [];
    const ides = cliOptions?.ides || projectConfig?.ides || centralConfig.defaultIDEs;
    const include = cliOptions?.include || projectConfig?.include || [];
    const exclude = cliOptions?.exclude || projectConfig?.exclude || [];

    // 根据 tags 解析 workflows
    const workflows = this.centralManager.resolveWorkflowsByTags(centralConfig, tags);

    return {
      tags,
      ides,
      workflows,
      include,
      exclude,
    };
  }

  /** 获取中心管理器 */
  getCentralManager(): CentralManager {
    return this.centralManager;
  }
}
