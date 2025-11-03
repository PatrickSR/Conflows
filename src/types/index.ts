/** Command intermediate representation (IR) */
export interface CommandIR {
  name: string;
  description: string;
  content: string;
  tags?: string[];
  
  /** Cursor-specific configuration */
  cursor?: {
    [key: string]: any;
  };
  
  /** Windsurf-specific configuration */
  windsurf?: {
    auto_execution_mode?: 1 | 3;  // 1=safe, 3=turbo
    [key: string]: any;
  };
  
  /** VSCode-specific configuration */
  vscode?: {
    mode?: 'agent' | 'ask' | 'edit';
    model?: string;
    tools?: string[];
    [key: string]: any;
  };
}

/** Rule intermediate representation (IR) */
export interface RuleIR {
  name: string;
  description: string;
  content: string;
  tags?: string[];
  
  /** Cursor-specific configuration */
  cursor?: {
    alwaysApply?: boolean;
    patterns?: string[];
    [key: string]: any;
  };
  
  /** Windsurf-specific configuration */
  windsurf?: {
    mode?: 'always' | 'auto' | 'specific' | 'disabled';
    patterns?: string[];
    [key: string]: any;
  };
  
  /** VSCode-specific configuration */
  vscode?: {
    applyTo?: string;  // glob pattern
    [key: string]: any;
  };
}

/** @deprecated Use CommandIR instead */
export type WorkflowIR = CommandIR;

/** Workflow file information */
export interface WorkflowFile {
  name: string;
  path: string;
  content: string;
  ide: string;
  size: number;
  mtime: Date;
}

/** Sync type: commands, rules, or all */
export type SyncType = 'commands' | 'rules' | 'all';

/** IDE adapter interface */
export interface IDEAdapter {
  name: string;
  
  /** Command directory path */
  commandDirPath: string;
  
  /** Command file extension (default: '.md') */
  commandFileExtension?: string;
  
  /** Rule directory path (optional) */
  ruleDirPath?: string;
  
  /** Rule file extension (default: '.md') */
  ruleFileExtension?: string;
  
  /** Installation detection paths for different platforms */
  installationPaths?: {
    darwin?: string[];   // macOS app names or paths
    win32?: string[];    // Windows paths (supports env vars)
    linux?: string[];    // Linux paths (supports ~)
  };
  
  /** Parse command content to IR */
  parseCommand(content: string, filename: string): CommandIR;
  
  /** Serialize command IR to IDE format */
  serializeCommand(command: CommandIR): string;
  
  /** Parse rule content to IR (optional) */
  parseRule?(content: string, filename: string): RuleIR;
  
  /** Serialize rule IR to IDE format (optional) */
  serializeRule?(rule: RuleIR): string;
  
  /** @deprecated Use commandDirPath instead */
  dirPath?: string;
  
  /** @deprecated Use parseCommand instead */
  parse?(content: string, filename: string): CommandIR;
  
  /** @deprecated Use serializeCommand instead */
  serialize?(command: CommandIR): string;
}

/** Sync options */
export interface SyncOptions {
  type?: SyncType;
  tags?: string[];
  ides?: string[];
  include?: string[];
  exclude?: string[];
  dryRun?: boolean;
}

/** Conflict information */
export interface Conflict {
  filename: string;
  fromFile: WorkflowFile;
  toFile: WorkflowFile;
}

/** Resolved configuration */
export interface ResolvedConfig {
  ides: string[];
  workflows: string[];  // for backward compatibility
  commands: string[];
  rules: string[];
  include: string[];
  exclude: string[];
}
