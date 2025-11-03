import matter from 'gray-matter';
import type { IDEAdapter, CommandIR, RuleIR } from '../types/index.js';

/**
 * VSCode adapter
 * 
 * VSCode uses markdown format with YAML frontmatter for both commands and rules
 * 
 * Command format (.vscode/prompts/):
 * Markdown with YAML frontmatter containing mode, description, model, and tools
 * 
 * Rule format (.github/instructions/):
 * Markdown with YAML frontmatter containing applyTo and description
 */
export class VscodeAdapter implements IDEAdapter {
  name = 'vscode';
  commandDirPath = '.vscode/prompts';
  ruleDirPath = '.github/instructions';
  
  installationPaths = {
    darwin: [
      '/Applications/Visual Studio Code.app'
    ],
    win32: [
      '%PROGRAMFILES%\\Microsoft VS Code',
      '%PROGRAMFILES(X86)%\\Microsoft VS Code',
      '%LOCALAPPDATA%\\Programs\\Microsoft VS Code'
    ],
    linux: [
      '/usr/share/code',
      '/usr/bin/code',
      '/opt/visual-studio-code'
    ]
  };
  
  /**
   * Parse command to intermediate representation
   */
  parseCommand(content: string, filename: string): CommandIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      mode?: 'agent' | 'ask' | 'edit';
      model?: string;
      tools?: string[];
      cursor?: any;
      windsurf?: any;
      vscode?: any;
      tags?: string[];
    };
    
    return {
      name: filename.replace('.md', ''),
      description: data.description || '',
      content: parsed.content.trim(),
      tags: data.tags,
      cursor: data.cursor,
      windsurf: data.windsurf,
      vscode: data.vscode || {
        mode: data.mode,
        model: data.model,
        tools: data.tools
      }
    };
  }
  
  /**
   * Serialize command to VSCode format
   */
  serializeCommand(command: CommandIR): string {
    const vscodeConfig = command.vscode || {};
    
    const frontmatter: Record<string, any> = {
      mode: vscodeConfig.mode || 'agent',
      description: command.description,
      tools: vscodeConfig.tools || []
    };
    
    // Only add model if it exists
    if (vscodeConfig.model) {
      frontmatter.model = vscodeConfig.model;
    }
    
    return matter.stringify(command.content, frontmatter);
  }
  
  /**
   * Parse rule to intermediate representation
   */
  parseRule(content: string, filename: string): RuleIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      applyTo?: string;
      cursor?: any;
      windsurf?: any;
      vscode?: any;
      tags?: string[];
    };
    
    return {
      name: filename.replace('.md', ''),
      description: data.description || '',
      content: parsed.content.trim(),
      tags: data.tags,
      cursor: data.cursor,
      windsurf: data.windsurf,
      vscode: data.vscode || {
        applyTo: data.applyTo
      }
    };
  }
  
  /**
   * Serialize rule to VSCode format
   */
  serializeRule(rule: RuleIR): string {
    const vscodeConfig = rule.vscode || {};
    
    return matter.stringify(rule.content, {
      applyTo: vscodeConfig.applyTo || '**',
      description: rule.description
    });
  }
}
