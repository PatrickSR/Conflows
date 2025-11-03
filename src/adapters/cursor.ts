import matter from 'gray-matter';
import type { IDEAdapter, CommandIR, RuleIR } from '../types/index.js';

/**
 * Cursor IDE adapter
 * 
 * Commands: Plain markdown format without frontmatter (.cursor/commands/)
 * Rules: Markdown with YAML frontmatter (.cursor/rules/ with .mdc extension)
 */
export class CursorAdapter implements IDEAdapter {
  name = 'cursor';
  commandDirPath = '.cursor/commands';
  ruleDirPath = '.cursor/rules';
  ruleFileExtension = '.mdc';
  
  /** @deprecated Use commandDirPath instead */
  get dirPath() {
    return this.commandDirPath;
  }
  
  installationPaths = {
    darwin: [
      '/Applications/Cursor.app'
    ],
    win32: [
      '%PROGRAMFILES%\\Cursor',
      '%PROGRAMFILES(X86)%\\Cursor',
      '%LOCALAPPDATA%\\Programs\\Cursor'
    ],
    linux: [
      '/usr/local/bin/cursor',
      '/opt/cursor',
      '~/.local/bin/cursor',
      '~/.local/share/cursor'
    ]
  };
  
  /**
   * Parse command to intermediate representation
   */
  parseCommand(content: string, filename: string): CommandIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      tags?: string[];
      cursor?: any;
      windsurf?: any;
      vscode?: any;
    };
    
    // Try to extract description from content or filename
    const description = data.description || this.extractDescription(parsed.content, filename);
    
    return {
      name: filename.replace(/\.(md|mdc)$/, ''),
      description,
      content: parsed.content.trim(),
      tags: data.tags,
      cursor: data.cursor,
      windsurf: data.windsurf,
      vscode: data.vscode,
    };
  }
  
  /**
   * Serialize command to plain markdown (without frontmatter)
   */
  serializeCommand(command: CommandIR): string {
    return command.content;
  }
  
  /**
   * Parse rule to intermediate representation
   */
  parseRule(content: string, filename: string): RuleIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      tags?: string[];
      cursor?: any;
      windsurf?: any;
      vscode?: any;
    };
    
    return {
      name: filename.replace(/\.(md|mdc)$/, ''),
      description: data.description || '',
      content: parsed.content.trim(),
      tags: data.tags,
      cursor: data.cursor,
      windsurf: data.windsurf,
      vscode: data.vscode,
    };
  }
  
  /**
   * Serialize rule to Cursor format (.mdc with frontmatter)
   */
  serializeRule(rule: RuleIR): string {
    const cursorConfig = rule.cursor || {};
    
    const frontmatter: Record<string, any> = {
      alwaysApply: cursorConfig.alwaysApply ?? false,
    };
    
    // Only add patterns if they exist
    if (cursorConfig.patterns && cursorConfig.patterns.length > 0) {
      frontmatter.patterns = cursorConfig.patterns;
    }
    
    return matter.stringify(rule.content, frontmatter);
  }
  
  /** @deprecated Use parseCommand instead */
  parse(content: string, filename: string): CommandIR {
    return this.parseCommand(content, filename);
  }
  
  /** @deprecated Use serializeCommand instead */
  serialize(command: CommandIR): string {
    return this.serializeCommand(command);
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
