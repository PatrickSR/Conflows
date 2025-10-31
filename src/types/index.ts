/**
 * 标准工作流中间格式 (Intermediate Representation)
 * 所有 IDE 格式都转换成这个统一的结构
 */
export interface WorkflowIR {
  /** 工作流名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 正文内容（纯 markdown） */
  content: string;
  /** IDE 特定配置（可选） */
  config?: {
    /** 执行模式 */
    executionMode?: 'safe' | 'turbo' | 'auto';
    /** 其他自定义配置 */
    [key: string]: any;
  };
}

/**
 * 工作流文件信息
 */
export interface WorkflowFile {
  /** 文件名 */
  name: string;
  /** 完整路径 */
  path: string;
  /** 文件内容 */
  content: string;
  /** 所属 IDE */
  ide: string;
  /** 文件大小（字节） */
  size: number;
  /** 修改时间 */
  mtime: Date;
}

/**
 * IDE 适配器接口
 */
export interface IDEAdapter {
  /** IDE 名称 */
  name: string;
  /** 工作流目录路径（相对于项目根目录） */
  dirPath: string;
  
  /**
   * 解析：IDE 格式 → 中间格式
   */
  parse(content: string, filename: string): WorkflowIR;
  
  /**
   * 序列化：中间格式 → IDE 格式
   */
  serialize(workflow: WorkflowIR): string;
}

/**
 * 同步选项
 */
export interface SyncOptions {
  from?: string;
  to?: string;
  both?: boolean;
  force?: boolean;
}

/**
 * 冲突信息
 */
export interface Conflict {
  filename: string;
  fromFile: WorkflowFile;
  toFile: WorkflowFile;
}
