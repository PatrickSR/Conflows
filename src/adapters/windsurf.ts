import matter from "gray-matter";
import type { IDEAdapter, CommandIR, RuleIR } from "../types/index.js";

/**
 * Windsurf IDE adapter
 *
 * Commands: Markdown with YAML frontmatter (.windsurf/workflows/)
 * Rules: Markdown with YAML frontmatter (.windsurf/rules/)
 *
 * auto_execution_mode:
 * - 1 = Safe mode
 * - 3 = Turbo mode
 * 
 * Rule modes:
 * - always = Always apply
 * - auto = Apply intelligently
 * - specific = Apply to specific files
 * - disabled = Disabled
 */
export class WindsurfAdapter implements IDEAdapter {
  name = "windsurf";
  commandDirPath = ".windsurf/workflows";
  ruleDirPath = ".windsurf/rules";
  
  /** @deprecated Use commandDirPath instead */
  get dirPath() {
    return this.commandDirPath;
  }
  
  installationPaths = {
    darwin: [
      '/Applications/Windsurf.app'
    ],
    win32: [
      '%PROGRAMFILES%\\Windsurf',
      '%PROGRAMFILES(X86)%\\Windsurf',
      '%LOCALAPPDATA%\\Programs\\Windsurf'
    ],
    linux: [
      '/usr/local/bin/windsurf',
      '/opt/windsurf',
      '~/.local/bin/windsurf',
      '~/.local/share/windsurf'
    ]
  };

  /**
   * Parse command to intermediate representation
   */
  parseCommand(content: string, filename: string): CommandIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      auto_execution_mode?: number;
      tags?: string[];
      cursor?: any;
      windsurf?: any;
      vscode?: any;
    };

    return {
      name: filename.replace(/\.(md|mdc)$/, ""),
      description: data.description || "",
      content: parsed.content.trim(),
      tags: data.tags,
      cursor: data.cursor,
      windsurf: data.windsurf || {
        auto_execution_mode: data.auto_execution_mode,
      },
      vscode: data.vscode,
    };
  }

  /**
   * Serialize command to Windsurf format
   */
  serializeCommand(command: CommandIR): string {
    const windsurfConfig = command.windsurf || {};
    const autoExecutionMode = windsurfConfig.auto_execution_mode ?? 1;

    return matter.stringify(command.content, {
      description: command.description,
      auto_execution_mode: autoExecutionMode,
    });
  }
  
  /**
   * Parse rule to intermediate representation
   */
  parseRule(content: string, filename: string): RuleIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      mode?: 'always' | 'auto' | 'specific' | 'disabled';
      patterns?: string[];
      tags?: string[];
      cursor?: any;
      windsurf?: any;
      vscode?: any;
    };

    return {
      name: filename.replace(/\.(md|mdc)$/, ""),
      description: data.description || "",
      content: parsed.content.trim(),
      tags: data.tags,
      cursor: data.cursor,
      windsurf: data.windsurf || {
        mode: data.mode,
        patterns: data.patterns,
      },
      vscode: data.vscode,
    };
  }
  
  /**
   * Serialize rule to Windsurf format
   */
  serializeRule(rule: RuleIR): string {
    const windsurfConfig = rule.windsurf || {};

    const frontmatter: Record<string, any> = {
      description: rule.description,
      mode: windsurfConfig.mode || 'auto',
    };
    
    // Only add patterns if they exist
    if (windsurfConfig.patterns && windsurfConfig.patterns.length > 0) {
      frontmatter.patterns = windsurfConfig.patterns;
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

}
