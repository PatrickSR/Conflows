import matter from 'gray-matter';
import type { IDEAdapter, WorkflowIR } from '../types/index.js';

/**
 * Pure markdown format adapter
 * Outputs plain markdown without frontmatter
 */
export class CursorAdapter implements IDEAdapter {
  name = 'cursor';
  dirPath = '.cursor/commands';
  
  /**
   * Parse to intermediate representation
   */
  parse(content: string, filename: string): WorkflowIR {
    // Parse frontmatter (if exists)
    const parsed = matter(content);
    const data = parsed.data as { description?: string };
    
    // Try to extract description from content or filename
    const description = data.description || this.extractDescription(parsed.content, filename);
    
    return {
      name: filename.replace('.md', ''),
      description,
      content: parsed.content.trim(),
      config: data,
    };
  }
  
  /**
   * Serialize to plain markdown (without frontmatter)
   */
  serialize(workflow: WorkflowIR): string {
    return workflow.content;
  }
  
  /**
   * Extract description: title > first paragraph > filename
   */
  private extractDescription(content: string, filename: string): string {
    // 1. Try to extract from first line (if it's a markdown heading)
    const firstLine = content.split('\n')[0]?.trim();
    if (firstLine?.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '');
    }
    
    // 2. Try to extract from first paragraph (first 50 chars)
    const firstParagraph = content.split('\n\n')[0]?.trim();
    if (firstParagraph && firstParagraph.length > 0) {
      const desc = firstParagraph.substring(0, 50);
      return desc.length < firstParagraph.length ? desc + '...' : desc;
    }
    
    // 3. Use filename
    return filename
      .replace('.md', '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ');
  }
}
