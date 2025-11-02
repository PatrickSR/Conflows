/** 工作流中间格式 */
export interface WorkflowIR {
  name: string;
  description: string;
  content: string;
  config?: {
    executionMode?: 'safe' | 'turbo' | 'auto';
    [key: string]: any;
  };
}

/** 工作流文件信息 */
export interface WorkflowFile {
  name: string;
  path: string;
  content: string;
  ide: string;
  size: number;
  mtime: Date;
}

/** IDE 适配器接口 */
export interface IDEAdapter {
  name: string;
  dirPath: string;
  parse(content: string, filename: string): WorkflowIR;
  serialize(workflow: WorkflowIR): string;
}

/** 同步选项 */
export interface SyncOptions {
  tags?: string[];
  ides?: string[];
  include?: string[];
  exclude?: string[];
  dryRun?: boolean;
}

/** 冲突信息 */
export interface Conflict {
  filename: string;
  fromFile: WorkflowFile;
  toFile: WorkflowFile;
}

/** 中心配置 */
export interface CentralConfig {
  version: string;
  defaultIDEs: string[];
  tags: Record<string, TagConfig>;
  workflowMeta: Record<string, WorkflowMeta>;
}

/** Tag 配置 */
export interface TagConfig {
  description: string;
  workflows: string[];
}

/** Workflow 元数据 */
export interface WorkflowMeta {
  description: string;
  executionMode?: 'safe' | 'turbo' | 'auto';
}

/** 解析后的配置 */
export interface ResolvedConfig {
  tags: string[];
  ides: string[];
  workflows: string[];
  include: string[];
  exclude: string[];
}
