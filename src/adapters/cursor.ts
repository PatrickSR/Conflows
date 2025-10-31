import matter from 'gray-matter';
import type { IDEAdapter, WorkflowIR } from '../types/index.js';

/**
 * 纯 markdown 格式适配器
 * 输出不带 frontmatter 的纯 markdown
 */
export class CursorAdapter implements IDEAdapter {
  name = 'cursor';
  dirPath = '.cursor/commands';
  
  /**
   * 解析为中间格式
   */
  parse(content: string, filename: string): WorkflowIR {
    // 解析 frontmatter（如果存在）
    const parsed = matter(content);
    const data = parsed.data as { description?: string };
    
    // 尝试从内容或文件名提取 description
    const description = data.description || this.extractDescription(parsed.content, filename);
    
    return {
      name: filename.replace('.md', ''),
      description,
      content: parsed.content.trim(),
      config: data,
    };
  }
  
  /**
   * 序列化为纯 markdown（无 frontmatter）
   */
  serialize(workflow: WorkflowIR): string {
    return workflow.content;
  }
  
  /**
   * 提取描述：标题 > 首段 > 文件名
   */
  private extractDescription(content: string, filename: string): string {
    // 1. 尝试从第一行提取（如果是 markdown 标题）
    const firstLine = content.split('\n')[0]?.trim();
    if (firstLine?.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '');
    }
    
    // 2. 尝试从第一段提取（取前 50 字符）
    const firstParagraph = content.split('\n\n')[0]?.trim();
    if (firstParagraph && firstParagraph.length > 0) {
      const desc = firstParagraph.substring(0, 50);
      return desc.length < firstParagraph.length ? desc + '...' : desc;
    }
    
    // 3. 使用文件名
    return filename
      .replace('.md', '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ');
  }
}
