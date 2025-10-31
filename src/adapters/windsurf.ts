import matter from 'gray-matter';
import type { IDEAdapter, WorkflowIR } from '../types/index.js';

/**
 * Windsurf 适配器
 * 
 * Windsurf 使用带 YAML frontmatter 的 markdown 格式
 * 
 * 格式示例：
 * ```markdown
 * ---
 * description: 工作流描述
 * auto_execution_mode: 3
 * ---
 * 
 * 工作流正文内容...
 * ```
 * 
 * auto_execution_mode:
 * - 1 = Safe mode（安全模式）
 * - 3 = Turbo mode（快速模式）
 */
export class WindsurfAdapter implements IDEAdapter {
  name = 'windsurf';
  dirPath = '.windsurf/workflows';
  
  /**
   * 解析 Windsurf 格式到中间格式
   * @param content 文件内容
   * @param filename 文件名
   * @returns 标准化的工作流中间格式
   */
  parse(content: string, filename: string): WorkflowIR {
    const parsed = matter(content);
    const data = parsed.data as { description?: string; auto_execution_mode?: number };
    
    return {
      name: filename.replace('.md', ''),
      description: data.description || '',
      content: parsed.content.trim(),
      config: {
        executionMode: this.mapExecutionMode(data.auto_execution_mode),
      },
    };
  }
  
  /**
   * 序列化中间格式到 Windsurf 格式
   * @param workflow 工作流中间格式
   * @returns Windsurf 格式的 markdown 内容（带 frontmatter）
   */
  serialize(workflow: WorkflowIR): string {
    const autoExecutionMode = workflow.config?.executionMode === 'turbo' ? 3 : 1;
    
    return matter.stringify(workflow.content, {
      description: workflow.description,
      auto_execution_mode: autoExecutionMode,
    });
  }
  
  /**
   * 映射执行模式从数字到字符串
   * @param mode auto_execution_mode 值（Windsurf 格式）
   * @returns 标准化的执行模式
   */
  private mapExecutionMode(mode?: number): 'safe' | 'turbo' {
    return mode === 3 ? 'turbo' : 'safe';
  }
}
