import matter from 'gray-matter';
import type { IDEAdapter, WorkflowIR } from '../types/index.js';

/**
 * Cursor 适配器
 * 
 * Cursor 使用纯 markdown 格式（无 frontmatter）
 * 
 * 格式示例：
 * ```markdown
 * # 工作流标题
 * 
 * 工作流内容...
 * ```
 * 
 * 注意：
 * - Cursor 文件可能包含 frontmatter，也可能没有
 * - 转换到 Windsurf 时需要智能提取 description
 */
export class CursorAdapter implements IDEAdapter {
  name = 'cursor';
  dirPath = '.cursor/commands';
  
  /**
   * 解析 Cursor 格式到中间格式
   * @param content 文件内容
   * @param filename 文件名
   * @returns 标准化的工作流中间格式
   */
  parse(content: string, filename: string): WorkflowIR {
    // Cursor 可能有 frontmatter 也可能没有
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
   * 序列化中间格式到 Cursor 格式
   * @param workflow 工作流中间格式
   * @returns Cursor 格式的纯 markdown 内容（无 frontmatter）
   */
  serialize(workflow: WorkflowIR): string {
    // Cursor 输出纯 markdown（不带 frontmatter）
    return workflow.content;
  }
  
  /**
   * 从内容或文件名提取 description
   * 
   * 提取优先级：
   * 1. 第一行 markdown 标题（# 标题）
   * 2. 第一段文本（前 50 字符）
   * 3. 文件名（去掉扩展名，替换分隔符）
   * 
   * @param content 文件内容
   * @param filename 文件名
   * @returns 提取的描述文本
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
