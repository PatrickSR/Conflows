import path from 'path';
import type { WorkflowFile } from '../types/index.js';
import { fs } from '../utils/fs.js';
import { getAdapter, getAllIDENames } from '../adapters/index.js';

/** 文件扫描器 */
export class Scanner {
  private cwd = process.cwd();
  
  /** 扫描指定 IDE 的工作流 */
  async scan(ideName: string): Promise<WorkflowFile[]> {
    const adapter = getAdapter(ideName);
    const dir = path.join(this.cwd, adapter.dirPath);
    
    if (!await fs.exists(dir)) {
      return [];
    }
    
    const files = await fs.readdir(dir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const workflows: WorkflowFile[] = [];
    
    for (const filename of mdFiles) {
      const filepath = path.join(dir, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const stats = await fs.stat(filepath);
      
      workflows.push({
        name: filename,
        path: filepath,
        content,
        ide: ideName,
        size: stats.size,
        mtime: stats.mtime,
      });
    }
    
    return workflows;
  }
  
  /** 扫描所有 IDE */
  async scanAll(): Promise<Map<string, WorkflowFile[]>> {
    const results = new Map<string, WorkflowFile[]>();
    
    // 动态获取所有已注册的 IDE
    const ideNames = getAllIDENames();
    
    for (const ideName of ideNames) {
      const files = await this.scan(ideName);
      results.set(ideName, files);
    }
    
    return results;
  }
}
