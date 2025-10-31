import matter from 'gray-matter';
import type { IDEAdapter, WorkflowIR } from '../types/index.js';

/**
 * YAML frontmatter 格式适配器
 * 带 description 和 auto_execution_mode 配置
 */
export class WindsurfAdapter implements IDEAdapter {
  name = 'windsurf';
  dirPath = '.windsurf/workflows';
  
  /**
   * 解析为中间格式
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
   * 序列化为 frontmatter + markdown
   */
  serialize(workflow: WorkflowIR): string {
    const autoExecutionMode = workflow.config?.executionMode === 'turbo' ? 3 : 1;
    
    return matter.stringify(workflow.content, {
      description: workflow.description,
      auto_execution_mode: autoExecutionMode,
    });
  }
  
  /** 映射执行模式：3=turbo, 其他=safe */
  private mapExecutionMode(mode?: number): 'safe' | 'turbo' {
    return mode === 3 ? 'turbo' : 'safe';
  }
}
