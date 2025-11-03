import matter from 'gray-matter';
import type { IDEAdapter, CommandIR, RuleIR } from '../types/index.js';

/**
 * Central storage adapter
 * 
 * The central storage format uses .mdc (Markdown with Context):
 * - YAML frontmatter with namespace-based IDE configurations
 * - Markdown content for the actual command/rule
 * 
 * This format is independent of any specific IDE and serves as the
 * single source of truth for all commands and rules.
 * 
 * Format example:
 * ```markdown
 * ---
 * description: "Command description"
 * tags: ["tag1", "tag2"]
 * 
 * cursor:
 *   # Cursor-specific config
 * 
 * windsurf:
 *   # Windsurf-specific config
 * 
 * vscode:
 *   # VSCode-specific config
 * ---
 * 
 * Command/Rule content...
 * ```
 */
export class CentralAdapter implements IDEAdapter {
  name = 'central';
  commandDirPath = 'commands';
  ruleDirPath = 'rules';
  commandFileExtension = '.mdc';
  ruleFileExtension = '.mdc';
  
  // Not applicable for central storage
  installationPaths = undefined;
  
  /**
   * Parse command from central .mdc format
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
   * Serialize command to central .mdc format
   */
  serializeCommand(command: CommandIR): string {
    const frontmatter: Record<string, any> = {};
    
    // Add description if exists
    if (command.description) {
      frontmatter.description = command.description;
    }
    
    // Add tags if exists
    if (command.tags && command.tags.length > 0) {
      frontmatter.tags = command.tags;
    }
    
    // Add IDE-specific configurations
    if (command.cursor) {
      frontmatter.cursor = command.cursor;
    }
    if (command.windsurf) {
      frontmatter.windsurf = command.windsurf;
    }
    if (command.vscode) {
      frontmatter.vscode = command.vscode;
    }
    
    return matter.stringify(command.content, frontmatter);
  }
  
  /**
   * Parse rule from central .mdc format
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
   * Serialize rule to central .mdc format
   */
  serializeRule(rule: RuleIR): string {
    const frontmatter: Record<string, any> = {};
    
    // Add description if exists
    if (rule.description) {
      frontmatter.description = rule.description;
    }
    
    // Add tags if exists
    if (rule.tags && rule.tags.length > 0) {
      frontmatter.tags = rule.tags;
    }
    
    // Add IDE-specific configurations
    if (rule.cursor) {
      frontmatter.cursor = rule.cursor;
    }
    if (rule.windsurf) {
      frontmatter.windsurf = rule.windsurf;
    }
    if (rule.vscode) {
      frontmatter.vscode = rule.vscode;
    }
    
    return matter.stringify(rule.content, frontmatter);
  }
}
