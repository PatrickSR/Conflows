/** Workflow intermediate representation (IR) */
export interface WorkflowIR {
  name: string;
  description: string;
  content: string;
  config?: {
    executionMode?: 'safe' | 'turbo' | 'auto';
    [key: string]: any;
  };
}

/** Workflow file information */
export interface WorkflowFile {
  name: string;
  path: string;
  content: string;
  ide: string;
  size: number;
  mtime: Date;
}

/** IDE adapter interface */
export interface IDEAdapter {
  name: string;
  dirPath: string;
  
  /** Installation detection paths for different platforms */
  installationPaths?: {
    darwin?: string[];   // macOS app names or paths
    win32?: string[];    // Windows paths (supports env vars)
    linux?: string[];    // Linux paths (supports ~)
  };
  
  parse(content: string, filename: string): WorkflowIR;
  serialize(workflow: WorkflowIR): string;
}

/** Sync options */
export interface SyncOptions {
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
  workflows: string[];
  include: string[];
  exclude: string[];
}
